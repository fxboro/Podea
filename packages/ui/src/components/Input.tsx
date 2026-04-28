import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`podea-input-group ${className}`}>
      <label htmlFor={inputId} className="podea-label">
        {label}
      </label>
      <input 
        id={inputId} 
        className="podea-input" 
        {...props} 
      />
      {error && (
        <span style={{ color: 'var(--color-status-warning)', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
