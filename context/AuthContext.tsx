import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { 
    supabase, 
    isSupabaseConfigured, 
    isSecretKeyMisconfigured, 
    formatSupabaseAuthError, 
    getProfileFromSupabase, 
    saveProfileToSupabase 
} from '../services/supabase';
import { Role, UserProfile } from '../types';

export interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    role: Role | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isPractitioner: boolean;
    isTablet: boolean;
    isConfigured: boolean;
    isSecretKeyMisconfigured: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    signUpWithEmail: (email: string, password: string, fullName: string, role?: Role) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    demoLoginAs: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for instantaneous role hydration and persistent offline capability
const STORAGE_KEYS = {
    PROFILE: 'podea_cached_profile',
    ROLE: 'podea_active_role',
};

// Fixtures for immediate Beta testing & sandbox preview
const DEMO_PROFILES: Record<Role, UserProfile> = {
    admin: {
        id: 'demo-admin-id',
        email: 'admin@podea-studio.de',
        fullName: 'Elena Bergmann (Studioleitung)',
        role: 'admin',
        studioId: 'podea-munich-01',
    },
    practitioner: {
        id: 'demo-practitioner-id',
        email: 'sabine.weber@podea-studio.de',
        fullName: 'Sabine Weber (Podologin)',
        role: 'practitioner',
        studioId: 'podea-munich-01',
    },
    tablet: {
        id: 'demo-tablet-id',
        email: 'empfang-tablet@podea-studio.de',
        fullName: 'Check-in Terminal 1 (Empfang)',
        role: 'tablet',
        studioId: 'podea-munich-01',
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const isConfigured = isSupabaseConfigured();

    // 1. Initial State: Synchronous hydration from localStorage to prevent screen flicker
    const [profile, setProfileState] = useState<UserProfile | null>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const cachedProfileStr = localStorage.getItem(STORAGE_KEYS.PROFILE);
                if (cachedProfileStr) {
                    const parsed = JSON.parse(cachedProfileStr);
                    if (parsed && parsed.role) {
                        return parsed;
                    }
                }
                const cachedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as Role | null;
                if (cachedRole && DEMO_PROFILES[cachedRole]) {
                    return DEMO_PROFILES[cachedRole];
                }
            }
        } catch {
            // Ignore storage read exceptions
        }
        return null;
    });

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Sync state helper with localStorage persistence
    const setProfile = useCallback((newProfile: UserProfile | null) => {
        setProfileState(newProfile);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                if (newProfile) {
                    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
                    localStorage.setItem(STORAGE_KEYS.ROLE, newProfile.role);
                } else {
                    localStorage.removeItem(STORAGE_KEYS.PROFILE);
                    localStorage.removeItem(STORAGE_KEYS.ROLE);
                }
            }
        } catch {
            // Ignore storage write exceptions
        }
    }, []);

    // 2. Load User Profile from Supabase or generate fallback from Auth User metadata
    const loadUserProfile = useCallback(async (supabaseUser: User): Promise<UserProfile> => {
        // Attempt retrieval from public.profiles table
        const dbProfile = await getProfileFromSupabase(supabaseUser.id);
        if (dbProfile) {
            setProfile(dbProfile);
            return dbProfile;
        }

        // Fallback: extract role and details from user_metadata or app_metadata
        const metaRole = (
            supabaseUser.app_metadata?.role || 
            supabaseUser.user_metadata?.role || 
            'practitioner'
        ) as Role;

        const metaName = 
            supabaseUser.user_metadata?.full_name || 
            supabaseUser.email?.split('@')[0] || 
            'Mitarbeiter/in';

        const synthesizedProfile: UserProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            fullName: metaName,
            role: metaRole,
            studioId: supabaseUser.user_metadata?.studio_id || 'podea-main',
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
            createdAt: supabaseUser.created_at
        };

        setProfile(synthesizedProfile);
        // Persist back to Supabase profiles table in background
        saveProfileToSupabase(synthesizedProfile).catch(err => {
            console.warn('Profile background sync deferred:', err);
        });

        return synthesizedProfile;
    }, [setProfile]);

    // 3. Supabase Auth Lifecycle & Session Persistence
    useEffect(() => {
        let isMounted = true;

        const initializeSession = async () => {
            if (!isConfigured) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch active session from Supabase (backed by localStorage)
                const { data: { session: existingSession }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.warn('Supabase getSession error:', error.message);
                }

                if (isMounted) {
                    if (existingSession) {
                        setSession(existingSession);
                        setUser(existingSession.user);
                        if (existingSession.user) {
                            await loadUserProfile(existingSession.user);
                        }
                    } else {
                        // If no session exists in Supabase and we are in live mode, clear cached profile
                        setSession(null);
                        setUser(null);
                        // Retain demo profile only if explicitly set
                        const cachedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
                        if (!cachedRole || !DEMO_PROFILES[cachedRole as Role]) {
                            setProfile(null);
                        }
                    }
                }
            } catch (err) {
                console.error('Error during Supabase session initialization:', err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initializeSession();

        // Subscribe to real-time authentication changes from Supabase
        if (isConfigured) {
            const { data: authSubscription } = supabase.auth.onAuthStateChange(
                async (event: AuthChangeEvent, currentSession: Session | null) => {
                    if (!isMounted) return;

                    setSession(currentSession);
                    setUser(currentSession?.user ?? null);

                    if (event === 'SIGNED_OUT' || !currentSession?.user) {
                        setProfile(null);
                        setIsLoading(false);
                    } else if (
                        event === 'SIGNED_IN' || 
                        event === 'INITIAL_SESSION' || 
                        event === 'TOKEN_REFRESHED' || 
                        event === 'USER_UPDATED'
                    ) {
                        if (currentSession.user) {
                            await loadUserProfile(currentSession.user);
                        }
                        setIsLoading(false);
                    }
                }
            );

            return () => {
                isMounted = false;
                authSubscription.subscription.unsubscribe();
            };
        }

        return () => {
            isMounted = false;
        };
    }, [isConfigured, loadUserProfile, setProfile]);

    // 4. Authentication Action Handlers
    const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
        setIsLoading(true);

        if (!isConfigured) {
            setIsLoading(false);
            const lower = email.toLowerCase();
            let matchedRole: Role = 'practitioner';
            if (lower.includes('admin') || lower.includes('inhaber') || lower.includes('leitung')) {
                matchedRole = 'admin';
            } else if (lower.includes('tablet') || lower.includes('empfang') || lower.includes('kiosk')) {
                matchedRole = 'tablet';
            }

            const mockProfile: UserProfile = {
                id: 'mock-' + Date.now(),
                email,
                fullName: email.split('@')[0] || 'Podea Team',
                role: matchedRole,
                studioId: 'podea-main'
            };
            setProfile(mockProfile);
            return { error: null };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setIsLoading(false);
                return { error: formatSupabaseAuthError(error.message) };
            }

            if (data.user) {
                await loadUserProfile(data.user);
            }
            setIsLoading(false);
            return { error: null };
        } catch (err: any) {
            setIsLoading(false);
            return { error: formatSupabaseAuthError(err.message || 'Authentifizierungsfehler bei der Anmeldung') };
        }
    };

    const signUpWithEmail = async (
        email: string, 
        password: string, 
        fullName: string, 
        selectedRole: Role = 'practitioner'
    ): Promise<{ error: string | null }> => {
        setIsLoading(true);

        if (!isConfigured) {
            setIsLoading(false);
            const mockProfile: UserProfile = {
                id: 'mock-' + Date.now(),
                email,
                fullName,
                role: selectedRole,
                studioId: 'podea-main'
            };
            setProfile(mockProfile);
            return { error: null };
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: selectedRole,
                        studio_id: 'podea-main'
                    }
                }
            });

            if (error) {
                setIsLoading(false);
                return { error: formatSupabaseAuthError(error.message) };
            }

            if (data.user) {
                const newProfile: UserProfile = {
                    id: data.user.id,
                    email,
                    fullName,
                    role: selectedRole,
                    studioId: 'podea-main'
                };
                setProfile(newProfile);
                await saveProfileToSupabase(newProfile);
            }

            setIsLoading(false);
            return { error: null };
        } catch (err: any) {
            setIsLoading(false);
            return { error: formatSupabaseAuthError(err.message || 'Fehler bei der Registrierung') };
        }
    };

    const signInWithGoogle = async (): Promise<{ error: string | null }> => {
        if (!isConfigured) {
            demoLoginAs('admin');
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                return { error: formatSupabaseAuthError(error.message) };
            }
            return { error: null };
        } catch (err: any) {
            return { error: formatSupabaseAuthError(err.message || 'Google Authentifizierung fehlgeschlagen') };
        }
    };

    const sendPasswordResetEmail = async (email: string): Promise<{ error: string | null }> => {
        if (!isConfigured) {
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) {
                return { error: formatSupabaseAuthError(error.message) };
            }
            return { error: null };
        } catch (err: any) {
            return { error: formatSupabaseAuthError(err.message || 'Passwort-Zurücksetzen fehlgeschlagen') };
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            if (isConfigured) {
                await supabase.auth.signOut();
            }
        } catch (err) {
            console.warn('SignOut exception handled:', err);
        } finally {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await loadUserProfile(user);
        }
    };

    const demoLoginAs = (demoRole: Role) => {
        const selected = DEMO_PROFILES[demoRole];
        setProfile(selected);
    };

    // Derived role states for convenient consumption across views
    const role: Role | null = profile?.role ?? null;
    const isAuthenticated: boolean = Boolean(user || profile);
    const isAdmin: boolean = role === 'admin';
    const isPractitioner: boolean = role === 'practitioner' || role === 'admin';
    const isTablet: boolean = role === 'tablet';

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                role,
                session,
                isLoading,
                isAuthenticated,
                isAdmin,
                isPractitioner,
                isTablet,
                isConfigured,
                isSecretKeyMisconfigured: isSecretKeyMisconfigured(),
                signInWithEmail,
                signUpWithEmail,
                signInWithGoogle,
                sendPasswordResetEmail,
                signOut,
                refreshProfile,
                demoLoginAs,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
