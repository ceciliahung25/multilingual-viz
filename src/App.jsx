import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import HomePage from './components/HomePage';
import SpaceGallery from './components/SpaceGallery';
import SymbolRecognizer from './components/SymbolRecognizer';
import PuzzleSentence from './components/PuzzleSentence';
import NameVisualizer from './components/NameVisualizer';
import SentenceComposer from './components/SentenceComposer';
import Gallery from './components/Gallery/Gallery';
import TokenGenerator from './components/TokenGenerator/TokenGenerator';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
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

function App() {
  const [activePage, setActivePage] = useState('homepage');

  const renderPage = () => {
    switch (activePage) {
      case 'homepage':
        return <HomePage setActivePage={setActivePage} />;
      case 'home':
        return <Home />;
      case 'gallery':
        return <Gallery />;
      case 'tokengenerator':
        return <TokenGenerator />;
      case 'space':
        return <SpaceGallery />;
      case 'symbols':
        return <SymbolRecognizer />;
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
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <div className="app">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App; 