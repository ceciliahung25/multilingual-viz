import React from 'react';
import { FaHome, FaLanguage, FaBook, FaRocket, FaImage } from 'react-icons/fa';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="menu">
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => setActivePage('home')}
        >
          <FaHome />
        </button>
        <button
          className={activePage === 'language' ? 'active' : ''}
          onClick={() => setActivePage('language')}
        >
          <FaLanguage />
        </button>
        <button
          className={activePage === 'dictionary' ? 'active' : ''}
          onClick={() => setActivePage('dictionary')}
        >
          <FaBook />
        </button>
        <button
          className={activePage === 'space' ? 'active' : ''}
          onClick={() => setActivePage('space')}
        >
          <FaRocket />
        </button>
        <button
          className={activePage === 'symbols' ? 'active' : ''}
          onClick={() => setActivePage('symbols')}
          title="符号识别"
        >
          <FaImage />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 