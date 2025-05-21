import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';
import PageLayout from './PageLayout';
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
  const [holes, setHoles] = useState([null, null, null, null]);
  const [dragLetter, setDragLetter] = useState(null);
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

  // 拖拽到洞
  const handleDrop = (idx) => {
    if (dragLetter) {
      const newHoles = [...holes];
      newHoles[idx] = dragLetter;
      setHoles(newHoles);
      setDragLetter(null);
      setDragging(null);
    }
  };
  // 允许放置
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  // 移除洞内字母
  const handleRemove = (idx) => {
    const newHoles = [...holes];
    newHoles[idx] = null;
    setHoles(newHoles);
  };

  // 判断字母是否已被使用
  const isUsed = (l) => holes.includes(l);

  return (
    <PageLayout
      title="身份可视化"
      subtitle="通过组合字母创建一个独特的视觉符号，代表你的名字或身份"
    >
      <ContentBox>
        <LeftPanel>
          <Typography variant="h6" fontWeight={600}>
            组合字母
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: { xs: 1.5, md: 3 }, 
            mb: 2,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            justifyContent: 'center' 
          }}>
            {holes.map((letter, idx) => (
              <Hole
                key={idx}
                onDrop={() => handleDrop(idx)}
                onDragOver={handleDragOver}
              >
                {letter ? (
                  <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 500 }}>{letter}</span>
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(idx)}
                      sx={{ position: 'absolute', top: -8, right: -8, background: '#f0f0f0', width: 18, height: 18 }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <span style={{ color: '#bbb' }}>空</span>
                )}
              </Hole>
            ))}
          </Box>

          <Typography variant="h6" fontWeight={600} sx={{ mt: 3 }}>
            大写字母
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start', 
            mb: 2,
            background: '#f7f7f9',
            p: 1.5,
            borderRadius: 2
          }}>
            {upperLetters.map(letter => (
              <LetterButton
                key={letter}
                variant="text"
                disabled={isUsed(letter)}
                className={clsx(dragging === letter && 'dragging')}
                draggable={!isUsed(letter)}
                onDragStart={() => {
                  setDragLetter(letter);
                  setDragging(letter);
                }}
                onDragEnd={() => setDragging(null)}
              >
                {letter}
              </LetterButton>
            ))}
          </Box>

          <Typography variant="h6" fontWeight={600}>
            小写字母
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start',
            background: '#f7f7f9',
            p: 1.5,
            borderRadius: 2
          }}>
            {lowerLetters.map(letter => (
              <LetterButton
                key={letter}
                variant="text"
                disabled={isUsed(letter)}
                className={clsx(dragging === letter && 'dragging')}
                draggable={!isUsed(letter)}
                onDragStart={() => {
                  setDragLetter(letter);
                  setDragging(letter);
                }}
                onDragEnd={() => setDragging(null)}
              >
                {letter}
              </LetterButton>
            ))}
          </Box>
        </LeftPanel>

        <RightPanel ref={containerRef} sx={{ 
          ml: 4,  // 增加左边距，增加与左侧内容的距离 
          mt: 5,  // 增加顶部边距，使画布下移
          height: 'calc(100% - 40px)'  // 适当调整高度以保持整体平衡
        }}>
          <svg ref={graphRef} width={graphSize.width} height={graphSize.height}></svg>
        </RightPanel>
      </ContentBox>
    </PageLayout>
  );
};

export default NameVisualizer; 