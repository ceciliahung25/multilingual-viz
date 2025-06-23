import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';
import PageLayout from './PageLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { 
  ContentBox, 
  StyledPaper, 
  PrimaryButton,
  LeftPanel as BaseLeftPanel,
  RightPanel 
} from './CommonStyles';
import { styled } from '@mui/material/styles';

// 自定义左侧面板，基于通用的LeftPanel
const LeftPanel = styled(BaseLeftPanel)(({ theme }) => ({
  width: 520,
  gap: 16,
  paddingTop: 24,
  paddingBottom: 24,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: 520,
  },
}));

// 字母洞
const Hole = styled(StyledPaper)(({ theme }) => ({
  width: 80,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: '#bbb',
  padding: 0,
  marginBottom: 0,
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: 60,
    height: 48,
    fontSize: 16,
  },
}));

// 字母按钮
const LetterButton = styled(PrimaryButton)(({ theme }) => ({
  background: '#fff',
  color: '#222',
  margin: 6,
  minWidth: 48,
  minHeight: 40,
  cursor: 'grab',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  '&:hover': {
    background: '#f7f7f9',
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  '&.dragging': {
    transform: 'scale(1.18)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
    zIndex: 2,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: 16,
    minWidth: 40,
    minHeight: 36,
    margin: 4,
  },
}));

const upperLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const lowerLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));

const NameVisualizer = () => {
  const { language } = useLanguage();
  const [holes, setHoles] = useState([null, null, null, null]);
  const [dragging, setDragging] = useState(null);
  const [tokenMap, setTokenMap] = useState({});
  const graphRef = React.useRef();
  const containerRef = React.useRef();
  const [graphSize, setGraphSize] = useState({ width: 440, height: 440 });

  // 自适应调整图表大小
  useEffect(() => {
    const updateGraphSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const size = Math.min(containerWidth - 32, 440);
      setGraphSize({ width: size, height: size });
    };

    updateGraphSize();
    window.addEventListener('resize', updateGraphSize);
    return () => window.removeEventListener('resize', updateGraphSize);
  }, []);

  // 读取csv，建立字母-token映射
  useEffect(() => {
    fetch('/alphabet_token_map.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const map = {};
        for (let i = 1; i < lines.length; i++) {
          const [letter, token] = lines[i].split(',');
          map[letter] = parseInt(token);
        }
        setTokenMap(map);
      });
  }, []);

  // 可视化逻辑
  useEffect(() => {
    if (!graphRef.current) return;
    d3.select(graphRef.current).selectAll('*').remove();
    const filled = holes.filter(Boolean);
    if (filled.length === 0) return;
    // 1. 每个字母单独计算ratios，生成多圈
    let ratiosList = [];
    let tokenIdsList = [];
    filled.forEach(letter => {
      const tokenId = tokenMap[letter] || 0;
      tokenIdsList.push([tokenId]);
      // 计算ratios（单字母只用自身token id）
      const tokenIdsLog = [Math.log1p(tokenId)];
      const minTid = Math.min(...tokenIdsLog);
      const maxTid = Math.max(...tokenIdsLog);
      let ratios = maxTid > minTid
        ? tokenIdsLog.map(tid => (tid - minTid) / (maxTid - minTid))
        : tokenIdsLog.map(() => 0.5);
      // 17维扩展
      ratios = Array(17).fill(ratios[0]);
      ratios = ratios.map(r => 0.05 + (0.95 - 0.05) * r);
      ratiosList.push(ratios);
    });
    // 2. bits整体hash
    const s = tokenIdsList.map(arr => arr.join('_')).join('|');
    const h = CryptoJS.SHA256(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    // 3. 绘制多圈
    const { width, height } = graphSize;
    const margin = Math.floor(width * 0.11);
    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    const numSides = 17;
    const baseRadius = Math.min(width, height) / 2 - margin;
    const radiusStep = Math.min(38, baseRadius / filled.length / 1.2);
    ratiosList.forEach((ratios, i) => {
      const r = baseRadius - i * radiusStep;
      const angles = d3.range(numSides).map(j => j * (2 * Math.PI / numSides));
      const vertices = angles.map(angle => ({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle)
      }));
      // 17边形轮廓
      svg.append('path')
        .datum([...vertices, vertices[0]])
        .attr('d', d3.line().x(d => d.x).y(d => d.y))
        .attr('fill', 'rgba(200,200,200,0.12)')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
      // 内部多边形
      const points = vertices.map((vertex, j) => {
        const nextVertex = vertices[(j + 1) % numSides];
        const ratio = ratios[j];
        return {
          x: vertex.x * (1 - ratio) + nextVertex.x * ratio,
          y: vertex.y * (1 - ratio) + nextVertex.y * ratio
        };
      });
      svg.append('path')
        .datum([...points, points[0]])
        .attr('d', d3.line().x(d => d.x).y(d => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
      // 外圈点
      svg.selectAll(`.node-${i}`)
        .data(points)
        .enter()
        .append('circle')
        .attr('class', `node-${i}`)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', width < 350 ? 5 : 7)
        .attr('fill', '#000');
    });
    // 内部矩阵
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = width < 350 ? 6 : 8;
    const yGap = width < 350 ? 12 : 16;
    const xGap = width < 350 ? 12 : 16;
    let bitIdx = 0;
    const totalRows = rowCounts.length;
    let firstDotPos = null;
    rowCounts.forEach((count, row) => {
      const y = (row - (totalRows - 1) / 2) * yGap;
      const xStart = -((count - 1) / 2) * xGap;
      for (let i = 0; i < count; i++) {
        const x = xStart + i * xGap;
        const color = bits[bitIdx] ? '#000' : '#ccc';
        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', dotR)
          .attr('fill', color);
        if (row === 0 && i === 0) {
          firstDotPos = { x, y };
        }
        bitIdx++;
      }
    });
    // 红色三角形
    if (firstDotPos) {
      const triangleBase = dotR * 1.5;
      const triangleHeight = triangleBase * 1.1;
      const triX = firstDotPos.x - dotR * 1.6;
      const triY = firstDotPos.y;
      svg.append('path')
        .attr('d', `M ${triX} ${triY} L ${triX - triangleBase} ${triY + triangleHeight/2} L ${triX - triangleBase} ${triY - triangleHeight/2} Z`)
        .attr('fill', 'red');
    }
    // 名字标签
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', baseRadius + (width < 350 ? 20 : 30))
      .attr('fill', '#000')
      .attr('font-size', width < 350 ? 14 : 16)
      .text(filled.join(''));
  }, [holes, tokenMap, graphSize]);

  // 拖拽开始
  const handleDragStart = (e, letter) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', letter);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDragging(null);
  };

  // 拖拽到洞
  const handleDrop = (e, idx) => {
    e.preventDefault();
    const letter = e.dataTransfer.getData('text/plain');
    if (letter) {
      const newHoles = [...holes];
      newHoles[idx] = letter;
      setHoles(newHoles);
    }
  };

  // 允许放置
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 移除洞内字母
  const handleRemove = (idx) => {
    const newHoles = [...holes];
    newHoles[idx] = null;
    setHoles(newHoles);
  };

  // 判断字母是否已被使用 - 移除使用限制
  const isUsed = (l) => false; // 始终返回false，表示字母可以重复使用

  const handleLetterClick = (letter) => {
    // 找到第一个空的槽位
    const emptyIndex = holes.findIndex(hole => hole === null);
    if (emptyIndex !== -1) {
      const newHoles = [...holes];
      newHoles[emptyIndex] = letter;
      setHoles(newHoles);
    }
  };

  return (
    <PageLayout
      title={t('nameVisualizer.title', language)}
      subtitle={t('nameVisualizer.subtitle', language)}
    >
      <ContentBox>
        <LeftPanel>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {t('nameVisualizer.enterName', language)}
          </Typography>
          
          {/* 字母洞 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {holes.map((letter, idx) => (
              <Hole 
                key={idx}
                onDrop={(e) => handleDrop(e, idx)}
                onDragOver={handleDragOver}
              >
                {letter ? (
                  <Box sx={{ position: 'relative' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {letter}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(idx)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        backgroundColor: '#f0f0f0',
                        '&:hover': { backgroundColor: '#e0e0e0' }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Typography variant="h6" sx={{ color: '#ccc' }}>
                    {t('nameVisualizer.emptySlot', language)}
                  </Typography>
                )}
              </Hole>
            ))}
          </Box>

          {/* 字母按钮 - 恢复大小写字母 */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {t('nameVisualizer.uppercaseLetters', language)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '8px' }}>
              {upperLetters.map(letter => (
                <LetterButton
                  key={letter}
                  disabled={isUsed(letter)}
                  draggable={!isUsed(letter)}
                  onDragStart={(e) => handleDragStart(e, letter)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isUsed(letter) && handleLetterClick(letter)}
                  className={clsx(dragging === letter && 'dragging')}
                  sx={{
                    opacity: isUsed(letter) ? 0.3 : 1,
                    cursor: isUsed(letter) ? 'not-allowed' : 'pointer',
                    margin: 0 // 覆盖默认margin
                  }}
                >
                  {letter}
                </LetterButton>
              ))}
            </Box>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
              {t('nameVisualizer.lowercaseLetters', language)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '8px' }}>
              {lowerLetters.map(letter => (
                <LetterButton
                  key={letter}
                  disabled={isUsed(letter)}
                  draggable={!isUsed(letter)}
                  onDragStart={(e) => handleDragStart(e, letter)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isUsed(letter) && handleLetterClick(letter)}
                  className={clsx(dragging === letter && 'dragging')}
                  sx={{
                    opacity: isUsed(letter) ? 0.3 : 1,
                    cursor: isUsed(letter) ? 'not-allowed' : 'pointer',
                    margin: 0 // 覆盖默认margin
                  }}
                >
                  {letter}
                </LetterButton>
              ))}
            </Box>
          </Box>
        </LeftPanel>

        <RightPanel>
          <Box
            ref={containerRef}
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg
              ref={graphRef}
              style={{
                width: graphSize.width,
                height: graphSize.height,
                cursor: 'grab'
              }}
            />
          </Box>
        </RightPanel>
      </ContentBox>
    </PageLayout>
  );
};

export default NameVisualizer; 