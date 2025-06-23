import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaPuzzlePiece, FaFont, FaRobot, FaRocket, FaImages } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

// 样式定义
const HomeContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  width: '100%',
  padding: theme.spacing(8, 5),
  maxWidth: 1280,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
}));

const TitleSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(0, 2),
  alignItems: 'center',
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  width: '100%',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'center',
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
  minWidth: 0,
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
  backgroundColor: '#A9A9A9',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#939393',
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

  const handleModuleClick = (componentName) => {
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
        setActivePage('symbols');
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
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            textAlign: 'center',
            mb: 2
          }}>
            {t('homepage.title', language)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{
            textAlign: 'center'
          }}>
            {t('homepage.subtitle', language)}
          </Typography>
        </TitleSection>

        <ContentSection>
          <MainContent>
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

            <Box sx={{ flex: '0 0 23%' }}>
              <SectionCard sx={{ padding: '24px' }}>
                <SectionTitle variant="h5">
                  {t('homepage.exploreTools', language)}
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5
                }}>
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

                  <FunctionButton onClick={() => handleModuleClick('symbolrecognizer')}>
                    <IconBox><FaRobot /></IconBox>
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

            <Box sx={{ flex: '0 0 32%' }}>
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