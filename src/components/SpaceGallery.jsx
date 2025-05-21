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
    },
    {
      id: 4,
      title: "设备标识",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "太空设备上的标识符号"
    },
    {
      id: 5,
      title: "安全警告",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "太空站安全警告标识"
    },
    {
      id: 6,
      title: "操作指示",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "设备操作指示标识"
    },
    {
      id: 7,
      title: "区域标识",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "太空站不同区域标识"
    },
    {
      id: 8,
      title: "设备开关",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "设备开关标识"
    },
    {
      id: 9,
      title: "维护标识",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f0f0f0'/%3E%3C/svg%3E",
      description: "设备维护标识"
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
            borderRadius: 3, // 减小圆角，从原来的3(18px)减小到2(12px)
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // 小阴影
            height: '100%',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)', // 悬浮时增加阴影
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