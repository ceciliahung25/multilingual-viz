import React from 'react';
import './SpaceGallery.css';
import PageLayout from './PageLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { Box, Typography } from '@mui/material';

const SpaceGallery = () => {
  const { language } = useLanguage();
  
  // 临时数据，后续会替换为真实数据
  const scenes = [
    {
      id: 1,
      title: language === 'zh' ? '太空洗手间' : 'Space Restroom',
      image: "/images/toilet.png",
      description: language === 'zh' ? '轨道站洗手间门的符号标识' : 'Symbolic signage for restroom doors in orbital stations'
    },
    {
      id: 2,
      title: language === 'zh' ? '控制面板' : 'Control Panel',
      image: "/images/panel.png",
      description: language === 'zh' ? '太空控制面板上使用的界面标记' : 'Interface markings used on space control panels'
    },
    {
      id: 3,
      title: language === 'zh' ? '紧急出口' : 'Emergency Exit',
      image: "/images/exit.png",
      description: language === 'zh' ? '空间站走廊中指示紧急出口的符号' : 'Symbols indicating emergency exits in space station corridors'
    }
  ];

  return (
    <PageLayout
      title={t('spaceGallery.title', language)}
      subtitle={t('spaceGallery.subtitle', language)}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, p: 1 }}>
        {scenes.map(scene => (
          <Box key={scene.id} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            height: '100%',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            }
          }}>
            <Box sx={{ width: '100%', height: 180, overflow: 'hidden' }}>
              <img src={scene.image} alt={scene.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box sx={{ padding: '16px 20px', width: '100%', flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 0.5 }}>{scene.title}</Typography>
              <Typography variant="body2" color="text.secondary">{scene.description}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </PageLayout>
  );
};

export default SpaceGallery; 