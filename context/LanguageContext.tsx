
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, Translations } from '../types';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (translations: Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = localStorage.getItem('podea_language');
                if (saved === 'de' || saved === 'en') {
                    return saved;
                }
            }
        } catch {
            // Ignore potential security / sandbox errors
        }
        return 'de';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('podea_language', lang);
            }
        } catch {
            // Ignore
        }
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.lang = lang;
        }
    };

    const t = (translations: Translations) => {
        if (!translations) return '';
        return translations[language] || translations['de'] || '';
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
