import React from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useLanguage } from '../../context/LanguageContext';
import { WifiIcon } from '@heroicons/react/24/outline';

const translations = {
    offlineTitle: { de: "Offline-Modus aktiv", en: "Offline Mode Active" },
    offlineDesc: { 
        de: "Die App funktioniert weiterhin mit gecachten Daten. Änderungen werden lokal zwischengespeichert.", 
        en: "The app continues functioning with cached data. Local updates are preserved." 
    }
};

export const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    const { t } = useLanguage();

    if (isOnline) return null;

    return (
        <div 
            role="status" 
            aria-live="polite"
            className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-xl bg-p-primary text-p-surface p-3.5 shadow-xl border border-p-accent/30 animate-fade-in print:hidden no-print"
        >
            <div className="w-8 h-8 rounded-full bg-p-warning/20 flex items-center justify-center flex-shrink-0 text-p-warning">
                <WifiIcon className="w-4 h-4" />
            </div>
            <div className="text-xs">
                <p className="font-semibold text-p-surface flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-p-warning animate-pulse" />
                    {t(translations.offlineTitle)}
                </p>
                <p className="text-p-surface/75 text-[11px] mt-0.5 leading-snug">
                    {t(translations.offlineDesc)}
                </p>
            </div>
        </div>
    );
};
