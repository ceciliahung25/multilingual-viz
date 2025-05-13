import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import LanguageSelector from './components/LanguageSelector';
import Dictionary from './components/Dictionary';
import SpaceGallery from './components/SpaceGallery';
import SymbolRecognizer from './components/SymbolRecognizer';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'language':
        return <LanguageSelector />;
      case 'dictionary':
        return <Dictionary />;
      case 'space':
        return <SpaceGallery />;
      case 'symbols':
        return <SymbolRecognizer />;
      default:
        return <Home />;
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
}

export default App; 