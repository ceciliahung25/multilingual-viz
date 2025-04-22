import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, AppBar } from '@mui/material';
import Gallery from './Gallery/Gallery';
import TokenGenerator from './TokenGenerator/TokenGenerator';

const Home = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#2d2d2d' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            多语言可视化平台
          </Typography>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="可视化图库" />
            <Tab label="Token生成器" />
          </Tabs>
        </Box>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {currentTab === 0 ? (
          <Gallery />
        ) : (
          <TokenGenerator />
        )}
      </Box>
    </Box>
  );
};

export default Home; 