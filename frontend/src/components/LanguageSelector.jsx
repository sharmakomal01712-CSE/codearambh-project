import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { currentLang, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English', region: 'India / Global' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'भारत' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'ਪੰਜਾਬ' },
    { code: 'hr', label: 'Haryanvi', native: 'हरियाणवी', region: 'हरियाणा' },
    { code: 'ur', label: 'Urdu', native: 'اردو', region: 'ہندوستان' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentObj = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/90 hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        title="Select Platform Language"
      >
        <Globe className="w-4 h-4 text-emerald-600" />
        <span className="font-semibold">{currentObj.native}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Language • भाषा चुनें
          </div>
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-emerald-50 transition-colors ${
                  isSelected ? 'bg-emerald-50/70 text-emerald-800 font-semibold' : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">{lang.native}</div>
                  <div className="text-xs text-slate-400">{lang.label} ({lang.region})</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
