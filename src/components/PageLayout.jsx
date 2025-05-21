import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

// 页面容器
const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
}));

// 页面标题区域
const PageHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

// 页面内容区域
const PageContent = styled(Box)(({ theme }) => ({
  width: '100%',
}));

/**
 * 统一的页面布局组件
 * @param {Object} props - 组件属性
 * @param {string} props.title - 页面标题
 * @param {string} props.subtitle - 页面副标题
 * @param {React.ReactNode} props.children - 页面内容
 */
const PageLayout = ({ title, subtitle, children }) => {
  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </PageHeader>
      
      <PageContent>
        {children}
      </PageContent>
    </PageContainer>
  );
};

export default PageLayout; 