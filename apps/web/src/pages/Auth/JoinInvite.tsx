import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '@podea/ui';

export const JoinInvite: React.FC = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!inviteId) return;
    setStatus('loading');
    setError('');

    try {
      const acceptInvite = httpsCallable(functions, 'acceptInvite');
      await acceptInvite({ inviteId });
      setStatus('success');
      // Force token refresh to get new claims
      if (user) await user.getIdToken(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
      setError(err.message || 'Einladung konnte nicht angenommen werden.');
      setStatus('error');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card style={{ textAlign: 'center' }}>
          <h2 className="font-serif text-xl mb-4">Einladung zu Podea</h2>
          <p className="mb-6 text-muted">Bitte melden Sie sich an, um der Einladung zu folgen.</p>
          <Button variant="accent" onClick={() => navigate('/login', { state: { from: `/join/${inviteId}` } })}>
            Anmelden / Registrieren
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2 className="font-serif text-2xl mb-4">Einladung annehmen</h2>
        <p className="mb-8 text-muted">
          Sie wurden eingeladen, einem Team auf Podea beizutreten. Klicken Sie unten, um die Einladung zu bestätigen.
        </p>

        {status === 'loading' && <div>Lade...</div>}
        
        {status === 'success' && (
          <div className="text-status-success mb-4">
            Erfolg! Sie werden zum Dashboard weitergeleitet...
          </div>
        )}

        {status === 'error' && (
          <div className="text-status-warning mb-4">
            {error}
          </div>
        )}

        {status !== 'success' && (
          <Button 
            variant="accent" 
            onClick={handleJoin} 
            disabled={status === 'loading'}
            style={{ width: '100%' }}
          >
            Jetzt beitreten
          </Button>
        )}
      </Card>
    </div>
  );
};
