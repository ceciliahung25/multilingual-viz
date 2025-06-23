import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // 从localStorage获取初始语言，默认为英文
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem('language', newLang);
      return newLang;
    });
  };

  // 监听外部语言切换事件（用于快速切换脚本）
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLang = event.detail.language;
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const value = {
    language,
    setLanguage: (newLang) => {
      setLanguage(newLang);
      localStorage.setItem('language', newLang);
    },
    toggleLanguage,
    isChinese: language === 'zh'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 