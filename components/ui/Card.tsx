
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
    // Luxury Refinement: Removed default heavy shadow. Added light border.
    // Added 'bg-p-surface' (lighter ivory) instead of pure white for warmth, or pure white if context demands.
    // Shadow only appears on hover if clickable.
    
    const interactiveStyles = onClick 
        ? 'cursor-pointer hover:shadow-soft hover:border-p-accent/30 hover:-translate-y-0.5 transition-all duration-300' 
        : '';
        
    return (
        <div 
            className={`bg-white rounded-xl border border-p-stone/60 p-4 sm:p-6 md:p-8 ${interactiveStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
