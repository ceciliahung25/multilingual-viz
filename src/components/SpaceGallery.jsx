import React from 'react';
import './SpaceGallery.css';

const SpaceGallery = () => {
  // 临时数据，后续会替换为真实数据
  const scenes = [
    {
      id: 1,
      title: "太空厕所标识",
      image: "https://via.placeholder.com/300x300?text=Toilet+Sign",
      description: "太空站厕所门口的标识符号"
    },
    {
      id: 2,
      title: "控制面板",
      image: "https://via.placeholder.com/300x300?text=Control+Panel",
      description: "太空站控制面板上的操作标识"
    },
    {
      id: 3,
      title: "紧急出口",
      image: "https://via.placeholder.com/300x300?text=Emergency+Exit",
      description: "太空站紧急出口标识"
    },
    {
      id: 4,
      title: "设备标识",
      image: "https://via.placeholder.com/300x300?text=Equipment+Sign",
      description: "太空设备上的标识符号"
    },
    {
      id: 5,
      title: "安全警告",
      image: "https://via.placeholder.com/300x300?text=Warning+Sign",
      description: "太空站安全警告标识"
    },
    {
      id: 6,
      title: "操作指示",
      image: "https://via.placeholder.com/300x300?text=Operation+Guide",
      description: "设备操作指示标识"
    },
    {
      id: 7,
      title: "区域标识",
      image: "https://via.placeholder.com/300x300?text=Area+Sign",
      description: "太空站不同区域标识"
    },
    {
      id: 8,
      title: "设备开关",
      image: "https://via.placeholder.com/300x300?text=Switch+Sign",
      description: "设备开关标识"
    },
    {
      id: 9,
      title: "维护标识",
      image: "https://via.placeholder.com/300x300?text=Maintenance+Sign",
      description: "设备维护标识"
    }
  ];

  return (
    <div className="space-gallery">
      <h1>太空场景图库</h1>
      <div className="gallery-grid">
        {scenes.map(scene => (
          <div key={scene.id} className="scene-card">
            <img src={scene.image} alt={scene.title} />
            <h3>{scene.title}</h3>
            <p>{scene.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceGallery; 