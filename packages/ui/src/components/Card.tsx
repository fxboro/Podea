import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'normal' | 'large';
  isUpsell?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  size = 'normal', 
  isUpsell = false, 
  className = '', 
  children, 
  ...props 
}) => {
  const sizeClass = size === 'large' ? 'podea-card-large' : '';
  const upsellClass = isUpsell ? 'podea-card-upsell' : '';

  return (
    <div 
      className={`podea-card ${sizeClass} ${upsellClass} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};
