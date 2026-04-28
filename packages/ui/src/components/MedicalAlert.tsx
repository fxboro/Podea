import React from 'react';

export interface MedicalAlertProps {
  message: string;
  className?: string;
}

export const MedicalAlert: React.FC<MedicalAlertProps> = ({ message, className = '' }) => {
  return (
    <div className={`podea-medical-alert ${className}`}>
      <span className="podea-medical-alert-icon">⚠️</span>
      <span>{message}</span>
    </div>
  );
};
