import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaPuzzlePiece, FaFont, FaRocket, FaImages } from 'react-icons/fa';

// 样式定义
const HomeContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
}));

const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  width: '100%',
  padding: '40px 24px',
  maxWidth: 1280,
  minHeight: '660px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const TitleSection = styled(Box)(({ theme }) => ({
  marginBottom: '40px',
  textAlign: 'center',
  width: '100%',
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: '0',
  height: '400px',
  backgroundColor: '#f7f7f9',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ModuleCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: '24px',
  height: '400px',
  backgroundColor: '#f7f7f9',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

const ModuleImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const ImageBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '180px',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '16px',
}));

const FunctionButton = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  padding: '10px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: '#A9A9A9', // 中灰色背景
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#939393', // 悬停时稍深一点的灰色
  },
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  color: 'white',
  height: '50px',
  width: '100%',
  whiteSpace: 'nowrap',
}));

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
  fontSize: '18px',
  width: '32px',
  minWidth: '32px',
  color: 'white',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: '50px',
  marginTop: '30px',
  textAlign: 'center',
}));

const HomePage = ({ setActivePage }) => {
  // 模块数据
  const modules = [
    {
      id: 'tokengenerator',
      name: 'Omni-D Declaration',
      component: 'tokengenerator',
      image: '/images/图片2.jpg',
      description: 'Select language, look up words online'
    },
    {
      id: 'sentencecomposer',
      name: 'Sentence Composer',
      component: 'sentencecomposer',
      icon: <FaPuzzlePiece />
    },
    {
      id: 'namevisualizer',
      name: 'Identity Generator',
      component: 'namevisualizer',
      icon: <FaFont />
    },
    {
      id: 'space',
      name: 'Space Symbol Archive',
      component: 'space',
      icon: <FaRocket />
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
      case 'space':
        setActivePage('space');
        break;
      case 'symbols':
        setActivePage('symbols');
        break;
      case 'tokengenerator':
        setActivePage('tokengenerator');
        break;
      case 'gallery':
        setActivePage('gallery');
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
            Multilingual Visualization System
          </Typography>
        </TitleSection>

        <ContentSection>
          {/* 主要内容区域 - 分为三部分 */}
          <Grid container spacing={3} sx={{ 
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            justifyContent: 'center'
          }}>
            {/* 左侧大图部分 */}
            <Grid item xs={12} md={5}>
              <SectionCard>
                <img 
                  src="/images/图片1.png" 
                  alt="Omni-D 主图" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </SectionCard>
            </Grid>

            {/* 中间功能模块部分 */}
            <Grid item xs={12} md={3.5}>
              <SectionCard sx={{ padding: '24px' }}>
                <SectionTitle variant="h5">
                  Explore Tools
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'flex-start'
                }}>
                  <Grid container spacing={1.5} direction="column">
                    {/* Symbol Gallery按钮 - 移到最上面 */}
                    <Grid item>
                      <FunctionButton onClick={() => handleModuleClick('gallery')}>
                        <IconBox><FaImages /></IconBox>
                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center' }}>
                          Symbol Gallery
                        </Typography>
                      </FunctionButton>
                    </Grid>

                    {/* 句子拼接按钮 */}
                    <Grid item>
                      <FunctionButton onClick={() => handleModuleClick('sentencecomposer')}>
                        <IconBox>{modules[1].icon}</IconBox>
                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center' }}>
                          Sentence Builder
                        </Typography>
                      </FunctionButton>
                    </Grid>

                    {/* 身份生成按钮 */}
                    <Grid item>
                      <FunctionButton onClick={() => handleModuleClick('namevisualizer')}>
                        <IconBox>{modules[2].icon}</IconBox>
                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center' }}>
                          Identity Generator
                        </Typography>
                      </FunctionButton>
                    </Grid>

                    {/* 太空图库按钮 */}
                    <Grid item>
                      <FunctionButton onClick={() => handleModuleClick('space')}>
                        <IconBox><FaRocket /></IconBox>
                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, textAlign: 'center' }}>
                          Omni-D in Space
                        </Typography>
                      </FunctionButton>
                    </Grid>
                  </Grid>
                </Box>
              </SectionCard>
            </Grid>

            {/* 右侧Omni-D宣言卡片 */}
            <Grid item xs={12} md={3.5}>
              <ModuleCard onClick={() => handleModuleClick('tokengenerator')}>
                <SectionTitle variant="h5">
                  Omni-D Lexicon
                </SectionTitle>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <ImageBox>
                    <ModuleImage src="/images/图片2.jpg" alt="Omni-D Declaration" />
                  </ImageBox>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Select language, look up words online
                  </Typography>
                </Box>
              </ModuleCard>
            </Grid>
          </Grid>
        </ContentSection>
      </MainCard>
    </HomeContainer>
  );
};

export default HomePage; 