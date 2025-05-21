import React from 'react';
import './SpaceGallery.css';
import PageLayout from './PageLayout';
import { Box, Typography } from '@mui/material';
import { CardItem } from './CommonStyles';

const SpaceGallery = () => {
  // 临时数据，后续会替换为真实数据
  const scenes = [
    {
      id: 1,
      title: "太空厕所标识",
      image: "/images/toilet.png",
      description: "太空站厕所门口的标识符号"
    },
    {
      id: 2,
      title: "控制面板",
      image: "/images/panel.png",
      description: "太空站控制面板上的操作标识"
    },
    {
      id: 3,
      title: "紧急出口",
      image: "/images/exit.png",
      description: "太空站紧急出口标识"
    }
  ];

  return (
    <PageLayout
      title="太空场景图库"
      subtitle="探索太空站和航天器中使用的各种符号和标识"
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
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 1 }}>{scene.title}</Typography>
              <Typography variant="body2" color="text.secondary">{scene.description}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </PageLayout>
  );
};

export default SpaceGallery; 