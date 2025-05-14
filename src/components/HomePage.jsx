import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

// 样式定义
const HomeContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '24px',
}));

const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  width: '100%',
  padding: '32px',
  maxWidth: 1200,
  minHeight: 'calc(100vh - 96px)',
}));

const TitleSection = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  textAlign: 'center',
}));

const ModuleCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: '8px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  },
}));

const ImageBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '160px',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '12px',
}));

const ModuleImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const HomePage = ({ setActivePage }) => {
  // 模块数据
  const modules = [
    {
      id: 'puzzlesentence',
      name: 'Omni-D宣言',
      component: 'puzzlesentence', // 对应的组件名
      image: '/images/图片2.jpg'
    },
    {
      id: 'sentencecomposer',
      name: '句子拼接',
      component: 'sentencecomposer',
      image: '/images/placeholder1.svg'
    },
    {
      id: 'namevisualizer',
      name: '身份生成',
      component: 'namevisualizer',
      image: '/images/placeholder2.svg'
    },
    {
      id: 'symbolrecognizer',
      name: '即时取词',
      component: 'symbolrecognizer',
      image: '/images/placeholder3.svg'
    }
  ];

  // 点击模块时的处理函数
  const handleModuleClick = (componentName) => {
    // 根据不同的模块，导航到对应的页面
    switch (componentName) {
      case 'puzzlesentence':
        setActivePage('puzzlesentence');
        break;
      case 'sentencecomposer':
        setActivePage('sentencecomposer');
        break;
      case 'namevisualizer':
        setActivePage('namevisualizer');
        break;
      case 'symbolrecognizer':
        setActivePage('symbolrecognizer');
        break;
      default:
        break;
    }
  };

  return (
    <HomeContainer>
      <MainCard>
        <TitleSection>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Omni-D: Semiotic Engine
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            多语言可视化系统
          </Typography>
        </TitleSection>

        {/* 主要内容区域 - 分为左右两部分 */}
        <Grid container spacing={4}>
          {/* 左侧大图部分 */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0}
              sx={{
                height: '400px',
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: '#f7f7f9'
              }}
            >
              <img 
                src="/images/图片1.png" 
                alt="Omni-D 主图" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            </Paper>
          </Grid>

          {/* 右侧模块部分 */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                height: '400px',
                bgcolor: '#f7f7f9',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Omni-D宣言
              </Typography>
              
              <Box 
                sx={{ 
                  flex: 1, 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img 
                  src="/images/图片2.jpg" 
                  alt="Omni-D宣言" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModuleClick('puzzlesentence')}
                />
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => handleModuleClick('puzzlesentence')}
              >
                选择语言，在线查词
              </Typography>
            </Paper>
          </Grid>

          {/* 底部三个模块卡片 */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {modules.slice(1).map((module) => (
                <Grid item xs={12} md={4} key={module.id}>
                  <ModuleCard onClick={() => handleModuleClick(module.component)}>
                    <ImageBox>
                      <ModuleImage src={module.image} alt={module.name} />
                    </ImageBox>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {module.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                    </Typography>
                  </ModuleCard>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
    </HomeContainer>
  );
};

export default HomePage; 