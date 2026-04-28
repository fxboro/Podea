import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@podea/ui';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <Card size="large" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: '24px', color: 'var(--color-status-warning)', marginBottom: 'var(--spacing-md)' }}>
          Zugriff verweigert
        </h1>
        <p style={{ color: 'var(--color-primary-muted)', marginBottom: 'var(--spacing-xl)' }}>
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Bitte kontaktieren Sie Ihren Studio-Administrator.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
          Zurück zum Dashboard
        </Button>
      </Card>
    </div>
  );
};
