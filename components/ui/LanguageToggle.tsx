import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';

interface LanguageToggleProps {
    className?: string;
    variant?: 'default' | 'compact';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '', variant = 'default' }) => {
    const { language, setLanguage } = useLanguage();

    const handleSelect = (lang: Language, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLanguage(lang);
    };

    const isCompact = variant === 'compact';

    return (
        <div 
            role="group" 
            aria-label="Sprachauswahl / Language selector"
            className={`inline-flex items-center rounded-xl bg-p-stone/50 p-1 border border-p-stone shadow-inner select-none transition-all flex-shrink-0 z-10 ${className}`}
        >
            <button
                type="button"
                onClick={(e) => handleSelect('de', e)}
                aria-pressed={language === 'de'}
                className={`flex items-center justify-center font-sans transition-all duration-200 rounded-lg min-h-[34px] cursor-pointer ${
                    isCompact ? 'px-2 py-1 text-xs' : 'px-2.5 sm:px-3 py-1 text-xs font-semibold'
                } ${
                    language === 'de'
                        ? 'bg-p-primary text-white shadow-sm font-bold scale-[1.02]'
                        : 'text-p-primary/70 hover:text-p-primary hover:bg-white/40 active:scale-95'
                }`}
                title="Deutsch"
            >
                <span className="text-[11px] sm:text-xs tracking-wider">DE</span>
            </button>
            <button
                type="button"
                onClick={(e) => handleSelect('en', e)}
                aria-pressed={language === 'en'}
                className={`flex items-center justify-center font-sans transition-all duration-200 rounded-lg min-h-[34px] cursor-pointer ${
                    isCompact ? 'px-2 py-1 text-xs' : 'px-2.5 sm:px-3 py-1 text-xs font-semibold'
                } ${
                    language === 'en'
                        ? 'bg-p-primary text-white shadow-sm font-bold scale-[1.02]'
                        : 'text-p-primary/70 hover:text-p-primary hover:bg-white/40 active:scale-95'
                }`}
                title="English"
            >
                <span className="text-[11px] sm:text-xs tracking-wider">EN</span>
            </button>
        </div>
    );
};

export default LanguageToggle;
