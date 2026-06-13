import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, functions } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import './AuthStyles.css';

export const VerifyEmail: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }
      try {
        const verifyTokenFn = httpsCallable<{ token: string }, { valid: boolean }>(functions, 'verifyOnboardingToken');
        const res = await verifyTokenFn({ token });
        setIsTokenValid(res.data.valid);
      } catch (err) {
        setIsTokenValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    checkToken();
  }, [token]);

  // Password Strength Calculation Helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', colorClass: '' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score += 1;
    
    let label = '';
    let colorClass = '';
    if (score === 1) {
      label = language === 'de' ? 'Schwach (min. 8 Zeichen + Zahlen & Buchstaben)' : 'Weak (min. 8 chars + numbers & letters)';
      colorClass = 'weak';
    } else if (score === 2) {
      label = language === 'de' ? 'Gut (Sonderzeichen hinzufügen für maximale Stärke)' : 'Good (add special characters for max strength)';
      colorClass = 'fair';
    } else if (score === 3) {
      label = language === 'de' ? 'Sehr Stark' : 'Very Strong';
      colorClass = 'strong';
    }
    return { score, label, colorClass };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('passwordsMismatch'));
      return;
    }

    const isAlphanumeric = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password) && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    if (!isAlphanumeric || password.length < 8) {
      setError(t('passwordStrengthErr'));
      return;
    }

    setIsLoading(true);
    try {
      const completeOnboardingFn = httpsCallable<{ token: string; password: string }, { customToken: string }>(functions, 'completeStudioOnboarding');
      const res = await completeOnboardingFn({ token, password });
      
      setSuccess(t('onboardingCompleteSuccess'));
      
      await signInWithCustomToken(auth, res.data.customToken);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Onboarding failed.');
    } finally {
      setIsLoading(false);
    }
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

      <div className="auth-card-container small">
        <Card className="auth-card">
          {isValidating ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(199,167,93,0.1)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
              <p style={{ color: 'var(--color-primary-muted)', margin: 0 }}>{t('tokenValidating')}</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : !isTokenValid ? (
            <div style={{ textAlign: 'center' }}>
              <div className="auth-success-icon-wrapper" style={{ backgroundColor: 'var(--color-status-warning-bg)', color: 'var(--color-status-warning)' }}>✗</div>
              <h1 className="auth-title" style={{ color: 'var(--color-status-warning)' }}>
                {t('tokenInvalid')}
              </h1>
              <p style={{ color: 'var(--color-primary-muted)', fontSize: '14px', marginBottom: '24px' }}>
                {language === 'de' ? 'Der Bestätigungslink ist abgelaufen (Gültigkeit max. 7 Tage) oder ungültig.' : 'The confirmation link has expired (valid max 7 days) or is invalid.'}
              </p>
              <Button variant="primary" onClick={() => navigate('/onboarding')} style={{ width: '100%' }}>
                {t('registerNewStudio')}
              </Button>
            </div>
          ) : (
            <>
              <div className="auth-header">
                <h1 className="auth-title">{t('verifyTitle')}</h1>
                <p className="auth-subtitle">{t('verifySubtitle')}</p>
              </div>

              {error && (
                <div className="auth-error-block">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-error-block" style={{ backgroundColor: 'rgba(74, 108, 92, 0.08)', border: '1px solid rgba(74, 108, 92, 0.2)', color: 'var(--color-status-success)' }}>
                  <span>✓</span>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <Input 
                  label={t('createPassword')} 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  autoFocus
                />
                
                {/* Visual Password Strength Meter */}
                {password && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-bars">
                      <div className={`pwd-strength-bar ${strength.score >= 1 ? strength.colorClass : ''}`} />
                      <div className={`pwd-strength-bar ${strength.score >= 2 ? strength.colorClass : ''}`} />
                      <div className={`pwd-strength-bar ${strength.score >= 3 ? strength.colorClass : ''}`} />
                    </div>
                    <div className="pwd-strength-text">
                      <span>{strength.label}</span>
                    </div>
                  </div>
                )}

                <Input 
                  label={t('confirmPassword')} 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <Button 
                  type="submit" 
                  variant="accent" 
                  style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                  disabled={isLoading}
                >
                  {isLoading ? t('btnLoading') : t('btnComplete')}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
