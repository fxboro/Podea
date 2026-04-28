import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { Button, Card } from '@podea/ui';
import { RoleGate } from '../../components/RoleGate';

export const AdminDashboard: React.FC = () => {
  const { user, claims } = useAuth();

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: 'var(--max-w-7xl)', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1 className="font-serif" style={{ margin: '0 0 var(--spacing-sm)', fontSize: '32px' }}>Studio Dashboard</h1>
          <p style={{ color: 'var(--color-primary-muted)', margin: 0 }}>
            Eingeloggt als: {user?.email} 
            <span style={{ marginLeft: '10px', padding: '4px 8px', background: 'var(--color-bg-surface)', borderRadius: '4px', fontSize: '14px', border: '1px solid #E5E7EB' }}>
                Rolle: {claims?.role || 'Unbekannt'}
            </span>
          </p>
        </div>
        <Button variant="secondary" onClick={() => auth.signOut()}>Abmelden</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <Card>
           <h2 className="font-serif" style={{ marginTop: 0 }}>Heutige Termine</h2>
           <p style={{ color: 'var(--color-primary-muted)' }}>Keine Termine verfügbar.</p>
        </Card>
        
        <RoleGate allowedRoles={['studio_admin', 'platform_admin']}>
          <Card isUpsell>
             <h2 className="font-serif" style={{ marginTop: 0 }}>Personal & Team</h2>
             <p style={{ marginBottom: 'var(--spacing-md)' }}>Verwalten Sie Ihr Studio-Team.</p>
             <Button variant="primary">Teammitglied einladen</Button>
          </Card>
        </RoleGate>
      </div>
    </div>
  );
};
