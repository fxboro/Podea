import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowDownTrayIcon, ShareIcon, PlusCircleIcon, XMarkIcon, DevicePhoneMobileIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PWAInstallButtonProps {
    variant?: 'header' | 'hero' | 'floating' | 'card';
    className?: string;
}

const translations = {
    installApp: { de: "App installieren", en: "Install App" },
    installed: { de: "App installiert", en: "App Installed" },
    installShort: { de: "Installieren", en: "Install" },
    iosInstallTitle: { de: "Podea auf iPad oder iPhone installieren", en: "Install Podea on iPad or iPhone" },
    iosInstallStep1: { de: "Tippen Sie unten in der Safari-Symbolleiste auf das Teilen-Symbol", en: "Tap the Share icon in the Safari toolbar" },
    iosInstallStep2: { de: "Scrollen Sie nach unten und wählen Sie 'Zum Home-Bildschirm'", en: "Scroll down and tap 'Add to Home Screen'" },
    iosInstallStep3: { de: "Tippen Sie oben rechts auf 'Hinzufügen'. Podea startet nun als eigenständige Vollbild-App.", en: "Tap 'Add' in the top right. Podea will launch as a full-screen app." },
    close: { de: "Verstanden", en: "Got it" },
    desktopNoticeTitle: { de: "Podea als App installieren", en: "Install Podea as an App" },
    desktopNoticeDesc: { de: "Installieren Sie Podea für den schnellen Studio-Zugriff direkt von Ihrem Desktop oder Tablet.", en: "Install Podea for rapid studio access directly from your desktop or tablet." },
    desktopStep1: { de: "Klicken Sie in Ihrer Browser-Adressleiste auf das Installationssymbol (oder im Browsermenü auf 'Podea installieren').", en: "Click the Install icon in your browser address bar (or 'Install Podea' from the menu)." },
};

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
    const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
    const [showGuide, setShowGuide] = useState(false);
    const [justInstalled, setJustInstalled] = useState(false);
    const { t } = useLanguage();

    // If running in standalone mode (already installed), hide unless asked
    if (isInstalled) {
        return null;
    }

    const handleInstallClick = async () => {
        if (isInstallable) {
            const success = await install();
            if (success) {
                setJustInstalled(true);
            }
        } else {
            // If deferred prompt is not natively available (e.g. iOS Safari, or desktop preview), show guided modal
            setShowGuide(true);
        }
    };

    // Render depending on variant
    const renderButtonContent = () => {
        if (justInstalled) {
            return (
                <span className="flex items-center gap-1.5 text-p-success">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>{t(translations.installed)}</span>
                </span>
            );
        }

        if (variant === 'hero') {
            return (
                <button
                    onClick={handleInstallClick}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-p-primary text-p-surface hover:bg-p-primary/90 active:scale-95 transition-all shadow-md font-medium text-sm border border-p-accent/40 ${className}`}
                >
                    <ArrowDownTrayIcon className="w-4 h-4 text-p-accent" />
                    <span>{t(translations.installApp)}</span>
                </button>
            );
        }

        if (variant === 'card') {
            return (
                <button
                    onClick={handleInstallClick}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-p-surface border border-p-accent/40 text-p-primary hover:bg-white text-xs font-medium uppercase tracking-wider shadow-sm transition active:scale-98 ${className}`}
                >
                    <ArrowDownTrayIcon className="w-4 h-4 text-p-accent" />
                    <span>{t(translations.installApp)}</span>
                </button>
            );
        }

        // Header variant (default)
        return (
            <button
                onClick={handleInstallClick}
                title={t(translations.installApp)}
                aria-label={t(translations.installApp)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-p-accent/40 bg-p-surface/90 hover:bg-p-accent/15 text-p-primary shadow-sm active:scale-95 ${className}`}
            >
                <ArrowDownTrayIcon className="w-3.5 h-3.5 text-p-accent animate-pulse" />
                <span className="hidden sm:inline font-sans">{t(translations.installApp)}</span>
                <span className="sm:hidden font-sans">{t(translations.installShort)}</span>
            </button>
        );
    };

    return (
        <>
            {renderButtonContent()}

            {/* Guide Modal for iOS or manual install */}
            {showGuide && (
                <div 
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:hidden no-print"
                    onClick={() => setShowGuide(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-2xl bg-p-surface p-6 shadow-2xl border border-p-accent/30 text-p-primary relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative Top Accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-p-primary via-p-accent to-p-primary" />
                        
                        <div className="flex justify-between items-start mb-4 pt-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-p-primary/10 flex items-center justify-center text-p-primary border border-p-accent/20">
                                    <DevicePhoneMobileIcon className="w-5 h-5 text-p-accent" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg font-bold text-p-primary">
                                        {isIOS ? t(translations.iosInstallTitle) : t(translations.desktopNoticeTitle)}
                                    </h3>
                                    <p className="text-xs text-p-text/70 mt-0.5">Podea PWA (Progressive Web App)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuide(false)}
                                className="p-1 rounded-lg text-p-text/60 hover:text-p-primary hover:bg-p-stone/40 transition"
                                aria-label="Close"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="space-y-3.5 text-xs text-p-text my-5 bg-p-background/60 p-4 rounded-xl border border-p-stone">
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-p-accent/20 text-p-primary font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">1</span>
                                    <p className="leading-relaxed">
                                        {t(translations.iosInstallStep1)} <ShareIcon className="w-4 h-4 inline-block text-blue-600 align-text-bottom mx-1" />
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-p-accent/20 text-p-primary font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">2</span>
                                    <p className="leading-relaxed">
                                        {t(translations.iosInstallStep2)} <PlusCircleIcon className="w-4 h-4 inline-block text-p-primary align-text-bottom mx-1" />
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-p-accent/20 text-p-primary font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">3</span>
                                    <p className="leading-relaxed">
                                        {t(translations.iosInstallStep3)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs text-p-text my-5 bg-p-background/60 p-4 rounded-xl border border-p-stone">
                                <p className="leading-relaxed text-p-text/80">{t(translations.desktopNoticeDesc)}</p>
                                <div className="flex items-start gap-3 pt-1">
                                    <span className="w-5 h-5 rounded-full bg-p-accent/20 text-p-primary font-bold flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">✓</span>
                                    <p className="leading-relaxed font-medium text-p-primary">
                                        {t(translations.desktopStep1)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowGuide(false)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-p-primary text-p-surface text-xs font-medium hover:bg-p-primary/90 transition shadow active:scale-95"
                            >
                                {t(translations.close)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAInstallButton;
