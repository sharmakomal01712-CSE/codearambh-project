import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('sehatkosh_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLang(langCode);
      localStorage.setItem('sehatkosh_lang', langCode);
    }
  };

  useEffect(() => {
    // Handle RTL for Urdu and LTR for others
    const dir = currentLang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLang;

    // Apply font family based on language for crisp rendering
    if (currentLang === 'ur') {
      document.body.style.fontFamily = "'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, sans-serif";
    } else if (currentLang === 'pa') {
      document.body.style.fontFamily = "'Noto Sans Gurmukhi', 'Inter', system-ui, sans-serif";
    } else if (currentLang === 'hi' || currentLang === 'hr') {
      document.body.style.fontFamily = "'Noto Sans Devanagari', 'Inter', system-ui, sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
    }
  }, [currentLang]);

  const t = translations[currentLang] || translations.en;

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, availableLanguages: translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
