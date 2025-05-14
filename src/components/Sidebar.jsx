import React from 'react';
import { FaRocket, FaRobot, FaPuzzlePiece, FaFont, FaSearch, FaMicrophone, FaAtom, FaNetworkWired } from 'react-icons/fa';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="sidebar">
      <div className="logo" onClick={() => setActivePage('homepage')} style={{ cursor: 'pointer', filter: 'brightness(0) invert(1)' }}>
        <img src="/logo192.png" alt="Logo" />
      </div>
      <div className="menu">
        <button
          className={activePage === 'gallery' ? 'active' : ''}
          onClick={() => setActivePage('gallery')}
          title="可视化图库"
        >
          <FaNetworkWired />
        </button>
        <button
          className={activePage === 'tokengenerator' ? 'active' : ''}
          onClick={() => setActivePage('tokengenerator')}
          title="Token生成器"
        >
          <FaSearch />
        </button>
        <button
          className={activePage === 'puzzlesentence' ? 'active' : ''}
          onClick={() => setActivePage('puzzlesentence')}
          title="Omni-D宣言"
        >
          <FaMicrophone />
        </button>
        <button
          className={activePage === 'sentencecomposer' ? 'active' : ''}
          onClick={() => setActivePage('sentencecomposer')}
          title="句子拼接"
        >
          <FaPuzzlePiece />
        </button>
        <button
          className={activePage === 'namevisualizer' ? 'active' : ''}
          onClick={() => setActivePage('namevisualizer')}
          title="身份生成"
        >
          <FaFont />
        </button>
        <button
          className={activePage === 'space' ? 'active' : ''}
          onClick={() => setActivePage('space')}
          title="空间画廊"
        >
          <FaRocket />
        </button>
        <button
          className={activePage === 'symbols' ? 'active' : ''}
          onClick={() => setActivePage('symbols')}
          title="符号识别"
        >
          <FaRobot />
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 