import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'de' | 'en';

type Translations = Record<Language, Record<string, string>>;

const translations: Translations = {
  de: {
    titleOnboarding: 'Podea Premium starten',
    subtitleOnboarding: 'Richten Sie Ihr neues Gesundheitsstudio ein.',
    firstName: 'Vorname',
    lastName: 'Nachname',
    studioName: 'Studio-Name',
    email: 'Inhaber E-Mail',
    streetName: 'Straße',
    streetNumber: 'Hausnummer',
    cityName: 'Ort / Stadt',
    cityCode: 'Postleitzahl (optional)',
    state: 'Bundesland',
    country: 'Land',
    countrySelect: 'Bitte wählen Sie ein Land',
    btnRegister: 'Registrierungs-Link anfordern',
    btnLoading: 'Wird verarbeitet...',
    alreadyRegistered: 'Bereits registriert? Hier anmelden.',
    emailSentTitle: 'Registrierungs-Link gesendet!',
    emailSentMsg: 'Wir haben einen Bestätigungs-Link an Ihre E-Mail gesendet. Bitte bestätigen Sie diesen innerhalb von 7 Tagen, um Ihre Registrierung abzuschließen.',
    
    // Login
    loginTitle: 'Podea',
    loginSubtitle: 'Willkommen zurück in Ihrem Studio',
    usernameLabel: 'Benutzername (Studio-Name)',
    passwordLabel: 'Passwort',
    loginBtn: 'Anmelden',
    loginLoading: 'Anmelden...',
    noStudio: 'Kein Studio eingerichtet?',
    registerNewStudio: 'Neues Studio registrieren',
    forgotPassword: 'Passwort vergessen?',
    loginFailed: 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.',

    // Reset Password
    resetTitle: 'Passwort zurücksetzen',
    resetSubtitle: 'Geben Sie Ihren Studio-Namen oder Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten.',
    resetBtn: 'Link zum Zurücksetzen senden',
    resetSuccess: 'Ein Link zum Zurücksetzen des Passworts wurde an die hinterlegte E-Mail-Adresse gesendet.',
    backToLogin: 'Zurück zum Login',

    // Verify / Set Password
    verifyTitle: 'Passwort erstellen',
    verifySubtitle: 'Richten Sie Ihr Passwort ein, um die Studio-Erstellung abzuschließen.',
    createPassword: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    btnComplete: 'Registrierung abschließen',
    passwordsMismatch: 'Die Passwörter stimmen nicht überein.',
    passwordStrengthErr: 'Das Passwort muss mindestens 8 Zeichen lang sein und sowohl Buchstaben als auch Zahlen enthalten.',
    tokenInvalid: 'Ungültiger oder abgelaufener Bestätigungslink.',
    tokenValidating: 'Bestätigungslink wird überprüft...',
    onboardingCompleteSuccess: 'Registrierung erfolgreich abgeschlossen! Sie werden weitergeleitet...'
  },
  en: {
    titleOnboarding: 'Start Podea Premium',
    subtitleOnboarding: 'Set up your new health studio.',
    firstName: 'First Name',
    lastName: 'Last Name',
    studioName: 'Studio Name',
    email: 'Owner Email',
    streetName: 'Street',
    streetNumber: 'Street Number',
    cityName: 'City',
    cityCode: 'Postal Code (optional)',
    state: 'State / Province',
    country: 'Country',
    countrySelect: 'Please select a country',
    btnRegister: 'Request Registration Link',
    btnLoading: 'Processing...',
    alreadyRegistered: 'Already registered? Log in here.',
    emailSentTitle: 'Registration Link Sent!',
    emailSentMsg: 'We have sent a confirmation link to your email. Please confirm it within 7 days to complete your registration.',
    
    // Login
    loginTitle: 'Podea',
    loginSubtitle: 'Welcome back to your studio',
    usernameLabel: 'Username (Studio Name)',
    passwordLabel: 'Password',
    loginBtn: 'Log In',
    loginLoading: 'Logging in...',
    noStudio: 'No studio set up?',
    registerNewStudio: 'Register new studio',
    forgotPassword: 'Forgot password?',
    loginFailed: 'Login failed. Please check your credentials.',

    // Reset Password
    resetTitle: 'Reset Password',
    resetSubtitle: 'Enter your studio name or email address to receive a password reset link.',
    resetBtn: 'Send Reset Link',
    resetSuccess: 'A password reset link has been sent to the registered email address.',
    backToLogin: 'Back to Login',

    // Verify / Set Password
    verifyTitle: 'Create Password',
    verifySubtitle: 'Set up your password to complete studio setup.',
    createPassword: 'Password',
    confirmPassword: 'Confirm Password',
    btnComplete: 'Complete Registration',
    passwordsMismatch: 'Passwords do not match.',
    passwordStrengthErr: 'Password must be at least 8 characters long and contain both letters and numbers.',
    tokenInvalid: 'Invalid or expired confirmation link.',
    tokenValidating: 'Validating confirmation link...',
    onboardingCompleteSuccess: 'Registration completed successfully! Redirecting...'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'de',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('podea_lang');
    return (saved === 'de' || saved === 'en' ? saved : 'de') as Language;
  });

  useEffect(() => {
    localStorage.setItem('podea_lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['de'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
