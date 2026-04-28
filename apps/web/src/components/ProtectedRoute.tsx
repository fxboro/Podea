import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type PodeaClaims } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<PodeaClaims['role']>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, claims, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-primary-muted font-sans">Sitzung wird verifiziert...</div>;
  }

  // 1. Check if completely unauthenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Orphan Account Check (Missing Claims means they haven't bought a sub or been invited)
  if (!claims?.role || !claims?.studioId) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Granular RBAC Check
  if (allowedRoles && claims.role && !allowedRoles.includes(claims.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
