import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Protected route automatically routes valid users, but we force push to dashboard boundary
      navigate('/dashboard');
    } catch (err: any) {
      setError('Login fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <Card size="large" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="font-serif" style={{ fontSize: '24px', margin: '0 0 var(--spacing-sm)', color: 'var(--color-primary-text)' }}>Podea</h1>
          <p style={{ color: 'var(--color-primary-muted)', margin: 0 }}>Willkommen zurück in Ihrem Studio</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input 
            label="E-Mail Adresse" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input 
            label="Passwort" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          
          {error && <p style={{ color: 'var(--color-status-warning)', fontSize: '14px', marginTop: 'var(--spacing-sm)' }}>{error}</p>}
          
          <Button 
            type="submit" 
            variant="primary" 
            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Anmelden...' : 'Anmelden'}
          </Button>
        </form>

        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center', fontSize: '14px' }}>
          <p style={{ color: 'var(--color-primary-muted)' }}>
            Kein Studio eingerichtet? <button onClick={() => navigate('/onboarding')} style={{ color: 'var(--color-accent)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Neues Studio registrieren</button>
          </p>
        </div>
      </Card>
    </div>
  );
};
