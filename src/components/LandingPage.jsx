import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

// 样式定义
const LandingContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#000000',
  overflow: 'hidden',
  position: 'relative',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '60px',
  maxWidth: '800px',
  padding: '0 40px',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    gap: '40px',
    padding: '0 24px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '32px',
    padding: '0 16px',
  },
}));

const Title = styled(Typography)({
  fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
  fontWeight: 400,
  fontFamily: '"Zen Dots", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#ffffff',
  lineHeight: 1.3,
  letterSpacing: '0.1em',
  margin: 0,
  textShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 0 60px rgba(255, 255, 255, 0.2)',
  textTransform: 'capitalize',
});

const CanvasContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
});

const GlassButton = styled(Button)(({ theme }) => ({
  padding: '20px 56px',
  fontSize: '0.95rem',
  fontWeight: 400,
  fontFamily: '"Zen Dots", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '50px',
  color: '#ffffff',
  textTransform: 'none',
  letterSpacing: '3px',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.7)',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  [theme.breakpoints.down('md')]: {
    padding: '18px 48px',
    fontSize: '0.9rem',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    letterSpacing: '2.5px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px 40px',
    fontSize: '0.85rem',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    letterSpacing: '2px',
  },
}));

// 四角文字样式
const CornerText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontFamily: '"Zen Dots", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.7rem',
  fontWeight: 400,
  letterSpacing: '1px',
  zIndex: 5,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('md')]: {
    fontSize: '0.6rem',
    letterSpacing: '0.8px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.5rem',
    letterSpacing: '0.5px',
    whiteSpace: 'normal',
    maxWidth: '120px',
    lineHeight: 1.2,
  },
}));

const TopLeftText = styled(CornerText)(({ theme }) => ({
  top: '32px',
  left: '32px',
  fontSize: '0.8rem',
  letterSpacing: '2px',
  [theme.breakpoints.down('md')]: {
    top: '24px',
    left: '24px',
    fontSize: '0.7rem',
    letterSpacing: '1.5px',
  },
  [theme.breakpoints.down('sm')]: {
    top: '16px',
    left: '16px',
    fontSize: '0.6rem',
    letterSpacing: '1px',
  },
}));

const TopRightText = styled(CornerText)(({ theme }) => ({
  top: '32px',
  right: '32px',
  textAlign: 'right',
  [theme.breakpoints.down('md')]: {
    top: '24px',
    right: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    top: '16px',
    right: '16px',
    maxWidth: '140px',
  },
}));

const BottomLeftText = styled(CornerText)(({ theme }) => ({
  bottom: '32px',
  left: '32px',
  [theme.breakpoints.down('md')]: {
    bottom: '24px',
    left: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: '16px',
    left: '16px',
    maxWidth: '110px',
  },
}));

const BottomRightText = styled(CornerText)(({ theme }) => ({
  bottom: '32px',
  right: '32px',
  textAlign: 'right',
  [theme.breakpoints.down('md')]: {
    bottom: '24px',
    right: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: '16px',
    right: '16px',
    maxWidth: '130px',
  },
}));

// 粒子系统
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.center = { x: 0, y: 0 };
    this.radius = 0;
    
    this.init();
    this.setupEventListeners();
  }

  init() {
    this.resize();
    this.createParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.center.x = this.canvas.width / 2;
    this.center.y = this.canvas.height / 2;
    this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.2;
  }

  createParticles() {
    this.particles = [];
    // 根据设备性能调整粒子数量
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth < 1024;
    let numParticles = 2000;
    
    if (isMobile) {
      numParticles = 800;
    } else if (isTablet) {
      numParticles = 1200;
    }
    
    for (let i = 0; i < numParticles; i++) {
      // 在球体内部均匀分布粒子
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * this.radius;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      this.particles.push({
        x: x,
        y: y,
        z: z,
        originalX: x,
        originalY: y,
        originalZ: z,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        brightness: Math.random() * 0.7 + 0.3, // 0.3-1.0 的亮度变化
        pulsePhase: Math.random() * Math.PI * 2, // 用于脉动效果
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    
    // 鼠标事件
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left - this.center.x;
      this.mouse.y = e.clientY - rect.top - this.center.y;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = 0;
      this.mouse.y = 0;
    });

    // 触摸事件
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX - rect.left - this.center.x;
      this.mouse.y = touch.clientY - rect.top - this.center.y;
    });

    this.canvas.addEventListener('touchend', () => {
      this.mouse.x = 0;
      this.mouse.y = 0;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const time = Date.now() * 0.001; // 时间用于动画
    const maxDistance = 200;
    
    this.particles.forEach(particle => {
      // 计算粒子到鼠标的距离
      const dx = particle.x - this.mouse.x;
      const dy = particle.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 应用鼠标排斥力
      if (distance < maxDistance && distance > 0) {
        const force = (maxDistance - distance) / maxDistance * 50;
        const angle = Math.atan2(dy, dx);
        particle.x += Math.cos(angle) * force * 0.1;
        particle.y += Math.sin(angle) * force * 0.1;
      }
      
      // 缓慢回归原位
      particle.x += (particle.originalX - particle.x) * 0.02;
      particle.y += (particle.originalY - particle.y) * 0.02;
      particle.z += (particle.originalZ - particle.z) * 0.02;
      
      // 3D 到 2D 投影
      const perspective = 300;
      const scale = perspective / (perspective + particle.z);
      const screenX = this.center.x + particle.x * scale;
      const screenY = this.center.y + particle.y * scale;
      
      // 根据 z 坐标调整透明度和大小
      const baseAlpha = particle.opacity * scale * (0.3 + 0.7 * (particle.z + this.radius) / (2 * this.radius));
      
      // 添加脉动效果
      const pulse = Math.sin(time * 2 + particle.pulsePhase) * 0.3 + 0.7;
      const alpha = baseAlpha * pulse;
      const size = particle.size * scale * (0.8 + pulse * 0.4);
      
      // 计算渐变的白色
      const brightness = particle.brightness * pulse;
      const grayValue = Math.floor(brightness * 255);
      const color = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      
      // 绘制粒子
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = color;
      
      // 添加白色光晕效果
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = size * 1.5;
      
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

const LandingPage = ({ onExplore }) => {
  const canvasRef = useRef(null);
  const particleSystemRef = useRef(null);
  const [futureTime, setFutureTime] = useState('');

  // 生成未来时间（当前时间+100年）
  useEffect(() => {
    const updateFutureTime = () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (100 * 365.25 * 24 * 60 * 60 * 1000)); // 加100年
      
      const year = futureDate.getUTCFullYear();
      const month = String(futureDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getUTCDate()).padStart(2, '0');
      const hours = String(futureDate.getUTCHours()).padStart(2, '0');
      const minutes = String(futureDate.getUTCMinutes()).padStart(2, '0');
      
      setFutureTime(`${year}.${month}.${day} ${hours}:${minutes} UTC`);
    };

    updateFutureTime();
    const interval = setInterval(updateFutureTime, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      particleSystemRef.current = new ParticleSystem(canvasRef.current);
    }

    return () => {
      if (particleSystemRef.current) {
        // 清理事件监听器
        window.removeEventListener('resize', particleSystemRef.current.resize);
      }
    };
  }, []);

  return (
    <LandingContainer>
      <CanvasContainer>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </CanvasContainer>
      
      {/* 四角文字 */}
      <TopLeftText>Omnid Lab</TopLeftText>
      <TopRightText>Beyond Words, Across Worlds</TopRightText>
      <BottomLeftText>{futureTime}</BottomLeftText>
      <BottomRightText>37.7749° N, 122.4194° W</BottomRightText>
      
      <ContentWrapper>
        <Title>
          Reimagining How We Communicate
          <br />
          Beyond Words
        </Title>
        
        <GlassButton
          onClick={onExplore}
          size="large"
        >
          Explore the Unknown
        </GlassButton>
      </ContentWrapper>
    </LandingContainer>
  );
};

export default LandingPage;
