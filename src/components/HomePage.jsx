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
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    minHeight: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
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
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 3),
    borderRadius: 12,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
    borderRadius: 8,
    margin: theme.spacing(1),
  },
}));

const TitleSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  textAlign: 'center',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4),
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(0, 2),
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
    padding: theme.spacing(0, 1),
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.5),
    padding: 0,
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  width: '100%',
  justifyContent: 'center',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
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
  [theme.breakpoints.down('md')]: {
    height: '300px',
    borderRadius: 12,
  },
  [theme.breakpoints.down('sm')]: {
    height: '250px',
    borderRadius: 8,
  },
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
  [theme.breakpoints.down('md')]: {
    minHeight: '42px',
    padding: '6px 10px',
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '36px',
    padding: '5px 8px',
    borderRadius: 6,
  },
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
  [theme.breakpoints.down('md')]: {
    fontSize: '16px',
    width: '28px',
    minWidth: '28px',
    marginRight: '10px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
    width: '24px',
    minWidth: '24px',
    marginRight: '8px',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: '50px',
  marginTop: '30px',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    marginBottom: '20px',
    marginTop: '15px',
    fontSize: '1.3rem',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '12px',
    marginTop: '8px',
    fontSize: '1rem',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
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
            mb: 2,
            fontSize: { xs: '1.53rem', sm: '2.2rem', md: '2.5rem', lg: '3rem' }
          }}>
            {t('homepage.title', language)}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{
            textAlign: 'center',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            lineHeight: { xs: 1.2, sm: 1.4, md: 1.6 }
          }}>
            {t('homepage.subtitle', language)}
          </Typography>
        </TitleSection>

        <ContentSection>
          <MainContent>
            {/* 左侧大图部分 */}
            <Box sx={{ 
              flex: '0 0 36%',
              [theme => theme.breakpoints.down('lg')]: {
                flex: '1',
                width: '100%'
              }
            }}>
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
            <Box sx={{ 
              flex: '0 0 32%',
              [theme => theme.breakpoints.down('lg')]: {
                flex: '1',
                width: '100%'
              }
            }}>
              <SectionCard sx={{ 
                padding: '24px',
                [theme => theme.breakpoints.down('md')]: {
                  padding: '16px'
                },
                [theme => theme.breakpoints.down('sm')]: {
                  padding: '0'  // 移动端移除内边距，与图片卡片保持一致
                }
              }}>
                <SectionTitle variant="h5">
                  {t('homepage.exploreTools', language)}
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: { xs: 0.8, sm: 1, md: 1.5 },
                  [theme => theme.breakpoints.down('sm')]: {
                    padding: '12px'  // 在移动端为内容区域添加内边距
                  }
                }}>
                  {/* 工具按钮列表 */}
                  <FunctionButton onClick={() => handleModuleClick('gallery')}>
                    <IconBox><FaImages /></IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}>
                      {t('homepage.symbolGallery', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('sentencecomposer')}>
                    <IconBox>{modules[1].icon}</IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}>
                      {t('homepage.sentenceBuilder', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('namevisualizer')}>
                    <IconBox>{modules[2].icon}</IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}>
                      {t('homepage.identityGenerator', language)}
                    </Typography>
                  </FunctionButton>

                  <FunctionButton onClick={() => handleModuleClick('symbolrecognizer')}>
                    <IconBox><FaRobot /></IconBox>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}>
                      {t('homepage.omniDInSpace', language)}
                    </Typography>
                  </FunctionButton>
                </Box>
              </SectionCard>
            </Box>

            {/* 右侧 Omni-D Lexicon 卡片 */}
            <Box sx={{ 
              flex: '0 0 32%',
              [theme => theme.breakpoints.down('lg')]: {
                flex: '1',
                width: '100%'
              }
            }}>
              <SectionCard onClick={() => handleModuleClick('tokengenerator')} sx={{ 
                padding: '24px', 
                cursor: 'pointer',
                [theme => theme.breakpoints.down('md')]: {
                  padding: '16px'
                },
                [theme => theme.breakpoints.down('sm')]: {
                  padding: '0'  // 移动端移除内边距，与图片卡片保持一致
                }
              }}>
                <SectionTitle variant="h5">
                  {t('homepage.omniDLexicon', language)}
                </SectionTitle>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2,
                  [theme => theme.breakpoints.down('sm')]: {
                    padding: '12px'  // 在移动端为内容区域添加内边距
                  }
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