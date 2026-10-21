import React, { useState } from 'react';
import { View } from '../../types';
import { ArrowLeftOnRectangleIcon as LogoutIcon, UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import PWAInstallButton from '../pwa/PWAInstallButton';
import LanguageToggle from '../ui/LanguageToggle';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

interface AppHeaderProps {
    title: string;
    role: string;
    setView: (view: View) => void;
    rightAction?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, role, setView, rightAction }) => {
    const { t } = useLanguage();
    const { profile, signOut } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setView('roleSelector');
    };

    return (
        <header className="bg-p-background/85 backdrop-blur-md sticky top-0 z-30 border-b border-p-stone/40 print:hidden no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex justify-between items-center gap-2 sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-serif text-p-primary truncate">{title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-p-text/60 truncate">{role}</p>
                        {profile && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-p-accent bg-p-accent/10 px-2 py-0.5 rounded-full border border-p-accent/20">
                                <span>{profile.fullName.split(' ')[0]}</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                    <LanguageToggle variant="compact" />
                    <PWAInstallButton variant="header" />
                    {rightAction}

                    {profile ? (
                        <button 
                            onClick={handleSignOut}
                            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-p-text/60 hover:text-p-warning transition-colors p-2 rounded-lg hover:bg-p-warning/5 min-h-[38px] justify-center active:scale-95"
                            title={t({ de: "Abmelden", en: "Sign out" })}
                            aria-label="Sign out"
                        >
                            <LogoutIcon className="w-4 h-4"/>
                            <span className="hidden sm:inline">{t({ de: "Abmelden", en: "Sign out" })}</span>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsAuthModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-p-primary text-white hover:bg-p-primary/90 transition shadow-sm active:scale-95 min-h-[34px]"
                            title={t({ de: "Mitarbeiter Login", en: "Staff Login" })}
                        >
                            <LockClosedIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Login</span>
                        </button>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </header>
    );
};

export default AppHeader;
