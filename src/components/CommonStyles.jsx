import { styled } from '@mui/material/styles';
import { Box, Paper, Button, Select, MenuItem, Typography } from '@mui/material';

// 通用样式组件，基于"查找词语"页面的设计风格
// 极简黑白风格自定义样式

// 内容容器
export const ContentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
  gap: '40px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

// 卡片容器
export const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  color: '#111',
  marginBottom: 32,
  flex: 1,
  minHeight: 0,
  padding: 20,
}));

// 主按钮
export const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 18,
  background: '#111',
  color: '#fff',
  fontWeight: 600,
  fontSize: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
  textTransform: 'none',
  '&:hover': {
    background: '#222',
  },
  minWidth: 140,
  minHeight: 48,
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
    minWidth: 100,
  },
}));

// 次要按钮
export const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 18,
  background: '#fff',
  color: '#111',
  fontWeight: 500,
  fontSize: 18,
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  textTransform: 'none',
  '&:hover': {
    background: '#f7f7f9',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
  },
}));

// 下拉选择框
export const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 16,
  background: '#fff',
  color: '#111',
  fontSize: 18,
  fontWeight: 500,
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  '.MuiSelect-select': {
    padding: '14px 20px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
    '.MuiSelect-select': {
      padding: '10px 16px',
    },
  },
}));

// 下拉菜单项
export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: 18,
  borderRadius: 12,
  '&.Mui-selected': {
    background: '#111',
    color: '#fff',
  },
  '&:hover': {
    background: '#eee',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
  },
}));

// 卡片标题
export const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 16,
  [theme.breakpoints.down('sm')]: {
    fontSize: 18,
  },
}));

// 左侧面板
export const LeftPanel = styled(Box)(({ theme }) => ({
  width: 280,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: 480,
  },
}));

// 右侧面板
export const RightPanel = styled(StyledPaper)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

// 可视化容器
export const VisualizationContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// 交互元素盒子
export const InteractionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  width: '100%',
}));

// 带圆角的卡片项
export const CardItem = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  padding: '12px 16px',
  backgroundColor: '#fff',
  marginBottom: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.25s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#fff',
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
  },
})); 