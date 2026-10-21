
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
    // Luxury refinement: rounded-full, slightly wider tracking, lighter font weight
    const baseStyles = 'px-8 py-3.5 font-sans font-medium text-sm tracking-wide rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
        primary: 'bg-p-primary text-white hover:bg-[#2D3B4B] shadow-soft focus:ring-p-primary',
        secondary: 'bg-transparent text-p-primary border border-p-primary/30 hover:border-p-primary hover:bg-p-primary/5 focus:ring-p-primary',
        accent: 'bg-p-accent text-white hover:bg-[#B6964E] shadow-soft focus:ring-p-accent',
        ghost: 'bg-transparent text-p-primary/70 hover:text-p-primary hover:bg-black/5',
    };

    return (
        <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
