import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import Gallery from './Gallery/Gallery';
import TokenGenerator from './TokenGenerator/TokenGenerator';
import PuzzleSentence from './PuzzleSentence';
import { styled } from '@mui/material/styles';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ExtensionIcon from '@mui/icons-material/Extension';
import SearchIcon from '@mui/icons-material/Search';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import NameVisualizer from './NameVisualizer';
import SentenceComposer from './SentenceComposer';
import SymbolRecognizer from './SymbolRecognizer';

// 侧边栏宽度
const SIDEBAR_WIDTH = 90;

const Sidebar = styled(Box)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  height: 'calc(100vh - 48px)',
  background: '#18191c',
  borderRadius: '28px',
  boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '32px 0 24px 0',
  position: 'fixed',
  top: 24,
  left: 24,
  bottom: 24,
  zIndex: 10,
}));
const SidebarIconBtn = styled(IconButton)(({ selected }) => ({
  width: 56,
  height: 56,
  margin: '12px 0',
  borderRadius: 18,
  background: selected ? '#ececf0' : 'transparent',
  color: selected ? '#18191c' : '#fff',
  boxShadow: selected ? '0 2px 8px 0 rgba(0,0,0,0.08)' : 'none',
  transition: 'all 0.18s',
  '&:hover': {
    background: selected ? '#ececf0' : 'rgba(255,255,255,0.08)',
  },
}));
const MainArea = styled(Box)(({ theme }) => ({
  marginLeft: SIDEBAR_WIDTH + 48,
  paddingTop: 0,
  paddingBottom: 24,
  minHeight: '100vh',
  background: '#ececf0',
  transition: 'margin 0.2s',
  marginTop: 24,
}));
const MinimalCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
  background: '#fff',
  padding: '24px 16px',
  maxWidth: 1200,
  margin: '24px auto 0 auto',
  minHeight: 'calc(100vh - 48px)',
  height: 'calc(100vh - 48px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'hidden',
}));

const Home = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Box sx={{ bgcolor: '#ececf0', minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sidebar>
        <Box sx={{ mb: 4 }}>
          <DonutLargeIcon sx={{ fontSize: 44, color: '#fff' }} />
        </Box>
        <Tooltip title="可视化图库" placement="right">
          <SidebarIconBtn selected={currentTab === 0} onClick={() => setCurrentTab(0)}>
            <PhotoLibraryIcon sx={{ fontSize: 32 }} />
          </SidebarIconBtn>
        </Tooltip>
        <Tooltip title="句子拼图" placement="right">
          <SidebarIconBtn selected={currentTab === 1} onClick={() => setCurrentTab(1)}>
            <ExtensionIcon sx={{ fontSize: 32 }} />
          </SidebarIconBtn>
        </Tooltip>
        <Tooltip title="TOKEN生成器" placement="right">
          <SidebarIconBtn selected={currentTab === 2} onClick={() => setCurrentTab(2)}>
            <SearchIcon sx={{ fontSize: 32 }} />
          </SidebarIconBtn>
        </Tooltip>
        <Tooltip title="姓名可视化" placement="right">
          <SidebarIconBtn selected={currentTab === 3} onClick={() => setCurrentTab(3)}>
            <FontDownloadIcon sx={{ fontSize: 32 }} />
          </SidebarIconBtn>
        </Tooltip>
        <Tooltip title="句子拼接" placement="right">
          <SidebarIconBtn selected={currentTab === 4} onClick={() => setCurrentTab(4)}>
            <ExtensionIcon sx={{ fontSize: 32, transform: 'rotate(-45deg)' }} />
          </SidebarIconBtn>
        </Tooltip>
        <Tooltip title="符号识别" placement="right">
          <SidebarIconBtn selected={currentTab === 5} onClick={() => setCurrentTab(5)}>
            <ImageSearchIcon sx={{ fontSize: 32 }} />
          </SidebarIconBtn>
        </Tooltip>
      </Sidebar>
      {/* 主内容区 */}
      <MainArea>
        <MinimalCard>
          {currentTab === 0 && <Gallery />}
          {currentTab === 1 && <PuzzleSentence />}
          {currentTab === 2 && <TokenGenerator />}
          {currentTab === 3 && <NameVisualizer />}
          {currentTab === 4 && <SentenceComposer />}
          {currentTab === 5 && <SymbolRecognizer />}
        </MinimalCard>
      </MainArea>
    </Box>
  );
};

export default Home; 