import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button, Input, Card } from '@podea/ui';

export const Onboarding: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studioName, setStudioName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       
      // Persist Studio Draft Data
      await setDoc(doc(db, 'onboarding_drafts', userCredential.user.uid), {
        studioName,
        ownerEmail: email,
        status: 'awaiting_payment',
        createdAt: serverTimestamp()
      });

      console.log('Spawning Paddle/PayPal Checkout for user:', userCredential.user.uid, 'Studio:', studioName);
      navigate('/checkout/pending');
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <Card size="large" isUpsell style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="font-serif" style={{ fontSize: '24px', margin: '0 0 var(--spacing-sm)', color: 'var(--color-primary-text)' }}>Podea Premium starten</h1>
          <p style={{ color: 'var(--color-primary-muted)', margin: 0 }}>Richten Sie Ihr neues Gesundheitsstudio ein.</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input 
            label="Studio Name" 
            placeholder="z.B. Podologie Schmidt"
            type="text" 
            value={studioName}
            onChange={(e) => setStudioName(e.target.value)}
            required
          />
          <Input 
            label="Inhaber E-Mail" 
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
            autoComplete="new-password"
          />
          
          {error && <p style={{ color: 'var(--color-status-warning)', fontSize: '14px', marginTop: 'var(--spacing-sm)' }}>{error}</p>}
          
          <Button 
            type="submit" 
            variant="accent" 
            style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
            disabled={isLoading}
          >
            {isLoading ? 'Lädt...' : 'Abo wählen & Bezahlen'}
          </Button>
        </form>
        
        <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
            <button onClick={() => navigate('/login')} style={{ fontSize: '14px', color: 'var(--color-primary-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Bereits registriert? Hier anmelden.
            </button>
        </div>
      </Card>
    </div>
  );
};
