import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Role } from '../../types';
import { 
    XMarkIcon, 
    LockClosedIcon, 
    EnvelopeIcon, 
    UserIcon, 
    ShieldCheckIcon,
    SparklesIcon,
    ArrowRightIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRole?: Role;
    onSuccess?: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
    isOpen, 
    onClose, 
    initialRole = 'admin',
    onSuccess 
}) => {
    const { 
        signInWithEmail, 
        signUpWithEmail, 
        signInWithGoogle, 
        demoLoginAs, 
        isConfigured 
    } = useAuth();
    const { t } = useLanguage();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<Role>(initialRole);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (mode === 'signin') {
                const res = await signInWithEmail(email, password);
                if (res.error) {
                    setError(res.error);
                } else {
                    onSuccess?.(role);
                    onClose();
                }
            } else {
                if (!fullName.trim()) {
                    setError(t({ de: 'Bitte geben Sie Ihren vollständigen Namen ein.', en: 'Please enter your full name.' }));
                    setIsSubmitting(false);
                    return;
                }
                const res = await signUpWithEmail(email, password, fullName, role);
                if (res.error) {
                    setError(res.error);
                } else {
                    onSuccess?.(role);
                    onClose();
                }
            }
        } catch (err: any) {
            setError(err.message || t({ de: 'Ein unerwarteter Fehler ist aufgetreten.', en: 'An unexpected error occurred.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsSubmitting(true);
        const res = await signInWithGoogle();
        if (res.error) {
            setError(res.error);
            setIsSubmitting(false);
        } else {
            onSuccess?.('admin');
            onClose();
        }
    };

    const handleQuickLogin = (quickRole: Role) => {
        demoLoginAs(quickRole);
        onSuccess?.(quickRole);
        onClose();
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden no-print"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md rounded-2xl bg-p-surface p-6 sm:p-8 shadow-2xl border border-p-stone text-p-primary relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Top Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-p-primary via-p-accent to-p-primary" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-p-text/60 hover:text-p-primary hover:bg-p-stone/40 transition active:scale-95"
                    aria-label={t({ de: "Schließen", en: "Close" })}
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6 pt-1">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-p-accent/15 border border-p-accent/30 flex items-center justify-center text-p-primary">
                        <LockClosedIcon className="w-6 h-6 text-p-accent" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-p-primary tracking-tight">
                        {mode === 'signin' ? t({ de: 'Mitarbeiter Login', en: 'Staff Sign In' }) : t({ de: 'Neues Konto anlegen', en: 'Create Account' })}
                    </h2>
                    <p className="text-xs text-p-text/70 mt-1">
                        {t({ de: 'Sicherer Supabase-Zugang für Studio-Team & Praxisleitung', en: 'Secure Supabase access for studio team & practice management' })}
                    </p>
                </div>

                {/* Mode Selector (Anmelden / Registrieren) */}
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

                {/* Google OAuth Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-p-stone/90 bg-white hover:bg-p-stone/20 text-p-primary text-xs font-semibold shadow-sm transition active:scale-98 mb-4 disabled:opacity-50"
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
                    <span className="bg-p-surface px-2.5 text-[10px] uppercase tracking-widest text-p-text/50 font-medium">
                        {t({ de: 'Oder mit E-Mail', en: 'Or with Email' })}
                    </span>
                    <div className="border-t border-p-stone w-full"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
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
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
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
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
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
                                placeholder={t({ de: 'Mindestens 6 Zeichen', en: 'At least 6 characters' })}
                                className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-white border border-p-stone/80 text-p-primary focus:outline-none focus:border-p-accent shadow-inner placeholder:text-p-text/30"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-p-text/40 hover:text-p-primary"
                                aria-label={showPassword ? t({ de: "Passwort verbergen", en: "Hide password" }) : t({ de: "Passwort anzeigen", en: "Show password" })}
                            >
                                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <div>
                            <label className="block text-[11px] font-semibold text-p-primary mb-1">
                                {t({ de: 'Gewünschte Rolle', en: 'Desired Role' })}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`py-2 px-3 text-xs rounded-xl border text-center transition ${
                                        role === 'admin'
                                            ? 'bg-p-primary text-white border-p-primary font-semibold shadow-sm'
                                            : 'bg-white border-p-stone text-p-text/70 hover:bg-p-stone/20'
                                    }`}
                                >
                                    {t({ de: 'Studio Admin', en: 'Studio Admin' })}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('practitioner')}
                                    className={`py-2 px-3 text-xs rounded-xl border text-center transition ${
                                        role === 'practitioner'
                                            ? 'bg-p-primary text-white border-p-primary font-semibold shadow-sm'
                                            : 'bg-white border-p-stone text-p-text/70 hover:bg-p-stone/20'
                                    }`}
                                >
                                    {t({ de: 'Behandler/in', en: 'Practitioner' })}
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

                {/* Beta Quick-Login Bar */}
                <div className="mt-5 pt-4 border-t border-p-stone/80">
                    <p className="text-[10px] uppercase tracking-wider text-p-text/50 font-semibold mb-2 flex items-center gap-1">
                        <SparklesIcon className="w-3.5 h-3.5 text-p-accent" />
                        <span>{t({ de: 'Beta Test Schnell-Login:', en: 'Beta Test Quick Login:' })}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('admin')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title={t({ de: "Als Studioleitung einloggen", en: "Log in as Studio Admin" })}
                        >
                            👑 {t({ de: 'Admin', en: 'Admin' })}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('practitioner')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title={t({ de: "Als Behandlerin (Sabine Weber) einloggen", en: "Log in as Practitioner (Sabine Weber)" })}
                        >
                            🩺 {t({ de: 'Behandlerin', en: 'Practitioner' })}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('tablet')}
                            className="py-1.5 px-2 rounded-lg bg-p-background border border-p-stone hover:bg-white text-[10px] font-medium text-p-primary transition hover:border-p-accent active:scale-95"
                            title={t({ de: "Als Kiosk-Terminal einloggen", en: "Log in as Kiosk Terminal" })}
                        >
                            📱 {t({ de: 'Kiosk', en: 'Kiosk' })}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
