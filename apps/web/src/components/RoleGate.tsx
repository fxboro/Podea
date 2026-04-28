import React from 'react';
import { useAuth, type PodeaClaims } from '../contexts/AuthContext';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: Array<PodeaClaims['role']>;
}

export const RoleGate: React.FC<RoleGateProps> = ({ children, allowedRoles }) => {
  const { claims } = useAuth();

  if (!claims?.role || !allowedRoles.includes(claims.role)) {
    return null;
  }

  return <>{children}</>;
};
