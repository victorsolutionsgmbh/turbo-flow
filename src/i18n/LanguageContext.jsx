import React, { createContext, useContext, useState } from 'react';
import translations from './translations.json';

const LANG_KEY = 'turboflow_language';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANG_KEY) || 'de'
  );

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const t = (key, vars) => {
    const dict = translations[language] || translations['de'];
    let text = dict[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  const availableLanguages = Object.keys(translations);

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
