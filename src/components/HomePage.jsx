import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaPuzzlePiece, FaFont, FaRocket, FaImages } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

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
  maxWidth: 1200,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3)
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  width: '100%',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column'
  }
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
  flex: 1,
  minWidth: 0, // 防止flex项目溢出
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
  minHeight: '50px',
  width: '100%',
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
  const { language } = useLanguage();
  
  // 模块数据
  const modules = [
    {
      id: 'tokengenerator',
      name: t('homepage.features.tokenGenerator', language),
      component: 'tokengenerator',
      image: '/images/图片2.jpg',
      description: t('homepage.features.tokenDesc', language)
    },
    {
      id: 'sentencecomposer',
      name: t('homepage.features.sentenceComposer', language),
      component: 'sentencecomposer',
      icon: <FaPuzzlePiece />
    },
    {
      id: 'namevisualizer',
      name: t('homepage.features.nameVisualizer', language),
      component: 'namevisualizer',
      icon: <FaFont />
    },
    {
      id: 'space',
      name: t('homepage.features.spaceGallery', language),
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
            {t('homepage.title', language)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t('homepage.subtitle', language)}
          </Typography>
        </TitleSection>

        <ContentSection>
          <MainContent>
            {/* 左侧大图部分 */}
            <Box sx={{ flex: '0 0 45%' }}>
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
            </Box>

            {/* 中间工具列表 */}
            <Box sx={{ flex: '0 0 30%' }}>
              <SectionCard sx={{ padding: '24px' }}>
                <SectionTitle variant="h5">
                  {t('homepage.exploreTools', language)}
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5
                }}>
                  {/* 工具按钮列表 */}
                  <FunctionButton onClick={() => handleModuleClick('gallery')}>
                    <IconBox><FaImages /></IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      {t('homepage.symbolGallery', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('sentencecomposer')}>
                    <IconBox>{modules[1].icon}</IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      {t('homepage.sentenceBuilder', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('namevisualizer')}>
                    <IconBox>{modules[2].icon}</IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      {t('homepage.identityGenerator', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('space')}>
                    <IconBox><FaRocket /></IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      {t('homepage.omniDInSpace', language)}
                    </Typography>
                  </FunctionButton>
                </Box>
              </SectionCard>
            </Box>

            {/* 右侧 Omni-D Lexicon 卡片 */}
            <Box sx={{ flex: '0 0 25%' }}>
              <SectionCard onClick={() => handleModuleClick('tokengenerator')} sx={{ padding: '24px', cursor: 'pointer' }}>
                <SectionTitle variant="h5">
                  {t('homepage.omniDLexicon', language)}
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <ImageBox>
                    <ModuleImage src="/images/图片2.jpg" alt="Omni-D Declaration" />
                  </ImageBox>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    textAlign: 'center'
                  }}>
                    {t('homepage.features.tokenDesc', language)}
                  </Typography>
                </Box>
              </SectionCard>
            </Box>
          </MainContent>
        </ContentSection>
      </MainCard>
    </HomeContainer>
  );
};

export default HomePage; 