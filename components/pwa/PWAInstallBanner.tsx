import React, { useState, useEffect } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowDownTrayIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import PWAInstallButton from './PWAInstallButton';

const translations = {
    bannerTitle: { de: "Podea als App installieren", en: "Install Podea as an App" },
    bannerDesc: { 
        de: "Schneller Check-in am Empfang, Vollbild-Modus & zuverlässige Offline-Unterstützung.", 
        en: "Fast reception check-in, full-screen standalone mode & reliable offline support." 
    },
    dismiss: { de: "Später", en: "Later" },
    installNow: { de: "Jetzt installieren", en: "Install Now" }
};

export const PWAInstallBanner: React.FC = () => {
    const { isInstalled } = usePWAInstall();
    const [dismissed, setDismissed] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const isDismissed = sessionStorage.getItem('podea_pwa_banner_dismissed') === 'true';
        if (isDismissed) {
            setDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem('podea_pwa_banner_dismissed', 'true');
    };

    if (isInstalled || dismissed) {
        return null;
    }

    return (
        <aside 
            aria-label="PWA Install Banner"
            className="w-full bg-gradient-to-r from-p-primary via-[#283648] to-p-primary text-p-surface border-b border-p-accent/30 py-2.5 px-4 sm:px-6 relative shadow-sm print:hidden no-print transition-all"
        >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-7 h-7 rounded-lg bg-p-accent/20 border border-p-accent/40 flex items-center justify-center flex-shrink-0 text-p-accent">
                        <SparklesIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-white mr-2">
                            {t(translations.bannerTitle)}:
                        </span>
                        <span className="text-xs text-p-surface/85 font-light">
                            {t(translations.bannerDesc)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <PWAInstallButton variant="header" className="!bg-p-accent !text-p-primary !border-none font-semibold hover:!bg-p-accent/90" />
                    <button
                        onClick={handleDismiss}
                        className="text-p-surface/60 hover:text-p-surface p-1.5 rounded-lg hover:bg-white/10 transition text-xs flex items-center"
                        title={t(translations.dismiss)}
                        aria-label="Dismiss banner"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default PWAInstallBanner;
