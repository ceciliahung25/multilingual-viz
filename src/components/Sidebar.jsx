import React from 'react';
import { FaRocket, FaRobot, FaPuzzlePiece, FaFont, FaSearch, FaAtom, FaNetworkWired } from 'react-icons/fa';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="logo" onClick={() => setActivePage('homepage')} style={{ cursor: 'pointer', filter: 'brightness(0) invert(1)' }}>
        <img src="/web logo.png" alt="Logo" />
      </div>
      <div className="menu">
        <button
          className={activePage === 'gallery' ? 'active' : ''}
          onClick={() => setActivePage('gallery')}
          title="Visualization Gallery"
        >
          <FaNetworkWired />
        </button>
        <button
          className={activePage === 'tokengenerator' ? 'active' : ''}
          onClick={() => setActivePage('tokengenerator')}
          title="Token Generator"
        >
          <FaSearch />
        </button>
        <button
          className={activePage === 'sentencecomposer' ? 'active' : ''}
          onClick={() => setActivePage('sentencecomposer')}
          title="Sentence Composer"
        >
          <FaPuzzlePiece />
        </button>
        <button
          className={activePage === 'namevisualizer' ? 'active' : ''}
          onClick={() => setActivePage('namevisualizer')}
          title="Identity Generator"
        >
          <FaFont />
        </button>
        <button
          className={activePage === 'space' ? 'active' : ''}
          onClick={() => setActivePage('space')}
          title="Space Gallery"
        >
          <FaRocket />
        </button>
        <button
          className={activePage === 'symbols' ? 'active' : ''}
          onClick={() => setActivePage('symbols')}
          title="Symbol Recognition"
        >
          <FaRobot />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 