import React, { useState } from 'react';
import Card from '../ui/Card';
import { View, Role } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
    UserCircleIcon, 
    ClipboardDocumentListIcon as ClipboardListIcon, 
    DeviceTabletIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import PWAInstallButton from '../pwa/PWAInstallButton';
import LanguageToggle from '../ui/LanguageToggle';
import AuthModal from '../auth/AuthModal';

const translations = {
    title: { de: "Wählen Sie Ihre Rolle", en: "Choose Your Role" },
    admin: { de: "Studio Admin", en: "Studio Admin" },
    adminDesc: { de: "Verwalten Sie Termine, Einstellungen und sehen Sie die Tagesübersicht.", en: "Manage appointments, settings, and see the daily overview." },
    practitioner: { de: "Behandler/in", en: "Practitioner" },
    practitionerDesc: { de: "Sehen Sie Ihre ankommenden Kunden und deren Details.", en: "See your arriving clients and their details." },
    tablet: { de: "Check-in Tablet", en: "Check-in Tablet" },
    tabletDesc: { de: "Starten Sie den Selbst-Check-in-Modus für Kunden.", en: "Start the self check-in mode for clients." },
    back: { de: "← Zurück", en: "← Back" },
    loginBtn: { de: "Mitarbeiter Login", en: "Staff Login" },
    activeBadge: { de: "Aktiv", en: "Active" }
};

const RoleSelector: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { t } = useLanguage();
    const { role: activeRole, profile, signOut } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [targetRoleForAuth, setTargetRoleForAuth] = useState<Role>('admin');

    const handleRoleClick = (role: Role, view: View) => {
        // Direct navigation: RoleGate will seamlessly display the Login component if unauthenticated or wrong role
        setView(view);
    };

    const roles = [
        { 
            name: t(translations.admin),
            role: 'admin' as Role,
            description: t(translations.adminDesc),
            icon: <UserCircleIcon className="w-12 h-12 text-p-primary/80"/>,
            view: 'adminDashboard' as View,
            requiresAuth: true
        },
        { 
            name: t(translations.practitioner),
            role: 'practitioner' as Role,
            description: t(translations.practitionerDesc),
            icon: <ClipboardListIcon className="w-12 h-12 text-p-primary/80"/>,
            view: 'practitionerArrivals' as View,
            requiresAuth: true
        },
        { 
            name: t(translations.tablet),
            role: 'tablet' as Role,
            description: t(translations.tabletDesc),
            icon: <DeviceTabletIcon className="w-12 h-12 text-p-primary/80"/>,
            view: 'tabletCheckin' as View,
            requiresAuth: false
        },
    ];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-p-background p-4 sm:p-6 py-8 sm:py-12">
            {/* Top Bar with Language Switcher and Auth Status */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2 sm:gap-3">
                <LanguageToggle variant="compact" />
                {profile ? (
                    <div className="flex items-center gap-2 bg-white/90 border border-p-stone rounded-xl py-1 px-3 shadow-sm text-xs">
                        <span className="w-2 h-2 rounded-full bg-p-success animate-pulse"></span>
                        <span className="font-semibold text-p-primary truncate max-w-[120px]">{profile.fullName.split(' ')[0]}</span>
                        <span className="text-[10px] text-p-text/60 uppercase">({profile.role})</span>
                    </div>
                ) : (
                    <button
                        onClick={() => setView('login')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-p-stone hover:bg-p-stone/30 text-xs font-semibold text-p-primary shadow-sm transition active:scale-95"
                    >
                        <LockClosedIcon className="w-3.5 h-3.5 text-p-accent" />
                        <span>{t(translations.loginBtn)}</span>
                    </button>
                )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide text-p-primary mb-2 sm:mb-4">Podea</h1>
            <h2 className="text-p-text mb-8 sm:mb-14 tracking-widest uppercase text-xs font-semibold">{t(translations.title)}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 w-full max-w-6xl">
                {roles.map(r => {
                    const isRoleActive = activeRole === r.role;
                    return (
                        <Card 
                            key={r.view} 
                            onClick={() => handleRoleClick(r.role, r.view)} 
                            className={`text-center group py-6 sm:py-12 px-5 sm:px-8 flex flex-col items-center h-full hover:bg-white active:scale-[0.98] transition-all duration-200 cursor-pointer relative ${
                                isRoleActive ? 'ring-2 ring-p-accent shadow-md' : ''
                            }`}
                        >
                            {isRoleActive && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-p-accent/20 text-p-primary border border-p-accent/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase">
                                    <CheckCircleIcon className="w-3 h-3 text-p-accent" />
                                    <span>{t(translations.activeBadge)}</span>
                                </div>
                            )}

                            <div className="mb-4 sm:mb-8 p-3 sm:p-4 rounded-full bg-p-background group-hover:bg-p-accent/10 transition-colors duration-300">
                                {r.icon}
                            </div>
                            <h3 className="text-lg sm:text-2xl font-serif text-p-primary mb-1.5 sm:mb-4">{r.name}</h3>
                            <p className="text-p-text/70 leading-relaxed font-light text-xs sm:text-base mb-4">{r.description}</p>
                            
                            <div className="mt-auto pt-2 text-[11px] font-semibold text-p-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span>{r.requiresAuth && !isRoleActive ? t({ de: 'Mit Supabase Auth starten', en: 'Start with Supabase Auth' }) : t({ de: 'Öffnen', en: 'Open' })}</span>
                                <ArrowRightIcon className="w-3 h-3" />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <LanguageToggle variant="default" className="sm:hidden" />
                <PWAInstallButton variant="header" className="!px-4 !py-2 !text-xs font-semibold" />
                <button 
                    onClick={() => setView('landing')} 
                    className="text-xs sm:text-sm text-p-text/60 hover:text-p-primary transition uppercase tracking-widest py-2.5 px-5 rounded-lg hover:bg-p-stone/40 min-h-[44px] flex items-center active:scale-95"
                >
                    {t(translations.back)}
                </button>
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialRole={targetRoleForAuth}
                onSuccess={(chosenRole) => {
                    if (chosenRole === 'admin') {
                        setView('adminDashboard');
                    } else if (chosenRole === 'practitioner') {
                        setView('practitionerArrivals');
                    } else {
                        setView('tabletCheckin');
                    }
                }}
            />
        </div>
    );
};

export default RoleSelector;
