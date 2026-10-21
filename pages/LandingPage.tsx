
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import LanguageToggle from '../components/ui/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import { 
    ShieldCheckIcon, 
    CloudIcon, 
    UserGroupIcon, 
    DeviceTabletIcon, 
    ClipboardDocumentListIcon as ClipboardListIcon, 
    SparklesIcon, 
    ChartBarIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import PWAInstallButton from '../components/pwa/PWAInstallButton';
import AuthModal from '../components/auth/AuthModal';

const translations = {
    heroTitle: { de: "Wo Ankommen zur Fürsorge wird.", en: "Where Arrival Becomes Care." },
    heroSubtitle: { de: "Podea ist die intelligente Check-in- und Compliance-Plattform für medizinische Fußpflege-, Wellness- und Beauty-Studios.", en: "Podea is the intelligent check-in and compliance platform for medical foot care, wellness, and beauty studios." },
    ctaDemo: { de: "Demo erleben", en: "Experience Demo" },
    ctaContact: { de: "Kontakt aufnehmen", en: "Get in Touch" },
    trustGDPR: { de: "DSGVO-konform", en: "GDPR Compliant" },
    trustHosting: { de: "EU-Hosting", en: "EU Hosting" },
    trustDeveloped: { de: "Praxisnah entwickelt", en: "Practitioner-Developed" },
    trustOptimized: { de: "Tablet & Desktop optimiert", en: "Tablet & Desktop Optimized" },
    problemTitle: { de: "Der erste Moment entscheidet.", en: "The First Moment Matters." },
    problemText: { de: "Papierkram am Empfang, übersehene medizinische Hinweise und verpasste Chancen. Der Check-in-Prozess ist oft stressig und ineffizient – für Ihre Kunden und Ihr Team.", en: "Paperwork at reception, overlooked medical notes, and missed opportunities. The check-in process is often stressful and inefficient—for your clients and your team." },
    solutionTitle: { de: "Ein nahtloses Erlebnis, das Vertrauen schafft.", en: "A Seamless Experience That Builds Trust." },
    feature1Title: { de: "Digitaler Check-in", en: "Digital Check-in" },
    feature1Text: { de: "Ein eleganter, papierloser Anmeldeprozess auf dem Tablet.", en: "An elegant, paperless check-in process on a tablet." },
    feature2Title: { de: "Medizinische Sicherheit", en: "Medical Safety" },
    feature2Text: { de: "Wichtige Gesundheits-Updates werden digital erfasst und hervorgehoben.", en: "Important health updates are captured and highlighted digitally." },
    feature3Title: { de: "Intelligente Empfehlungen", en: "Intelligent Recommendations" },
    feature3Text: { de: "Passende Zusatzleistungen und Produkte dezent vorschlagen.", en: "Subtly suggest suitable add-on services and products." },
    feature4Title: { de: "Professionelle Übersicht", en: "Professional Overview" },
    feature4Text: { de: "Alle wichtigen Tagesinformationen auf einen Blick im Dashboard.", en: "All key daily information at a glance on the dashboard." },
    audienceTitle: { de: "Für Profis, die Wert auf Qualität legen.", en: "For Professionals Who Value Quality." },
    audience1: { de: "Medizinische Fußpflege", en: "Medical Foot Care" },
    audience2: { de: "Kosmetik & Hautpflege", en: "Cosmetics & Skincare" },
    audience3: { de: "Friseur & Barber", en: "Hairdresser & Barber" },
    audience4: { de: "Wellness & Massage", en: "Wellness & Massage" },
    finalCtaTitle: { de: "Erleben Sie Podea selbst.", en: "Experience Podea for Yourself." },
    finalCtaButton: { de: "Demo starten", en: "Start Demo" },
};

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-p-background border border-p-accent/20 text-p-accent mb-6 shadow-sm">
        {children}
    </div>
);

const LandingPage: React.FC<{ onStartDemo: () => void }> = ({ onStartDemo }) => {
    const { t } = useLanguage();
    const { profile } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    const trustIndicators = [
        { icon: <ShieldCheckIcon className="h-5 w-5" />, text: t(translations.trustGDPR) },
        { icon: <CloudIcon className="h-5 w-5" />, text: t(translations.trustHosting) },
        { icon: <UserGroupIcon className="h-5 w-5" />, text: t(translations.trustDeveloped) },
        { icon: <DeviceTabletIcon className="h-5 w-5" />, text: t(translations.trustOptimized) },
    ];
    
    const features = [
        { icon: <DeviceTabletIcon className="h-6 w-6"/>, title: t(translations.feature1Title), text: t(translations.feature1Text) },
        { icon: <ShieldCheckIcon className="h-6 w-6"/>, title: t(translations.feature2Title), text: t(translations.feature2Text) },
        { icon: <SparklesIcon className="h-6 w-6"/>, title: t(translations.feature3Title), text: t(translations.feature3Text) },
        { icon: <ChartBarIcon className="h-6 w-6"/>, title: t(translations.feature4Title), text: t(translations.feature4Text) },
    ];

    const audiences = [
      t(translations.audience1),
      t(translations.audience2),
      t(translations.audience3),
      t(translations.audience4),
    ];

    return (
        <div className="text-p-primary font-sans bg-p-background selection:bg-p-accent selection:text-white relative flex flex-col min-h-full">
            <header className="w-full z-20 px-4 sm:px-6 py-3 sm:py-4 bg-p-background/90 backdrop-blur-md sticky top-0 border-b border-p-stone/40">
                <div className="container mx-auto flex justify-between items-center gap-2 sm:gap-3">
                    <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-wide text-p-primary flex-shrink-0">Podea</h1>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <LanguageToggle />
                        <PWAInstallButton variant="header" />
                        {profile ? (
                            <button
                                onClick={onStartDemo}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-p-stone hover:bg-p-stone/20 text-xs font-semibold text-p-primary shadow-sm transition active:scale-95"
                            >
                                <span className="w-2 h-2 rounded-full bg-p-success"></span>
                                <span className="hidden sm:inline">{profile.fullName.split(' ')[0]}</span>
                                <span className="text-[10px] text-p-text/60">({profile.role})</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setAuthModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-p-stone hover:bg-p-stone/20 text-xs font-semibold text-p-primary shadow-sm transition active:scale-95"
                                title={t({ de: "Mitarbeiter Login", en: "Staff Login" })}
                            >
                                <LockClosedIcon className="w-3.5 h-3.5 text-p-accent" />
                                <span className="hidden sm:inline">{t({ de: "Mitarbeiter Login", en: "Staff Login" })}</span>
                                <span className="sm:hidden">{t({ de: "Login", en: "Login" })}</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative min-h-[75vh] flex items-center py-10 sm:py-16 md:py-20">
                    <div className="container mx-auto px-4 text-center">
                        <span className="inline-block py-1 px-3 rounded-full border border-p-primary/20 text-xs font-semibold tracking-widest uppercase mb-6 text-p-primary/70">
                            {t({ de: "Für moderne Studios", en: "For Modern Studios" })}
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl text-p-primary leading-[1.1] max-w-4xl mx-auto mb-8">
                            {t(translations.heroTitle)}
                        </h1>
                        <p className="text-lg md:text-xl text-p-text/80 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                            {t(translations.heroSubtitle)}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="primary" className="w-full sm:w-auto min-w-[160px]" onClick={onStartDemo}>{t(translations.ctaDemo)}</Button>
                            <PWAInstallButton variant="hero" className="w-full sm:w-auto min-w-[160px]" />
                            <Button variant="secondary" className="w-full sm:w-auto min-w-[160px]">{t(translations.ctaContact)}</Button>
                        </div>
                    </div>
                </section>

                {/* Trust Indicators - Subtle divider */}
                <section className="py-12 border-y border-p-primary/5 bg-white/40 backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {trustIndicators.map((item, index) => (
                                <div key={index} className="flex flex-col items-center gap-3 text-p-primary/80 group">
                                    <div className="text-p-primary/60 group-hover:text-p-accent transition-colors duration-300">{item.icon}</div>
                                    <span className="font-medium text-xs tracking-wider uppercase">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Problem & Solution Section */}
                <section className="py-24 md:py-36">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div className="text-center md:text-left order-2 md:order-1">
                            <h2 className="font-serif text-4xl md:text-5xl text-p-primary mb-6">{t(translations.problemTitle)}</h2>
                            <p className="text-lg text-p-text/80 leading-relaxed font-light">{t(translations.problemText)}</p>
                        </div>
                        <div className="order-1 md:order-2">
                             <div className="relative">
                                <div className="absolute -inset-4 bg-p-accent/10 rounded-2xl transform rotate-3"></div>
                                <img src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=800" alt="Calm studio reception" className="relative rounded-lg shadow-soft grayscale-[20%] sepia-[10%]"/>
                             </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 md:py-36 bg-white">
                     <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="font-serif text-4xl md:text-5xl text-p-primary mb-4">{t(translations.solutionTitle)}</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {features.map((feature, index) => (
                                <div key={index} className="text-center group">
                                    <IconWrapper>{feature.icon}</IconWrapper>
                                    <h3 className="font-serif text-2xl text-p-primary mb-3">{feature.title}</h3>
                                    <p className="text-sm text-p-text leading-relaxed">{feature.text}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                </section>

                {/* Target Audience */}
                <section className="py-24 md:py-36 bg-p-background">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-serif text-3xl md:text-4xl text-p-primary mb-16">{t(translations.audienceTitle)}</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {audiences.map((audience, index) => (
                                <div key={index} className="bg-white border border-p-stone/50 rounded-xl p-8 flex items-center justify-center font-medium text-p-primary text-center shadow-sm hover:shadow-soft hover:border-p-accent/30 transition-all duration-300">
                                    {audience}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-p-primary text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="font-serif text-4xl md:text-5xl mb-10">{t(translations.finalCtaTitle)}</h2>
                        <div>
                            <Button variant="accent" onClick={onStartDemo} className="min-w-[200px] text-base">{t(translations.finalCtaButton)}</Button>
                        </div>
                    </div>
                </section>
            </main>
             <footer className="py-12 bg-p-background border-t border-p-primary/10">
                <div className="container mx-auto px-4 text-center text-xs text-p-text/60 tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Podea. Engineered in Germany.
                </div>
            </footer>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={() => onStartDemo()}
            />
        </div>
    );
};

export default LandingPage;
