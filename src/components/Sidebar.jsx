import React from 'react';
import { FaRocket, FaRobot, FaPuzzlePiece, FaFont, FaSearch, FaImages } from 'react-icons/fa';
import { FaLanguage } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

const Sidebar = ({ activePage, setActivePage }) => {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <div className="sidebar">
      <div className="logo" onClick={() => setActivePage('homepage')} style={{ cursor: 'pointer', filter: 'brightness(0) invert(1)' }}>
        <img src="/web logo.png" alt="Logo" />
      </div>
      <div className="menu">
        <button
          className={activePage === 'gallery' ? 'active' : ''}
          onClick={() => setActivePage('gallery')}
          title={t('sidebar.gallery', language)}
        >
          <FaImages />
        </button>
        <button
          className={activePage === 'tokengenerator' ? 'active' : ''}
          onClick={() => setActivePage('tokengenerator')}
          title={t('sidebar.tokenGenerator', language)}
        >
          <FaSearch />
        </button>
        <button
          className={activePage === 'sentencecomposer' ? 'active' : ''}
          onClick={() => setActivePage('sentencecomposer')}
          title={t('sidebar.sentenceComposer', language)}
        >
          <FaPuzzlePiece />
        </button>
        <button
          className={activePage === 'namevisualizer' ? 'active' : ''}
          onClick={() => setActivePage('namevisualizer')}
          title={t('sidebar.nameVisualizer', language)}
        >
          <FaFont />
        </button>
        <button
          className={activePage === 'space' ? 'active' : ''}
          onClick={() => setActivePage('space')}
          title={t('sidebar.spaceGallery', language)}
        >
          <FaRocket />
        </button>
        <button
          className={activePage === 'symbols' ? 'active' : ''}
          onClick={() => setActivePage('symbols')}
          title={t('sidebar.symbolRecognizer', language)}
        >
          <FaRobot />
        </button>
      </div>
      
      {/* 语言切换按钮 - 放在侧边栏底部 */}
      <div className="language-toggle" style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        cursor: 'pointer'
      }}>
        <button
          onClick={toggleLanguage}
          title={language === 'en' ? '切换到中文' : 'Switch to English'}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaLanguage />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 