import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 40,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  alignItems: 'flex-start',
  justifyContent: 'center',
}));
const LeftPanel = styled(Box)(({ theme }) => ({
  width: 520,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  paddingTop: 24,
  paddingBottom: 24,
  alignItems: 'flex-start',
}));
const RightPanel = styled(Paper)(({ theme }) => ({
  width: 480,
  minWidth: 480,
  minHeight: 480,
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  marginTop: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
const HoleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 36,
  marginBottom: 2,
  marginTop: 0,
  justifyContent: 'center',
}));
const Hole = styled(Paper)(({ theme }) => ({
  width: 80,
  height: 56,
  borderRadius: 16,
  background: '#f7f7f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: '#bbb',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  position: 'relative',
}));
const LetterButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  background: '#fff',
  color: '#222',
  fontWeight: 600,
  fontSize: 18,
  margin: 6,
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  textTransform: 'none',
  minWidth: 48,
  minHeight: 40,
  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
  '&:hover': {
    background: '#f7f7f9',
  },
  '&.dragging': {
    transform: 'scale(1.18)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
    zIndex: 2,
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
    const h = CryptoJS.MD5(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    // 3. 绘制多圈
    const width = 440, height = 440, margin = 48;
    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    const numSides = 17;
    const baseRadius = Math.min(width, height) / 2 - margin;
    const radiusStep = 38;
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
        .attr('r', 7)
        .attr('fill', '#000');
    });
    // 内部矩阵
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = 8;
    const yGap = 16;
    const xGap = 16;
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
    // 洞内字母标签
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', baseRadius + 38)
      .attr('fill', '#000')
      .attr('font-size', 18)
      .text(filled.join(' '));
  }, [holes, tokenMap]);

  // 拖拽到洞位
  const handleDrop = (idx) => {
    if (dragLetter) {
      const newHoles = [...holes];
      newHoles[idx] = dragLetter;
      setHoles(newHoles);
      setDragLetter(null);
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

  return (
    <MainBox>
      {/* 左侧：洞+字母区 */}
      <LeftPanel>
        <HoleRow sx={{ width: 480 }}>
          {holes.map((letter, idx) => (
            <Hole key={idx} onDrop={() => handleDrop(idx)} onDragOver={handleDragOver}>
              {letter ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 18, color: '#888', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span>{letter}</span>
                  <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleRemove(idx)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <span style={{ color: '#bbb' }}>{`空${idx + 1}`}</span>
              )}
            </Hole>
          ))}
        </HoleRow>
        <Box sx={{ width: 480, textAlign: 'center', color: '#bbb', fontSize: 13, mb: 0.5, mt: 0, lineHeight: 1.5 }}>
          拖拽字母到上方的空位，组合你的名字
        </Box>
        <Box sx={{ width: 480, mt: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, mt: 1 }}>大写字母</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', maxWidth: 480 }}>
            {upperLetters.map(l => (
              <LetterButton
                key={l}
                draggable
                onDragStart={() => { setDragLetter(l); setDragging(l); }}
                onDragEnd={() => setDragging(null)}
                className={clsx({ dragging: dragging === l })}
              >
                {l}
              </LetterButton>
            ))}
          </Box>
        </Box>
        <Box sx={{ width: 480, mt: 1, mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, mt: 1 }}>小写字母</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', maxWidth: 480 }}>
            {lowerLetters.map(l => (
              <LetterButton
                key={l}
                draggable
                onDragStart={() => { setDragLetter(l); setDragging(l); }}
                onDragEnd={() => setDragging(null)}
                className={clsx({ dragging: dragging === l })}
              >
                {l}
              </LetterButton>
            ))}
          </Box>
        </Box>
      </LeftPanel>
      {/* 右侧：可视化区 */}
      <RightPanel>
        <svg ref={graphRef} style={{ width: 440, height: 440 }}></svg>
      </RightPanel>
    </MainBox>
  );
};

export default NameVisualizer; 