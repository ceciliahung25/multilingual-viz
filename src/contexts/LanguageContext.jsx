import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 从localStorage获取语言设置，默认为中文
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'zh';
  });

  // 当语言改变时保存到localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // 判断是否为中文
  const isChinese = language === 'zh';

  // 切换语言的函数
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isChinese }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义hook，用于在组件中获取语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 