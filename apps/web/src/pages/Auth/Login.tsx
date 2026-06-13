import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';
import { useLanguage } from '../../contexts/LanguageContext';
import './AuthStyles.css';

export const Login: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let email = username.trim();

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmail) {
        const resolveStudioFn = httpsCallable<{ studioName: string }, { email: string }>(functions, 'resolveStudioName');
        const res = await resolveStudioFn({ studioName: email });
        email = res.data.email;
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(t('loginFailed'));
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
          <div className="auth-header">
            {/* Minimal logo mark */}
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: 'var(--color-primary-text)', color: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--color-accent)', fontFamily: 'var(--font-family-serif)', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              P
            </div>
            <h1 className="auth-title">{t('loginTitle')}</h1>
            <p className="auth-subtitle">{t('loginSubtitle')}</p>
          </div>

          {error && (
            <div className="auth-error-block">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input 
              label={t('usernameLabel')} 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
            />
            <Input 
              label={t('passwordLabel')} 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={() => navigate('/reset-password')} 
                className="auth-accent-link"
                style={{ fontSize: '13px' }}
              >
                {t('forgotPassword')}
              </button>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? t('loginLoading') : t('loginBtn')}
            </Button>
          </form>

          <div className="auth-footer-nav" style={{ marginTop: '24px' }}>
            <p style={{ color: 'var(--color-primary-muted)', margin: 0, fontSize: '14px' }}>
              {t('noStudio')}{' '}
              <button onClick={() => navigate('/onboarding')} className="auth-accent-link">
                {t('registerNewStudio')}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
