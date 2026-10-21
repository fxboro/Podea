import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role, View } from '../../types';
import LanguageToggle from '../ui/LanguageToggle';
import { 
    LockClosedIcon, 
    EnvelopeIcon, 
    UserIcon, 
    ShieldCheckIcon,
    ShieldExclamationIcon,
    SparklesIcon,
    ArrowRightIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftOnRectangleIcon,
    ArrowLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LoginProps {
    allowedRoles?: Role[];
    currentViewName?: string;
    setView?: (view: View) => void;
    onSuccess?: (role: Role) => void;
    className?: string;
    isStandalone?: boolean;
}

export const Login: React.FC<LoginProps> = ({
    allowedRoles = ['admin', 'practitioner'],
    currentViewName: rawViewName,
    setView,
    onSuccess,
    className = '',
    isStandalone = false
}) => {
    const { 
        profile, 
        role: activeRole, 
        signInWithEmail, 
        signUpWithEmail, 
        signInWithGoogle, 
        signOut, 
        demoLoginAs,
        isSecretKeyMisconfigured
    } = useAuth();
    const { t } = useLanguage();
    const currentViewName = rawViewName || t({ de: 'Studio-Bereich', en: 'Studio Area' });

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedSignupRole, setSelectedSignupRole] = useState<Role>(allowedRoles[0] || 'practitioner');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Existing RoleGate logic: check if currently authenticated user has the necessary privileges
    const isAuthorized = activeRole && (allowedRoles.includes(activeRole) || activeRole === 'admin');

    const handleRoleRedirect = (roleToRedirect: Role) => {
        if (onSuccess) {
            onSuccess(roleToRedirect);
            return;
        }
        if (setView) {
            if (roleToRedirect === 'admin') {
                setView('adminDashboard');
            } else if (roleToRedirect === 'practitioner') {
                setView('practitionerArrivals');
            } else {
                setView('tabletCheckin');
            }
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (mode === 'signin') {
                const res = await signInWithEmail(email, password);
                if (res.error) {
                    setError(res.error);
                } else {
                    const matchedRole = activeRole || allowedRoles[0] || 'practitioner';
                    handleRoleRedirect(matchedRole);
                }
            } else {
                if (!fullName.trim()) {
                    setError(t({ de: 'Bitte geben Sie Ihren vollständigen Namen ein.', en: 'Please enter your full name.' }));
                    setIsSubmitting(false);
                    return;
                }
                const res = await signUpWithEmail(email, password, fullName, selectedSignupRole);
                if (res.error) {
                    setError(res.error);
                } else {
                    handleRoleRedirect(selectedSignupRole);
                }
            }
        } catch (err: any) {
            setError(err.message || t({ de: 'Authentifizierungsfehler aufgetreten.', en: 'An authentication error occurred.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const res = await signInWithGoogle();
            if (res.error) {
                setError(res.error);
            } else {
                handleRoleRedirect(allowedRoles[0] || 'admin');
            }
        } catch (err: any) {
            setError(err.message || 'Google OAuth Fehler');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickLogin = (role: Role) => {
        demoLoginAs(role);
        handleRoleRedirect(role);
    };

    return (
        <div className={`min-h-screen bg-p-background flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 animate-fade-in relative ${className}`}>
            {/* Top Navigation Bar with Brand and Language Switcher */}
            <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-20 max-w-7xl mx-auto w-full">
                {setView ? (
                    <button
                        onClick={() => setView('roleSelector')}
                        className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-p-text/60 hover:text-p-primary transition p-2 min-h-[38px] rounded-lg hover:bg-p-stone/30 active:scale-95"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t({ de: 'Zurück', en: 'Back' })}</span>
                    </button>
                ) : <div />}
                
                <div className="flex items-center gap-2">
                    <LanguageToggle variant="compact" />
                </div>
            </header>

            {/* Central Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-p-stone text-p-primary relative overflow-hidden my-12">
                {/* Decorative Top Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-p-primary via-p-accent to-p-primary" />

                {/* RoleGate Status & Notification Banner */}
                {profile && !isAuthorized ? (
                    <div className="mb-6 p-4 rounded-xl bg-p-warning/10 border border-p-warning/30 text-left">
                        <div className="flex items-start gap-3">
                            <ShieldExclamationIcon className="w-5 h-5 text-p-warning flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-semibold text-p-primary">
                                    {t({ de: 'Eingeschränkter Zugriff (RoleGate)', en: 'Restricted Access (RoleGate)' })}
                                </p>
                                <p className="text-p-text/80 mt-1 leading-relaxed">
                                    {t({ 
                                        de: `Aktuell angemeldet als ${profile.fullName} mit Rolle "${activeRole}". ${currentViewName} erfordert Administrator- oder Behandler-Rechte.`,
                                        en: `Currently logged in as ${profile.fullName} with role "${activeRole}". ${currentViewName} requires appropriate permissions.`
                                    })}
                                </p>
                                <div className="mt-2.5 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await signOut();
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-p-warning hover:underline"
                                    >
                                        <ArrowLeftOnRectangleIcon className="w-3 h-3" />
                                        <span>{t({ de: 'Jetzt abmelden & neu einloggen', en: 'Sign out & switch account' })}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-p-accent/15 border border-p-accent/30 flex items-center justify-center text-p-primary">
                            <LockClosedIcon className="w-6 h-6 text-p-accent" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-p-primary tracking-tight">
                            {mode === 'signin' ? t({ de: 'Mitarbeiter Login', en: 'Staff Login' }) : t({ de: 'Neues Konto anlegen', en: 'Create Account' })}
                        </h2>
                        <div className="flex items-center justify-center gap-1.5 mt-1.5">
                            <span className="text-xs text-p-text/70">{currentViewName}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-p-stone/60 text-p-primary/80 border border-p-stone">
                                Supabase Auth
                            </span>
                        </div>
                    </div>
                )}

                {/* Secret Key Misconfiguration Alert */}
                {isSecretKeyMisconfigured && (
                    <div className="mb-5 p-3.5 rounded-xl bg-p-warning/15 border border-p-warning/40 text-left text-xs">
                        <div className="flex items-start gap-2.5">
                            <ShieldExclamationIcon className="w-5 h-5 text-p-warning flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-serif font-bold text-p-primary text-xs tracking-wide leading-tight">
                                    {t({ de: 'Konfigurationsfehler: Geheimer API-Key im Frontend', en: 'Configuration Error: Secret API Key in Frontend' })}
                                </p>
                                <p className="text-p-text/75 text-[11px] mt-1.5 leading-relaxed font-sans">
                                    {t({ 
                                        de: 'In VITE_SUPABASE_ANON_KEY wurde der geheime "service_role" / "secret" Schlüssel eingetragen. Supabase blockiert diesen im Browser ("Forbidden use of secret API key in browser"). Bitte ersetzen Sie ihn in Ihren Umgebungsvariablen durch den öffentlichen "anon" bzw. "publishable" Key (Supabase Dashboard -> Settings -> API -> anon public).',
                                        en: 'The secret "service_role" key was placed in VITE_SUPABASE_ANON_KEY. Supabase blocks this key in browsers ("Forbidden use of secret API key in browser"). Please replace it with the public "anon" / "publishable" key from your Supabase dashboard (Settings -> API -> anon public).'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs: Sign In / Sign Up */}
                <div className="flex rounded-xl bg-p-stone/40 p-1 mb-5 border border-p-stone/70">
                    <button
                        type="button"
                        onClick={() => { setMode('signin'); setError(null); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            mode === 'signin' 
                                ? 'bg-white text-p-primary shadow-sm font-bold' 
                                : 'text-p-text/60 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Anmelden', en: 'Sign In' })}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('signup'); setError(null); }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                            mode === 'signup' 
                                ? 'bg-white text-p-primary shadow-sm font-bold' 
                                : 'text-p-text/60 hover:text-p-primary'
                        }`}
                    >
                        {t({ de: 'Registrieren', en: 'Sign Up' })}
                    </button>
                </div>

                {/* Google OAuth Button using Supabase */}
                <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-p-stone/90 bg-white hover:bg-p-stone/20 text-p-primary text-xs font-semibold shadow-sm transition active:scale-98 mb-4 disabled:opacity-50"
                    title={t({ de: 'Mit Google Account via Supabase anmelden', en: 'Sign in with Google via Supabase' })}
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{t({ de: 'Mit Google fortfahren', en: 'Continue with Google' })}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-p-stone w-full"></div>
                    <span className="bg-white px-2.5 text-[10px] uppercase tracking-widest text-p-text/50 font-medium">
                        {t({ de: 'Oder mit E-Mail / Passwort', en: 'Or with Email / Password' })}
                    </span>
                    <div className="border-t border-p-stone w-full"></div>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-[11px] font-semibold text-p-primary mb-1">
                                {t({ de: 'Vollständiger Name', en: 'Full Name' })}
                            </label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 text-p-text/40 absolute left-3 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="z.B. Sabine Weber"
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-semibold text-p-primary mb-1">
                            {t({ de: 'E-Mail-Adresse', en: 'Email Address' })}
                        </label>
                        <div className="relative">
                            <EnvelopeIcon className="w-4 h-4 text-p-text/40 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@podea-studio.de"
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-p-primary mb-1">
                            {t({ de: 'Passwort', en: 'Password' })}
                        </label>
                        <div className="relative">
                            <LockClosedIcon className="w-4 h-4 text-p-text/40 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-p-background/50 border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-p-text/40 hover:text-p-primary"
                                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                            >
                                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div>
                            <label className="block text-[11px] font-semibold text-p-primary mb-1">
                                {t({ de: 'Zugewiesene Rolle', en: 'Assigned Role' })}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSignupRole('admin')}
                                    className={`py-2 px-3 text-xs rounded-xl border text-center transition ${
                                        selectedSignupRole === 'admin'
                                            ? 'bg-p-primary text-white border-p-primary font-semibold shadow-sm'
                                            : 'bg-white border-p-stone text-p-text/70 hover:bg-p-stone/20'
                                    }`}
                                >
                                    Studio Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSignupRole('practitioner')}
                                    className={`py-2 px-3 text-xs rounded-xl border text-center transition ${
                                        selectedSignupRole === 'practitioner'
                                            ? 'bg-p-primary text-white border-p-primary font-semibold shadow-sm'
                                            : 'bg-white border-p-stone text-p-text/70 hover:bg-p-stone/20'
                                    }`}
                                >
                                    Behandler/in
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-2.5 rounded-xl bg-p-warning/10 border border-p-warning/30 text-[11px] text-p-warning">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-p-primary text-white hover:bg-p-primary/90 text-xs font-semibold shadow-md transition active:scale-98 disabled:opacity-50"
                    >
                        <span>{mode === 'signin' ? t({ de: 'Jetzt Anmelden', en: 'Sign In Now' }) : t({ de: 'Konto Erstellen', en: 'Create Account' })}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                </form>

                {/* Beta Test Fast-Switch Bar */}
                <div className="mt-5 pt-4 border-t border-p-stone/80">
                    <p className="text-[10px] uppercase tracking-wider text-p-text/50 font-semibold mb-2 flex items-center gap-1">
                        <SparklesIcon className="w-3.5 h-3.5 text-p-accent" />
                        <span>{t({ de: 'Beta Test Schnell-Login:', en: 'Beta Test Quick-Login:' })}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('admin')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title="Als Studioleitung einloggen"
                        >
                            👑 Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('practitioner')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title="Als Behandlerin (Sabine Weber) einloggen"
                        >
                            🩺 Behandlerin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('tablet')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title="Als Kiosk Terminal einloggen"
                        >
                            📱 Kiosk
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
