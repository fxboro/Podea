import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingPage.css';

// SVG Icons
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const KioskIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Translation Dictionary for Landing Page Copy
const localTranslations = {
  de: {
    navFeatures: 'Funktionen',
    navPricing: 'Preise',
    navDemo: 'Live-Demo',
    navLogin: 'Anmelden',
    navRegister: 'Kostenlos testen',
    
    heroBadge: 'Intelligente Compliance- & Check-in-Plattform',
    heroTitle: 'Wo Ankommen zur Fürsorge wird.',
    heroDesc: 'Automatisieren Sie DSGVO-Einverständniserklärungen, Anamnesebögen und Patientenaufklärungen. Komplett papierlos, rechtssicher und nahtlos in Ihren Praxisalltag integriert.',
    heroStartBtn: 'Kostenlos starten',
    heroDemoBtn: 'Demo erleben',
    heroMicrotrust: 'Keine Kreditkarte erforderlich. 100% DSGVO-konform.',

    trustLabel: 'Empfohlen für medizinische Fußpflege, Kosmetik & Wellness',
    trustStat: 'Über 150.000+ fehlerfreie digitale Patientenaufklärungen durchgeführt.',
    
    problemTitle: 'Wenn Zettelwirtschaft zum Haftungsrisiko wird',
    problemSubtitle: 'Manuelle Dokumentation blockiert Ihr Studio und birgt erhebliche Risiken.',
    prob1Title: 'Haftungsrisiko & DSGVO',
    prob1Desc: 'Fehlende Unterschriften, unleserliche Handschriften oder unvollständige Anamnesebögen können bei Prüfungen teuer werden.',
    prob2Title: 'Enormer Zeitverlust',
    prob2Desc: 'Das Ausfüllen, Sortieren und manuelle Ablegen von Papierformularen kostet bis zu 10 Minuten pro Behandlung.',
    prob3Title: 'Zersplitterte Abläufe',
    prob3Desc: 'Informationen von Zetteln fehlen im Kalender, wodurch Zusatzleistungen und Produktempfehlungen verloren gehen.',

    solutionTitle: 'Die Podea-Methode: Der digitale Ablauf',
    solutionSubtitle: 'So einfach und integriert funktioniert Ihr Studio mit Podea.',
    step1Title: '1. Kiosk-Empfang',
    step1Desc: 'Kunden checken sich selbstständig am Tablet im Wartebereich ein.',
    step2Title: '2. Aufklärung & Signatur',
    step2Desc: 'Einverständniserklärungen und Anamnesebögen werden digital unterschrieben.',
    step3Title: '3. Behandlung',
    step3Desc: 'Der Behandler sieht die Daten sofort in der Kartei auf dem Tablet oder Desktop.',

    featuresTitle: 'Entwickelt für Ihren Praxisalltag',
    featuresSubtitle: 'Alles, was Sie für reibungslose Check-ins und rechtskonforme Dokumentation benötigen.',
    feat1Title: 'Self-Service Kiosk',
    feat1Desc: 'Patientenfreundliche Tablet-Oberfläche für den Wartebereich. Spart Zeit und entlastet das Empfangsteam.',
    feat2Title: 'Rechtssichere Anamnese',
    feat2Desc: 'Individuelle Einverständniserklärungen für Podologie, Kosmetik und Wellness mit rechtssicherer digitaler Unterschrift.',
    feat3Title: 'Digitale Patientenkartei',
    feat3Desc: 'Übersichtliche Dokumentation von Behandlungsverläufen, Service-Addons, Produktverkäufen und Vorher-Nachher-Fotos.',
    feat4Title: 'Mehrsprachig & Barrierefrei',
    feat4Desc: 'Einfacher Wechsel zwischen Deutsch und Englisch für internationale Kundschaft. Klare Schriftgrößen.',

    demoTitle: 'Podea in Aktion sehen',
    demoSubtitle: 'Buchen Sie direkt ein kurzes, unverbindliches 1:1 Gespräch mit unserem Produkt-Team über Cal.com.',

    pricingTitle: 'Einfache, transparente Preise',
    pricingSubtitle: 'Wählen Sie das passende Paket für Ihr Studio. Alle Pläne inklusive 14-tägiger Testphase.',
    monthly: 'Monatlich',
    annually: 'Jährlich (ca. 20% Rabatt)',
    vatPromise: 'Alle Preise zzgl. MwSt. Monatlich kündbar.',
    popular: 'Beliebt',
    trialBtn: '14 Tage kostenlos testen',
    
    tierSoloName: 'Solo-Praxis',
    tierSoloDesc: 'Ideal für Einzelunternehmer und mobile Praxen.',
    tierStudioName: 'Team-Studio',
    tierStudioDesc: 'Bestens geeignet für wachsende Studios mit Mitarbeitern.',
    tierPremiumName: 'Klinik & Premium',
    tierPremiumDesc: 'Die Komplettlösung für große Zentren und Filialen.',

    soloFeat1: '1 Behandler / Kalender',
    soloFeat2: 'DSGVO-konforme Einverständniserklärungen',
    soloFeat3: 'Digitale Anamnese & Patientenkartei',
    soloFeat4: 'Online-Terminbuchung',
    
    studioFeat1: 'Bis zu 5 Behandler / Mitarbeiter',
    studioFeat2: 'Alles aus Solo-Praxis',
    studioFeat3: 'Tablet-Wartebereich-Kiosk (Self-Checkin)',
    studioFeat4: 'Vorher/Nachher-Fotodokumentation',
    studioFeat5: 'Automatisierte SMS- & E-Mail-Erinnerungen',

    premiumFeat1: 'Unbegrenzte Behandler & Mitarbeiter',
    premiumFeat2: 'Zentrale Mandantenfähigkeit (Filialverwaltung)',
    premiumFeat3: 'Eigener Formular-Editor & Custom Templates',
    premiumFeat4: 'Persönlicher Account Manager',
    premiumFeat5: 'Schnittstellen (API) & Custom Billing',

    ctaTitle: 'Bereit für das papierlose Studio?',
    ctaDesc: 'Richten Sie Ihr Studio in weniger als 3 Minuten ein. Kostenlos testen, keine Kreditkarte erforderlich.',
    ctaStartBtn: 'Jetzt kostenlos starten',
    ctaContactBtn: 'Haben Sie Fragen?',

    footerDesc: 'Die intelligente Compliance- & Check-in-Plattform für podologische Praxen, Wellness-, Kosmetik- und Premium-Studios.',
    footerLegal: 'Rechtliches',
    footerLinks: 'Links',
    footerImpressum: 'Impressum',
    footerPrivacy: 'Datenschutz',
    footerTerms: 'AGB',
    copyright: '© 2026 Podea. Alle Rechte vorbehalten.'
  },
  en: {
    navFeatures: 'Features',
    navPricing: 'Pricing',
    navDemo: 'Live Demo',
    navLogin: 'Sign In',
    navRegister: 'Try Free',

    heroBadge: 'Intelligent Compliance & Check-in Platform',
    heroTitle: 'Where arrival becomes care.',
    heroDesc: 'Automate GDPR consent forms, medical history, and client disclosures. Completely paperless, legally secure, and seamlessly integrated into your daily routine.',
    heroStartBtn: 'Start Free',
    heroDemoBtn: 'Experience Demo',
    heroMicrotrust: 'No credit card required. 100% GDPR-compliant.',

    trustLabel: 'Trusted by medical foot care, cosmetics & wellness studios',
    trustStat: 'Over 150,000+ error-free digital client consents processed.',

    problemTitle: 'When Paperwork Becomes a Liability Risk',
    problemSubtitle: 'Manual client tracking blocks your operations and carries substantial regulatory hazards.',
    prob1Title: 'GDPR & Compliance Risks',
    prob1Desc: 'Missing signatures, illegible handwriting, or incomplete records can lead to massive regulatory penalties.',
    prob2Title: 'Wasted Hours',
    prob2Desc: 'Filling, sorting, and manually cataloging paper forms consumes up to 10 minutes per client visit.',
    prob3Title: 'Disconnected Data',
    prob3Desc: 'Paper charts do not connect to calendars, losing out on critical service upsells and retail tracking.',

    solutionTitle: 'The Podea Method: Digital Workflow',
    solutionSubtitle: 'How simple, clean, and integrated your daily operations become with Podea.',
    step1Title: '1. Kiosk Check-In',
    step1Desc: 'Clients check in autonomously using a tablet in your waiting lounge.',
    step2Title: '2. Consent & Signature',
    step2Desc: 'Digital signature and verification of GDPR and treatment-specific forms.',
    step3Title: '3. Treatment Workspace',
    step3Desc: 'Practitioners instantly access completed intake data in the digital chart.',

    featuresTitle: 'Built for Your Studio Routine',
    featuresSubtitle: 'Everything you need for seamless reception checks and compliant documentation.',
    feat1Title: 'Self-Service Kiosk',
    feat1Desc: 'Patient-friendly tablet interface. Saves time, eliminates queues, and relieves reception staff.',
    feat2Title: 'Compliant Consent Engine',
    feat2Desc: 'Tailor-made templates for medical history and beauty forms with secure, verified signatures.',
    feat3Title: 'Digital Practitioner Chart',
    feat3Desc: 'Track detailed treatment progress, service add-ons, retail sales, and before/after photos.',
    feat4Title: 'Multi-Language Support',
    feat4Desc: 'Switch languages instantly between German and English for international clients. High contrast layouts.',

    demoTitle: 'See Podea in Action',
    demoSubtitle: 'Book a brief, obligation-free 1:1 consultation directly with our product team via Cal.com.',

    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Choose the right plan for your studio. Every plan includes a 14-day free trial period.',
    monthly: 'Monthly',
    annually: 'Annually (save ~20%)',
    vatPromise: 'All prices excl. VAT. Cancel monthly.',
    popular: 'Popular',
    trialBtn: 'Start 14-Day Free Trial',

    tierSoloName: 'Solo Practice',
    tierSoloDesc: 'Perfect for solo practitioners and mobile clinics.',
    tierStudioName: 'Team Studio',
    tierStudioDesc: 'Best suited for growing clinics and studios with staff.',
    tierPremiumName: 'Premium & Clinic',
    tierPremiumDesc: 'Enterprise features for large clinical centers and multi-branches.',

    soloFeat1: '1 practitioner / calendar',
    soloFeat2: 'GDPR-compliant consent forms',
    soloFeat3: 'Digital anamnesis & patient directory',
    soloFeat4: 'Online booking calendar',

    studioFeat1: 'Up to 5 practitioners / staff',
    studioFeat2: 'Includes all Solo features',
    studioFeat3: 'Tablet kiosk (Self-Checkin for waiting area)',
    studioFeat4: 'Before/after photo records',
    studioFeat5: 'Automated SMS & email reminders',

    premiumFeat1: 'Unlimited practitioners & staff',
    premiumFeat2: 'Multi-branch central dashboard',
    premiumFeat3: 'Custom templates & Form Editor',
    premiumFeat4: 'Dedicated account manager',
    premiumFeat5: 'API access & custom invoicing integrations',

    ctaTitle: 'Ready to Go Paperless?',
    ctaDesc: 'Get your studio started in under 3 minutes. Try free, no credit card required.',
    ctaStartBtn: 'Get Started Free',
    ctaContactBtn: 'Have Questions?',

    footerDesc: 'The intelligent check-in and compliance layer for medical foot care, wellness, cosmetics, and hair studios.',
    footerLegal: 'Legal',
    footerLinks: 'Links',
    footerImpressum: 'Legal Notice (Impressum)',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    copyright: '© 2026 Podea. All rights reserved.'
  }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const tCopy = localTranslations[language];

  // Helper for pricing display
  const getSoloPrice = () => (billingCycle === 'yearly' ? '29' : '39');
  const getStudioPrice = () => (billingCycle === 'yearly' ? '69' : '89');
  const getPremiumPrice = () => (billingCycle === 'yearly' ? '149' : '189');

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <div className="lp-container">
      {/* Header / Nav */}
      <header className="lp-header">
        <nav className="lp-nav">
          <a href="#" className="lp-logo-group">
            <div className="lp-logo-icon">P</div>
            <span className="lp-logo-text">Podea</span>
          </a>
          
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">{tCopy.navFeatures}</a>
            <a href="#pricing" className="lp-nav-link">{tCopy.navPricing}</a>
            <a href="#demo" className="lp-nav-link">{tCopy.navDemo}</a>
          </div>

          <div className="lp-nav-actions">
            <button className="lp-lang-btn" onClick={toggleLanguage}>
              {language.toUpperCase()}
            </button>
            <button className="podea-btn podea-btn-secondary" onClick={() => navigate('/login')}>
              {tCopy.navLogin}
            </button>
            <button className="podea-btn podea-btn-primary" onClick={() => navigate('/onboarding')}>
              {tCopy.navRegister}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lp-hero-grid">
        <div className="lp-hero-content">
          <span className="lp-hero-badge">
            <ShieldIcon /> &nbsp; {tCopy.heroBadge}
          </span>
          <h1 className="lp-hero-title">{tCopy.heroTitle}</h1>
          <p className="lp-hero-desc">{tCopy.heroDesc}</p>
          
          <div className="lp-hero-actions">
            <a href="#demo" className="podea-btn podea-btn-primary" style={{ textDecoration: 'none' }}>
              {tCopy.heroDemoBtn}
            </a>
            <button className="podea-btn podea-btn-secondary" onClick={() => navigate('/onboarding')}>
              {tCopy.heroStartBtn}
            </button>
          </div>
          
          <div className="lp-hero-microtrust">
            <CheckIcon /> {tCopy.heroMicrotrust}
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-visual-bg-glow" />
          <div className="lp-visual-mockup">
            {/* Elegant SVG visual of the Self-Service Check-in Dashboard */}
            <svg width="100%" height="260" viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '12px', background: '#FCFAF8' }}>
              {/* Header block */}
              <rect width="400" height="48" fill="#1F2A37" />
              <circle cx="24" cy="24" r="6" fill="#BE5A5A" />
              <circle cx="40" cy="24" r="6" fill="#C7A75D" />
              <circle cx="56" cy="24" r="6" fill="#4A6C5C" />
              <rect x="90" y="18" width="100" height="12" rx="4" fill="rgba(255,255,255,0.15)" />
              <rect x="330" y="16" width="50" height="16" rx="8" fill="#C7A75D" />

              {/* Sidebar layout */}
              <rect x="0" y="48" width="100" height="212" fill="#FCFAF8" border-right="1px solid rgba(0,0,0,0.05)" />
              <line x1="100" y1="48" x2="100" y2="260" stroke="#E5E7EB" />
              <rect x="15" y="68" width="70" height="10" rx="3" fill="#E5E7EB" />
              <rect x="15" y="92" width="70" height="10" rx="3" fill="#E5E7EB" />
              <rect x="15" y="116" width="70" height="10" rx="3" fill="#E5E7EB" />

              {/* Content area: mock list of checkins */}
              <rect x="120" y="68" width="260" height="36" rx="6" fill="#F4EFEA" />
              <rect x="135" y="77" width="18" height="18" rx="9" fill="#4A6C5C" />
              <rect x="165" y="76" width="80" height="8" rx="2" fill="#1F2A37" />
              <rect x="165" y="88" width="50" height="6" rx="2" fill="#374151" strokeOpacity="0.5" />
              <rect x="315" y="78" width="50" height="16" rx="8" fill="rgba(74, 108, 92, 0.15)" />

              <rect x="120" y="116" width="260" height="36" rx="6" fill="#F4EFEA" />
              <rect x="135" y="125" width="18" height="18" rx="9" fill="#C7A75D" />
              <rect x="165" y="124" width="90" height="8" rx="2" fill="#1F2A37" />
              <rect x="165" y="136" width="60" height="6" rx="2" fill="#374151" strokeOpacity="0.5" />
              <rect x="315" y="126" width="50" height="16" rx="8" fill="rgba(199, 167, 93, 0.15)" />

              <rect x="120" y="164" width="260" height="36" rx="6" fill="#F4EFEA" />
              <rect x="135" y="173" width="18" height="18" rx="9" fill="#E5E7EB" />
              <rect x="165" y="172" width="75" height="8" rx="2" fill="#1F2A37" />
              <rect x="165" y="184" width="40" height="6" rx="2" fill="#374151" strokeOpacity="0.5" />
              <rect x="315" y="174" width="50" height="16" rx="8" fill="#E5E7EB" />

              {/* Graphic floating checkmark badge representing security */}
              <circle cx="340" cy="220" r="30" fill="#FCFAF8" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.1))" />
              <circle cx="340" cy="220" r="24" fill="#4A6C5C" />
              <path d="M332 220 L337 225 L348 214" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </div>
      </section>

      {/* Trust Logobar */}
      <section className="lp-trust">
        <div className="lp-trust-inner">
          <span className="lp-trust-text">{tCopy.trustLabel}</span>
          <div className="lp-trust-logos">
            <div className="lp-trust-logo"><ShieldIcon /> 100% DSGVO / GDPR</div>
            <div className="lp-trust-logo">ZFD Podologie</div>
            <div className="lp-trust-logo">Cosmetic Guild EU</div>
            <div className="lp-trust-logo">Wellness Verband</div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-primary-muted)', margin: '10px 0 0' }}>
            {tCopy.trustStat}
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="lp-section">
        <div className="lp-section-center">
          <h2 className="lp-section-title">{tCopy.problemTitle}</h2>
          <p className="lp-section-subtitle">{tCopy.problemSubtitle}</p>
        </div>
        <div className="lp-problem-grid">
          <div className="lp-problem-card warning">
            <div className="lp-problem-icon"><AlertIcon /></div>
            <h3 className="lp-problem-card-title">{tCopy.prob1Title}</h3>
            <p className="lp-problem-card-desc">{tCopy.prob1Desc}</p>
          </div>
          <div className="lp-problem-card warning">
            <div className="lp-problem-icon"><ClockIcon /></div>
            <h3 className="lp-problem-card-title">{tCopy.prob2Title}</h3>
            <p className="lp-problem-card-desc">{tCopy.prob2Desc}</p>
          </div>
          <div className="lp-problem-card warning">
            <div className="lp-problem-icon"><ShieldIcon /></div>
            <h3 className="lp-problem-card-title">{tCopy.prob3Title}</h3>
            <p className="lp-problem-card-desc">{tCopy.prob3Desc}</p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="lp-solution">
        <div className="lp-section" style={{ padding: '0' }}>
          <div className="lp-section-center">
            <h2 className="lp-section-title">{tCopy.solutionTitle}</h2>
            <p className="lp-section-subtitle">{tCopy.solutionSubtitle}</p>
          </div>
          <div className="lp-solution-steps">
            <div className="lp-solution-step">
              <div className="lp-step-number">1</div>
              <h3 className="lp-step-title">{tCopy.step1Title}</h3>
              <p className="lp-step-desc">{tCopy.step1Desc}</p>
            </div>
            <div className="lp-solution-step">
              <div className="lp-step-number">2</div>
              <h3 className="lp-step-title">{tCopy.step2Title}</h3>
              <p className="lp-step-desc">{tCopy.step2Desc}</p>
            </div>
            <div className="lp-solution-step">
              <div className="lp-step-number">3</div>
              <h3 className="lp-step-title">{tCopy.step3Title}</h3>
              <p className="lp-step-desc">{tCopy.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="lp-section">
        <div className="lp-section-center">
          <h2 className="lp-section-title">{tCopy.featuresTitle}</h2>
          <p className="lp-section-subtitle">{tCopy.featuresSubtitle}</p>
        </div>
        <div className="lp-feature-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrapper"><KioskIcon /></div>
            <div className="lp-feature-card-content">
              <h3 className="lp-feature-card-title">{tCopy.feat1Title}</h3>
              <p className="lp-feature-card-desc">{tCopy.feat1Desc}</p>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrapper"><ClipboardIcon /></div>
            <div className="lp-feature-card-content">
              <h3 className="lp-feature-card-title">{tCopy.feat2Title}</h3>
              <p className="lp-feature-card-desc">{tCopy.feat2Desc}</p>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrapper"><ChartIcon /></div>
            <div className="lp-feature-card-content">
              <h3 className="lp-feature-card-title">{tCopy.feat3Title}</h3>
              <p className="lp-feature-card-desc">{tCopy.feat3Desc}</p>
            </div>
          </div>
          <div className="lp-feature-card">
            <div className="lp-feature-icon-wrapper"><GlobeIcon /></div>
            <div className="lp-feature-card-content">
              <h3 className="lp-feature-card-title">{tCopy.feat4Title}</h3>
              <p className="lp-feature-card-desc">{tCopy.feat4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section (Cal.com Embed) */}
      <section id="demo" className="lp-section lp-demo-section">
        <div className="lp-section-center">
          <h2 className="lp-section-title">{tCopy.demoTitle}</h2>
          <p className="lp-section-subtitle">{tCopy.demoSubtitle}</p>
        </div>
        <div className="lp-cal-container">
          <iframe 
            src="https://cal.com/podea/demo?embed=true"
            className="lp-cal-iframe"
            title="Cal.com Demo Booking"
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="lp-section">
        <div className="lp-section-center">
          <h2 className="lp-section-title">{tCopy.pricingTitle}</h2>
          <p className="lp-section-subtitle">{tCopy.pricingSubtitle}</p>
          
          <div className="lp-pricing-toggle-container">
            <span className={`lp-toggle-label ${billingCycle === 'monthly' ? 'active' : ''}`}>{tCopy.monthly}</span>
            <div 
              className={`lp-toggle-switch ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            >
              <div className="lp-toggle-handle" />
            </div>
            <span className={`lp-toggle-label ${billingCycle === 'yearly' ? 'active' : ''}`}>{tCopy.annually}</span>
            {billingCycle === 'yearly' && <span className="lp-discount-badge">-20%</span>}
          </div>
        </div>

        <div className="lp-pricing-grid">
          {/* Solo Card */}
          <div className="lp-pricing-card">
            <h3 className="lp-pricing-name">{tCopy.tierSoloName}</h3>
            <p className="lp-pricing-desc">{tCopy.tierSoloDesc}</p>
            <div className="lp-pricing-price-box">
              <span className="lp-pricing-currency">€</span>
              <span className="lp-pricing-amount">{getSoloPrice()}</span>
              <span className="lp-pricing-period">/ Mon</span>
            </div>
            <ul className="lp-pricing-features-list">
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.soloFeat1}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.soloFeat2}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.soloFeat3}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.soloFeat4}</li>
            </ul>
            <button className="podea-btn podea-btn-secondary" onClick={() => navigate('/onboarding')}>
              {tCopy.trialBtn}
            </button>
          </div>

          {/* Studio Card (Featured) */}
          <div className="lp-pricing-card featured">
            <span className="lp-pricing-popular-badge">{tCopy.popular}</span>
            <h3 className="lp-pricing-name">{tCopy.tierStudioName}</h3>
            <p className="lp-pricing-desc">{tCopy.tierStudioDesc}</p>
            <div className="lp-pricing-price-box">
              <span className="lp-pricing-currency">€</span>
              <span className="lp-pricing-amount">{getStudioPrice()}</span>
              <span className="lp-pricing-period">/ Mon</span>
            </div>
            <ul className="lp-pricing-features-list">
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> <strong>{tCopy.studioFeat1}</strong></li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.studioFeat2}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.studioFeat3}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.studioFeat4}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.studioFeat5}</li>
            </ul>
            <button className="podea-btn podea-btn-accent" onClick={() => navigate('/onboarding')}>
              {tCopy.trialBtn}
            </button>
          </div>

          {/* Premium Card */}
          <div className="lp-pricing-card">
            <h3 className="lp-pricing-name">{tCopy.tierPremiumName}</h3>
            <p className="lp-pricing-desc">{tCopy.tierPremiumDesc}</p>
            <div className="lp-pricing-price-box">
              <span className="lp-pricing-currency">€</span>
              <span className="lp-pricing-amount">{getPremiumPrice()}</span>
              <span className="lp-pricing-period">/ Mon</span>
            </div>
            <ul className="lp-pricing-features-list">
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> <strong>{tCopy.premiumFeat1}</strong></li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.premiumFeat2}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.premiumFeat3}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.premiumFeat4}</li>
              <li className="lp-pricing-feature-item"><span className="lp-pricing-feature-check"><CheckIcon /></span> {tCopy.premiumFeat5}</li>
            </ul>
            <button className="podea-btn podea-btn-secondary" onClick={() => navigate('/onboarding')}>
              {tCopy.trialBtn}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-primary-muted)', marginTop: '24px' }}>
          {tCopy.vatPromise}
        </p>
      </section>

      {/* Final CTA Section */}
      <section className="lp-cta-section">
        <div className="lp-cta-box">
          <div className="lp-cta-glow" />
          <h2 className="lp-cta-title">{tCopy.ctaTitle}</h2>
          <p className="lp-cta-desc">{tCopy.ctaDesc}</p>
          <div className="lp-cta-actions">
            <button className="podea-btn podea-btn-accent" onClick={() => navigate('/onboarding')}>
              {tCopy.ctaStartBtn}
            </button>
            <a href="#demo" className="podea-btn podea-btn-secondary" style={{ textDecoration: 'none' }}>
              {tCopy.ctaContactBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <a href="#" className="lp-footer-logo">Podea</a>
            <p className="lp-footer-desc">{tCopy.footerDesc}</p>
          </div>
          <div className="lp-footer-links-group">
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">{tCopy.footerLegal}</span>
              <a href="#" className="lp-footer-link">{tCopy.footerImpressum}</a>
              <a href="#" className="lp-footer-link">{tCopy.footerPrivacy}</a>
              <a href="#" className="lp-footer-link">{tCopy.footerTerms}</a>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-title">{tCopy.footerLinks}</span>
              <a href="#features" className="lp-footer-link">{tCopy.navFeatures}</a>
              <a href="#pricing" className="lp-footer-link">{tCopy.navPricing}</a>
              <a href="#demo" className="lp-footer-link">{tCopy.navDemo}</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>{tCopy.copyright}</span>
          <span>Designed for Premium Healthcare & Wellness Services</span>
        </div>
      </footer>
    </div>
  );
};
