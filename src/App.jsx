import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import SpaceGallery from './components/SpaceGallery';
import SymbolRecognizer from './components/SymbolRecognizer';
import SymbolRecognizerCN from './components/SymbolRecognizerCN';
import PuzzleSentence from './components/PuzzleSentence';
import NameVisualizer from './components/NameVisualizer';
import SentenceComposer from './components/SentenceComposer';
import Gallery from './components/Gallery/Gallery';
import TokenGenerator from './components/TokenGenerator/TokenGenerator';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import './App.css';

// 创建主题
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    primary: {
      main: '#000000',
    },
  },
});

// 主应用组件
const AppContent = () => {
  const [activePage, setActivePage] = useState('homepage');
  const { isChinese } = useLanguage();

  const renderPage = () => {
    switch (activePage) {
      case 'homepage':
        return <HomePage setActivePage={setActivePage} />;
      case 'gallery':
        return <Gallery />;
      case 'tokengenerator':
        return <TokenGenerator />;
      case 'space':
        return <SpaceGallery />;
      case 'symbols':
        // 根据语言选择使用哪个符号识别器组件
        return isChinese ? <SymbolRecognizerCN /> : <SymbolRecognizer />;
      case 'puzzlesentence':
        return <PuzzleSentence />;
      case 'namevisualizer':
        return <NameVisualizer />;
      case 'sentencecomposer':
        return <SentenceComposer />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App; 