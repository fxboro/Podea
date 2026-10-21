import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Role, StaffMember } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.VITE_SUPABASE_PUBLIC_KEY || 
    '';

/**
 * Checks if a given key string is an explicitly forbidden JWT service_role key.
 */
export const isSecretKey = (key: string): boolean => {
    if (!key) return false;
    const trimmed = key.trim();
    // Only detect legacy JWT tokens that explicitly encode role: "service_role"
    try {
        const parts = trimmed.split('.');
        if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
            const jsonPayload = atob(padded);
            const parsed = JSON.parse(jsonPayload);
            if (parsed && parsed.role === 'service_role') {
                return true;
            }
        }
    } catch {
        // Ignore decoding error
    }
    return false;
};

/**
 * Detects whether an incompatible service key was provided.
 */
export const isSecretKeyMisconfigured = (): boolean => {
    return isSecretKey(rawSupabaseKey);
};

// Safe client-side anon key: Use the configured Supabase API key
const supabaseAnonKey = rawSupabaseKey;

// Validate if environment variables are legitimately configured with an active key
export const isSupabaseConfigured = (): boolean => {
    return Boolean(
        supabaseUrl && 
        supabaseAnonKey && 
        !supabaseUrl.includes('your-project') &&
        !supabaseAnonKey.includes('your-supabase-anon-key') &&
        !isSecretKeyMisconfigured()
    );
};

/**
 * Formats Supabase Auth error messages with clear, actionable diagnostics.
 */
export const formatSupabaseAuthError = (rawError: string): string => {
    if (!rawError) return 'Authentifizierungsfehler bei der Anfrage.';
    const lower = rawError.toLowerCase();

    if (lower.includes('forbidden use of secret api key') || lower.includes('secret api key')) {
        return 'Sicherheitswarnung: In VITE_SUPABASE_ANON_KEY wurde der geheime "service_role" / "secret" Key hinterlegt. Supabase blockiert diesen Schlüssel im Browser, da er Administrator-Vollzugriff gewährt. Bitte tragen Sie stattdessen den öffentlichen "anon" bzw. "publishable" Key ein (im Supabase Dashboard unter Project Settings -> API -> "anon" "public").';
    }
    if (lower.includes('invalid login credentials')) {
        return 'Ungültige Anmeldedaten. Bitte prüfen Sie Ihre E-Mail und Ihr Passwort.';
    }
    if (lower.includes('user already registered')) {
        return 'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melden Sie sich an.';
    }
    if (lower.includes('password should be at least')) {
        return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    }
    return rawError;
};

// Create real client or placeholder client (never initialized with a secret key)
export const supabase: SupabaseClient = createClient(
    isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-podea-preview.supabase.co',
    isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    }
);

/**
 * Fetch user profile containing application role and studio assignment from Supabase 'profiles' table.
 */
export async function getProfileFromSupabase(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn('Could not fetch Supabase profile:', error.message);
            return null;
        }

        if (data) {
            return {
                id: data.id,
                email: data.email || '',
                fullName: data.full_name || 'Mitarbeiter/in',
                role: (data.role as Role) || 'practitioner',
                studioId: data.studio_id || 'podea-main',
                avatarUrl: data.avatar_url,
                createdAt: data.created_at
            };
        }
    } catch (err) {
        console.error('Error fetching Supabase user profile:', err);
    }
    return null;
}

/**
 * Upsert or create user profile in Supabase 'profiles' table.
 */
export async function saveProfileToSupabase(profile: UserProfile): Promise<boolean> {
    if (!isSupabaseConfigured()) {
        return false;
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: profile.id,
                email: profile.email,
                full_name: profile.fullName,
                role: profile.role,
                studio_id: profile.studioId || 'podea-main',
                avatar_url: profile.avatarUrl,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error saving profile to Supabase:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception during saveProfileToSupabase:', err);
        return false;
    }
}

// Default initial studio staff roster
export const DEFAULT_STAFF_ROSTER: StaffMember[] = [
    {
        id: 'staff-elena-admin',
        email: 'elena.bergmann@podea-studio.de',
        fullName: 'Elena Bergmann',
        role: 'admin',
        specialization: 'Praxisleitung & Hygienebeauftragte',
        status: 'active',
        lastActive: 'Heute, 08:30 Uhr',
        metadata: {
            role: 'admin',
            full_name: 'Elena Bergmann',
            studio_id: 'podea-munich-01',
            specialization: 'Praxisleitung & Hygienebeauftragte'
        }
    },
    {
        id: 'staff-sabine-practitioner',
        email: 'sabine.weber@podea-studio.de',
        fullName: 'Sabine Weber',
        role: 'practitioner',
        specialization: 'Podologin (Zulassung Krankenkassen)',
        status: 'active',
        lastActive: 'Vor 15 Minuten',
        metadata: {
            role: 'practitioner',
            full_name: 'Sabine Weber',
            studio_id: 'podea-munich-01',
            specialization: 'Podologin (Zulassung Krankenkassen)'
        }
    },
    {
        id: 'staff-julia-practitioner',
        email: 'julia.becker@podea-studio.de',
        fullName: 'Julia Becker',
        role: 'practitioner',
        specialization: 'Medizinische Fußpflege & Orthonyxie',
        status: 'active',
        lastActive: 'Gestern',
        metadata: {
            role: 'practitioner',
            full_name: 'Julia Becker',
            studio_id: 'podea-munich-01',
            specialization: 'Medizinische Fußpflege & Orthonyxie'
        }
    }
];

const STAFF_STORAGE_KEY = 'podea_staff_roster';

/**
 * Fetch all staff members from Supabase profiles table, merging with local studio cache.
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
    let localStaff: StaffMember[] = DEFAULT_STAFF_ROSTER;
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = localStorage.getItem(STAFF_STORAGE_KEY);
            if (saved) {
                localStaff = JSON.parse(saved);
            } else {
                localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF_ROSTER));
            }
        }
    } catch {
        // Ignore storage read error
    }

    if (!isSupabaseConfigured()) {
        return localStaff;
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) {
            console.warn('Could not query Supabase profiles for staff roster:', error.message);
            return localStaff;
        }

        if (data && data.length > 0) {
            const remoteStaff: StaffMember[] = data
                .filter((p: any) => p.role === 'admin' || p.role === 'practitioner')
                .map((p: any) => ({
                    id: p.id,
                    email: p.email || '',
                    fullName: p.full_name || 'Mitarbeiter/in',
                    role: (p.role as 'admin' | 'practitioner'),
                    specialization: p.specialization || (p.role === 'admin' ? 'Praxisleitung' : 'Behandler/in'),
                    status: (p.status as any) || 'active',
                    invitedAt: p.created_at,
                    metadata: {
                        role: p.role,
                        full_name: p.full_name,
                        studio_id: p.studio_id || 'podea-main',
                        specialization: p.specialization
                    }
                }));

            // Merge with local staff to ensure full offline persistence
            const mergedMap = new Map<string, StaffMember>();
            localStaff.forEach(s => mergedMap.set(s.email.toLowerCase(), s));
            remoteStaff.forEach(s => mergedMap.set(s.email.toLowerCase(), s));
            const merged = Array.from(mergedMap.values());
            try {
                localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
        }
    } catch (err) {
        console.error('Error in getStaffMembers:', err);
    }

    return localStaff;
}

/**
 * Invite a new staff member and assign their role via Supabase Auth metadata.
 */
export async function inviteStaffViaSupabase(params: {
    email: string;
    fullName: string;
    role: 'admin' | 'practitioner';
    specialization?: string;
    invitedBy?: string;
    notes?: string;
}): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
    const timestamp = new Date().toISOString();
    
    // Auth metadata payload adhering to Supabase user_metadata schema
    const authMetadata: any = {
        role: params.role,
        full_name: params.fullName,
        studio_id: 'podea-munich-01',
        specialization: params.specialization || (params.role === 'admin' ? 'Praxisleitung' : 'Podologie / Fußpflege'),
        invited_by: params.invitedBy || 'Studioleitung',
        invited_at: timestamp
    };

    if (params.notes?.trim()) {
        authMetadata.notes = params.notes.trim();
    }

    const newStaff: StaffMember = {
        id: 'staff-' + Date.now(),
        email: params.email.trim().toLowerCase(),
        fullName: params.fullName.trim(),
        role: params.role,
        specialization: authMetadata.specialization,
        status: 'invited',
        invitedAt: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        notes: params.notes?.trim(),
        metadata: authMetadata
    };

    // If secret key is misconfigured, fail early with clear diagnostic
    if (isSecretKeyMisconfigured()) {
        return {
            success: false,
            error: formatSupabaseAuthError('Forbidden use of secret API key in browser')
        };
    }

    // If live Supabase is configured, dispatch user creation with metadata
    if (isSupabaseConfigured()) {
        try {
            // Attempt Supabase Auth user registration with raw_user_meta_data
            const { data, error } = await supabase.auth.signUp({
                email: newStaff.email,
                // Temporary high-entropy password for staff invitation
                password: 'Temp!' + Math.random().toString(36).substring(2, 12) + '9#',
                options: {
                    data: authMetadata,
                    emailRedirectTo: `${window.location.origin}`
                }
            });

            if (error) {
                console.warn('Supabase Auth invite note:', error.message);
                return { success: false, error: formatSupabaseAuthError(error.message) };
            } else if (data.user) {
                newStaff.id = data.user.id;
            }

            // Also record in 'profiles' table for instant queryability
            await supabase.from('profiles').upsert({
                id: newStaff.id,
                email: newStaff.email,
                full_name: newStaff.fullName,
                role: newStaff.role,
                specialization: newStaff.specialization,
                studio_id: 'podea-munich-01',
                status: 'invited',
                created_at: timestamp
            });
        } catch (err: any) {
            console.error('Exception during Supabase staff invitation:', err);
            return { success: false, error: formatSupabaseAuthError(err.message || 'Fehler beim Versenden der Einladung.') };
        }
    }

    // Persist in local roster
    try {
        const currentRoster = await getStaffMembers();
        const updated = [newStaff, ...currentRoster.filter(s => s.email.toLowerCase() !== newStaff.email.toLowerCase())];
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return { success: true, staff: newStaff };
}

/**
 * Update a staff member's role (admin <-> practitioner) in Supabase and local state.
 */
export async function updateStaffRoleInSupabase(
    id: string, 
    email: string, 
    newRole: 'admin' | 'practitioner'
): Promise<boolean> {
    try {
        const currentRoster = await getStaffMembers();
        const updated = currentRoster.map(s => {
            if (s.id === id || s.email.toLowerCase() === email.toLowerCase()) {
                return {
                    ...s,
                    role: newRole,
                    metadata: {
                        ...(s.metadata || { full_name: s.fullName, studio_id: 'podea-munich-01' }),
                        role: newRole,
                        updated_at: new Date().toISOString()
                    }
                };
            }
            return s;
        });

        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));

        if (isSupabaseConfigured()) {
            await supabase
                .from('profiles')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('email', email);
        }
        return true;
    } catch (err) {
        console.error('Error updating staff role:', err);
        return false;
    }
}

/**
 * Remove a staff member from the studio roster.
 */
export async function removeStaffMemberFromSupabase(id: string, email: string): Promise<boolean> {
    try {
        const currentRoster = await getStaffMembers();
        const updated = currentRoster.filter(s => s.id !== id && s.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));

        if (isSupabaseConfigured()) {
            await supabase
                .from('profiles')
                .delete()
                .eq('email', email);
        }
        return true;
    } catch (err) {
        console.error('Error removing staff member:', err);
        return false;
    }
}
