import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role, View } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import Login from './Login';

interface RoleGateProps {
    allowedRoles: Role[];
    children: React.ReactNode;
    setView: (view: View) => void;
    currentViewName?: string;
}

export const RoleGate: React.FC<RoleGateProps> = ({ 
    allowedRoles, 
    children, 
    setView,
    currentViewName 
}) => {
    const { role } = useAuth();
    const { t } = useLanguage();

    const viewTitle = currentViewName || t({ de: 'Dieser Bereich', en: 'This area' });

    // Check if the current user has access (admin has universal access)
    const isAuthorized = role && (allowedRoles.includes(role) || role === 'admin');

    if (isAuthorized) {
        return <>{children}</>;
    }

    // Directly render the dedicated Login component with Email/Password and Google OAuth via Supabase
    return (
        <Login
            allowedRoles={allowedRoles}
            currentViewName={viewTitle}
            setView={setView}
            onSuccess={() => {
                // When auth succeeds, RoleGate will re-evaluate and render children automatically
            }}
        />
    );
};

export default RoleGate;
