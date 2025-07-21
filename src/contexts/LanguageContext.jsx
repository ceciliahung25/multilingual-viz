import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// 获取初始语言设置
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  console.log('Getting initial language:', { savedLanguage, defaultTo: 'en' });
  // 只接受有效的语言值
  return savedLanguage === 'zh' ? 'zh' : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getInitialLanguage);

  // 当语言改变时保存到localStorage
  useEffect(() => {
    console.log('Language changed to:', language);
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