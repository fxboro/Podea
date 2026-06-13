import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import './AuthStyles.css';

const countries = [
  // Europe
  { code: 'DE', nameDe: 'Deutschland', nameEn: 'Germany' },
  { code: 'AT', nameDe: 'Österreich', nameEn: 'Austria' },
  { code: 'CH', nameDe: 'Schweiz', nameEn: 'Switzerland' },
  { code: 'FR', nameDe: 'Frankreich', nameEn: 'France' },
  { code: 'IT', nameDe: 'Italien', nameEn: 'Italy' },
  { code: 'ES', nameDe: 'Spanien', nameEn: 'Spain' },
  { code: 'GB', nameDe: 'Vereinigtes Königreich', nameEn: 'United Kingdom' },
  { code: 'NL', nameDe: 'Niederlande', nameEn: 'Netherlands' },
  { code: 'BE', nameDe: 'Belgien', nameEn: 'Belgium' },
  { code: 'PL', nameDe: 'Polen', nameEn: 'Poland' },
  { code: 'SE', nameDe: 'Schweden', nameEn: 'Sweden' },
  { code: 'NO', nameDe: 'Norwegen', nameEn: 'Norway' },
  { code: 'DK', nameDe: 'Dänemark', nameEn: 'Denmark' },
  { code: 'FI', nameDe: 'Finnland', nameEn: 'Finland' },
  { code: 'IE', nameDe: 'Irland', nameEn: 'Ireland' },
  { code: 'PT', nameDe: 'Portugal', nameEn: 'Portugal' },
  { code: 'GR', nameDe: 'Griechenland', nameEn: 'Greece' },
  // North America
  { code: 'US', nameDe: 'Vereinigte Staaten', nameEn: 'United States' },
  { code: 'CA', nameDe: 'Kanada', nameEn: 'Canada' },
  { code: 'MX', nameDe: 'Mexiko', nameEn: 'Mexico' },
  // South America
  { code: 'BR', nameDe: 'Brasilien', nameEn: 'Brazil' },
  { code: 'AR', nameDe: 'Argentinien', nameEn: 'Argentina' },
  { code: 'CL', nameDe: 'Chile', nameEn: 'Chile' },
  { code: 'CO', nameDe: 'Kolumbien', nameEn: 'Colombia' },
  { code: 'PE', nameDe: 'Peru', nameEn: 'Peru' },
  { code: 'VE', nameDe: 'Venezuela', nameEn: 'Venezuela' }
];

const stepTranslations = {
  de: {
    step1: 'Inhaber',
    step2: 'Studio',
    step3: 'Adresse',
    btnNext: 'Weiter',
    btnBack: 'Zurück',
    fieldRequired: 'Dieses Feld ist erforderlich.'
  },
  en: {
    step1: 'Owner',
    step2: 'Studio',
    step3: 'Location',
    btnNext: 'Next',
    btnBack: 'Back',
    fieldRequired: 'This field is required.'
  }
};

export const Onboarding: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [email, setEmail] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [cityName, setCityName] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [debugToken, setDebugToken] = useState('');

  const sText = stepTranslations[language];

  // Validate step fields before going forward
  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      return firstName.trim() !== '' && lastName.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    if (step === 2) {
      return studioName.trim() !== '';
    }
    if (step === 3) {
      return streetName.trim() !== '' && streetNumber.trim() !== '' && cityName.trim() !== '' && state.trim() !== '' && country !== '';
    }
    return false;
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      setError(language === 'de' ? 'Bitte füllen Sie alle erforderlichen Felder korrekt aus.' : 'Please fill all required fields correctly.');
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid(3)) {
      setError(language === 'de' ? 'Bitte füllen Sie alle Adressdaten aus.' : 'Please fill in all address details.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const initiateOnboardingFn = httpsCallable<any, { success: boolean; message: string; token: string }>(
        functions, 
        'initiateStudioOnboarding'
      );
      
      const res = await initiateOnboardingFn({
        firstName,
        lastName,
        studioName,
        email,
        streetName,
        streetNumber,
        cityName,
        cityCode,
        state,
        country
      });

      if (res.data.success) {
        setIsEmailSent(true);
        if (res.data.token) {
          setDebugToken(res.data.token);
        }
      }
    } catch (err: any) {
      setError(err.message || (language === 'de' ? 'Registrierung fehlgeschlagen.' : 'Registration failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for progress line width
  const getProgressWidth = () => {
    if (currentStep === 1) return '0%';
    if (currentStep === 2) return '50%';
    return '100%';
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-pattern" />

      {/* Language switcher */}
      <div className="auth-lang-container">
        <button className="auth-lang-btn" onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
          {language.toUpperCase()}
        </button>
      </div>

      <div className="auth-card-container">
        <Card className="auth-card">
          {isEmailSent ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon-wrapper">✓</div>
              <h1 className="auth-title" style={{ color: 'var(--color-status-success)' }}>
                {t('emailSentTitle')}
              </h1>
              <p style={{ color: 'var(--color-primary-text)', lineHeight: '1.6', marginBottom: 'var(--spacing-xl)' }}>
                {t('emailSentMsg')}
              </p>
              {debugToken && (
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid rgba(199, 167, 93, 0.3)', marginBottom: '24px', wordBreak: 'break-all' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-accent)' }}>[DEBUG MODE] Verification Link:</p>
                  <a href={`/verify-email?token=${debugToken}`} style={{ color: 'var(--color-primary-text)', fontSize: '13px', fontWeight: '500', textDecoration: 'underline' }}>
                    {window.location.origin}/verify-email?token={debugToken}
                  </a>
                </div>
              )}
              <Button variant="primary" onClick={() => navigate('/login')} style={{ width: '100%' }}>
                {t('backToLogin')}
              </Button>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h1 className="auth-title">{t('titleOnboarding')}</h1>
                <p className="auth-subtitle">{t('subtitleOnboarding')}</p>
              </div>

              {/* Guided Step Progress Indicator */}
              <div className="auth-progress">
                <div className="auth-progress-line" style={{ width: getProgressWidth() }} />
                
                <div className={`auth-progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} onClick={() => currentStep > 1 && setCurrentStep(1)}>
                  <div className="auth-step-circle">{currentStep > 1 ? '✓' : '1'}</div>
                  <span className="auth-step-label">{sText.step1}</span>
                </div>

                <div className={`auth-progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`} onClick={() => currentStep > 2 && setCurrentStep(2)}>
                  <div className="auth-step-circle">{currentStep > 2 ? '✓' : '2'}</div>
                  <span className="auth-step-label">{sText.step2}</span>
                </div>

                <div className={`auth-progress-step ${currentStep >= 3 ? 'active' : ''}`} onClick={() => isStepValid(2) && setCurrentStep(3)}>
                  <div className="auth-step-circle">3</div>
                  <span className="auth-step-label">{sText.step3}</span>
                </div>
              </div>

              {error && (
                <div className="auth-error-block">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} autoComplete="off">
                {/* STEP 1: Personal Details */}
                {currentStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="auth-form-grid-2">
                      <Input 
                        label={t('firstName')} 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoFocus
                      />
                      <Input 
                        label={t('lastName')} 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <Input 
                      label={t('email')} 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <div className="auth-action-buttons">
                      <Button 
                        type="button" 
                        variant="primary" 
                        onClick={handleNext}
                        disabled={!isStepValid(1)}
                        style={{ marginTop: '12px' }}
                      >
                        {sText.btnNext} →
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Studio Profile */}
                {currentStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Input 
                      label={t('studioName')} 
                      placeholder="z.B. Podologie Schmidt"
                      type="text" 
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className="auth-action-buttons">
                      <Button type="button" variant="secondary" onClick={handleBack}>
                        ← {sText.btnBack}
                      </Button>
                      <Button 
                        type="button" 
                        variant="primary" 
                        onClick={handleNext}
                        disabled={!isStepValid(2)}
                      >
                        {sText.btnNext} →
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Studio Location */}
                {currentStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="auth-form-grid-3-1">
                      <Input 
                        label={t('streetName')} 
                        type="text" 
                        value={streetName}
                        onChange={(e) => setStreetName(e.target.value)}
                        required
                        autoFocus
                      />
                      <Input 
                        label={t('streetNumber')} 
                        type="text" 
                        value={streetNumber}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="auth-form-grid-2">
                      <Input 
                        label={t('cityName')} 
                        type="text" 
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        required
                      />
                      <Input 
                        label={t('cityCode')} 
                        type="text" 
                        value={cityCode}
                        onChange={(e) => setCityCode(e.target.value)}
                      />
                    </div>

                    <div className="auth-form-grid-2">
                      <Input 
                        label={t('state')} 
                        type="text" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />

                      <div className="podea-input-group">
                        <label htmlFor="country-select" className="podea-label">
                          {t('country')}
                        </label>
                        <select 
                          id="country-select" 
                          className="podea-input"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                        >
                          <option value="">-- {t('countrySelect')} --</option>
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {language === 'de' ? c.nameDe : c.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="auth-action-buttons">
                      <Button type="button" variant="secondary" onClick={handleBack} disabled={isLoading}>
                        ← {sText.btnBack}
                      </Button>
                      <Button 
                        type="submit" 
                        variant="accent"
                        disabled={isLoading || !isStepValid(3)}
                      >
                        {isLoading ? t('btnLoading') : t('btnRegister')}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
              
              <div className="auth-footer-nav">
                <button className="auth-footer-link-btn" onClick={() => navigate('/login')}>
                  {t('alreadyRegistered')}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
