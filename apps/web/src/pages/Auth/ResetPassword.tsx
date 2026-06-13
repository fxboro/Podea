import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import './AuthStyles.css';

export const ResetPassword: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      let email = identifier.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) {
        const resolveStudioFn = httpsCallable<{ studioName: string }, { email: string }>(functions, 'resolveStudioName');
        const res = await resolveStudioFn({ studioName: email });
        email = res.data.email;
      }

      await sendPasswordResetEmail(auth, email);
      setSuccess(t('resetSuccess'));
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-pattern" />

      {/* Language Switcher */}
      <div className="auth-lang-container">
        <button className="auth-lang-btn" onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}>
          {language.toUpperCase()}
        </button>
      </div>

      <div className="auth-card-container small">
        <Card className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{t('resetTitle')}</h1>
            <p className="auth-subtitle">{t('resetSubtitle')}</p>
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

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input 
              label={t('usernameLabel') + ' / E-Mail'} 
              placeholder={t('usernameLabel')}
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            <Button 
              type="submit" 
              variant="accent" 
              style={{ width: '100%', marginTop: '16px' }}
              disabled={isLoading}
            >
              {isLoading ? t('btnLoading') : t('resetBtn')}
            </Button>
          </form>

          <div className="auth-footer-nav" style={{ marginTop: '24px' }}>
            <button className="auth-footer-link-btn" onClick={() => navigate('/login')}>
              ← {t('backToLogin')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
