import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ContentBox = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  padding: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}));

const Home = () => {
  return (
    <ContentBox>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎使用多语言可视化平台
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ maxWidth: 800, textAlign: 'center', mt: 2 }}>
        请使用左侧导航栏访问各个功能模块
      </Typography>
    </ContentBox>
  );
};

export default Home; 