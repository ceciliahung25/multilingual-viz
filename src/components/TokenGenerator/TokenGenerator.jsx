import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, Button, Select, MenuItem } from '@mui/material';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';
import { styled } from '@mui/material/styles';

// 语言映射
const languages = [
  { code: 'ar', name: '阿拉伯语', nameEn: 'Arabic' },
  { code: 'de', name: '德语', nameEn: 'German' },
  { code: 'en', name: '英语', nameEn: 'English' },
  { code: 'es', name: '西班牙语', nameEn: 'Spanish' },
  { code: 'fr', name: '法语', nameEn: 'French' },
  { code: 'hi', name: '印地语', nameEn: 'Hindi' },
  { code: 'id', name: '印度尼西亚语', nameEn: 'Indonesian' },
  { code: 'it', name: '意大利语', nameEn: 'Italian' },
  { code: 'ja', name: '日语', nameEn: 'Japanese' },
  { code: 'nl', name: '荷兰语', nameEn: 'Dutch' },
  { code: 'pt', name: '葡萄牙语', nameEn: 'Portuguese' },
  { code: 'ru', name: '俄语', nameEn: 'Russian' },
  { code: 'th', name: '泰语', nameEn: 'Thai' },
  { code: 'tr', name: '土耳其语', nameEn: 'Turkish' },
  { code: 'vi', name: '越南语', nameEn: 'Vietnamese' },
  { code: 'zh', name: '中文', nameEn: 'Chinese' },
  { code: 'ko', name: '朝鲜语', nameEn: 'Korean' }
];

// 解析csv为映射对象
function parseCSV(csv) {
  const lines = csv.split('\n');
  const header = lines[0].split(',');
  const idx = {
    main_word: header.indexOf('main_word'),
    language: header.indexOf('language'),
    local_word: header.indexOf('local_word'),
    token_id: header.indexOf('token_id')
  };
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < 4) continue;
    const main_word = row[idx.main_word] ? row[idx.main_word].trim() : '';
    const language = row[idx.language] ? row[idx.language].trim() : '';
    const local_word = row[idx.local_word] ? row[idx.local_word].trim() : '';
    const token_id = row[idx.token_id] ? parseInt(row[idx.token_id].trim()) : 0;
    if (!main_word || !language || !local_word) continue;
    data.push({ main_word, language, local_word, token_id });
  }
  return data;
}

// 计算 ratios 和 bits
function safeTokenEval(tokenStr) {
  if (tokenStr.includes('[')) {
    tokenStr = tokenStr.slice(tokenStr.indexOf('['));
  }
  try {
    const val = JSON.parse(tokenStr.replace(/'/g, '"'));
    return Array.isArray(val) ? val[0] : parseInt(val);
  } catch {
    return 0;
  }
}
function stretchRatio(r, low = 0.05, high = 0.95) {
  return low + (high - low) * r;
}
function tokensToBits(tokenIds) {
  const s = tokenIds.join('_');
  // 简单md5实现（只用于演示，实际可用第三方库）
  function md5(str) {
    // 浏览器原生crypto
    return Array.from(new Uint8Array(
      window.crypto.subtle.digestSync('MD5', new TextEncoder().encode(str))
    )).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // 兼容性处理：如果没有crypto.subtle.digestSync，则用简单hash
  let h = '';
  if (window.crypto && window.crypto.subtle && window.crypto.subtle.digestSync) {
    h = md5(s);
  } else {
    // fallback: 简单hash
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i);
    h = Math.abs(hash).toString(16).padStart(32, '0');
  }
  return h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
}

// 极简黑白风格自定义样式
const MinimalPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  color: '#111',
  marginBottom: 32,
  flex: 1,
  minHeight: 0,
  padding: 20,
}));
const MinimalButton = styled(Button)(({ theme }) => ({
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
const MinimalSelect = styled(Select)(({ theme }) => ({
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
const MinimalMenuItem = styled(MenuItem)(({ theme }) => ({
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

const MinimalBox = styled(Box)(({ theme }) => ({
  background: 'transparent',
  minHeight: '100vh',
  padding: '40px 20px',
  fontFamily: '"Inter", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  width: '100%',
  boxSizing: 'border-box',
  gap: '20px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 12px',
  },
}));

const TokenGenerator = () => {
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [word, setWord] = useState('');
  const [data, setData] = useState([]);
  const [graphSize, setGraphSize] = useState({ width: 500, height: 500 });
  const graphRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const updateGraphSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const newSize = containerWidth < 500 ? containerWidth - 40 : 500;
      setGraphSize({ width: newSize, height: newSize });
    };

    updateGraphSize();
    window.addEventListener('resize', updateGraphSize);
    return () => window.removeEventListener('resize', updateGraphSize);
  }, []);

  useEffect(() => {
    fetch('/reference/words_tokens_cleaned.csv')
      .then(res => res.text())
      .then(text => {
        setData(parseCSV(text));
      });
  }, []);

  // 选择语言后，显示该语言下的词语
  const wordOptions = sourceLanguage
    ? data.filter(d => d.language && d.language.trim().toLowerCase() === sourceLanguage.trim().toLowerCase())
    : [];

  const handleGenerate = () => {
    if (!graphRef.current) return;
    d3.select(graphRef.current).selectAll('*').remove();
    // 解析英文主词和本地词语
    const [englishWord, localWord] = word.split('|');
    // 1. 获取所有语言的token id
    const langOrder = [
      'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
      'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
    ];
    const allLangTokens = langOrder.map(lang => {
      const item = data.find(d =>
        d.main_word && d.main_word.trim().toLowerCase() === englishWord.trim().toLowerCase() &&
        d.language && d.language.trim().toLowerCase() === lang.trim().toLowerCase()
      );
      if (!item) {
        console.warn('未找到token:', {
          lang,
          englishWord,
          candidates: data.filter(d => d.main_word.trim().toLowerCase() === englishWord.trim().toLowerCase()).map(d => d.language + ':' + d.token_id),
          allLangs: data.filter(d => d.language.trim().toLowerCase() === lang.trim().toLowerCase()).map(d => d.main_word + ':' + d.token_id)
        });
      }
      return item ? item.token_id : 0;
    });
    // 2. ratios计算
    const tokenIdsLog = allLangTokens.map(tid => Math.log1p(tid));
    const minTid = Math.min(...tokenIdsLog);
    const maxTid = Math.max(...tokenIdsLog);
    let ratios = maxTid > minTid
      ? tokenIdsLog.map(tid => (tid - minTid) / (maxTid - minTid))
      : tokenIdsLog.map(() => 0.5);
    ratios = ratios.map(r => 0.05 + (0.95 - 0.05) * r);
    // 3. bits计算
    const s = allLangTokens.join('_');
    const h = CryptoJS.SHA256(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    // 4. 绘制
    const { width, height } = graphSize;
    const margin = Math.floor(width * 0.12);
    const radius = Math.min(width, height) / 2 - margin;
    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    // 17边形顶点
    const numSides = 17;
    const angles = d3.range(numSides).map(i => i * (2 * Math.PI / numSides));
    const vertices = angles.map(angle => ({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    }));
    // 多边形点
    const points = vertices.map((vertex, i) => {
      const nextVertex = vertices[(i + 1) % numSides];
      const ratio = ratios[i];
      return {
        x: vertex.x * (1 - ratio) + nextVertex.x * ratio,
        y: vertex.y * (1 - ratio) + nextVertex.y * ratio,
        lang: langOrder[i],
        token: allLangTokens[i]
      };
    });
    // 绘制17边形轮廓
    const polygonLine = d3.line().x(d => d.x).y(d => d.y);
    svg.append('path')
      .datum([...vertices, vertices[0]])
      .attr('d', polygonLine)
      .attr('fill', 'rgba(200, 200, 200, 0.12)')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);
    // 绘制内部多边形
    svg.append('path')
      .datum([...points, points[0]])
      .attr('d', polygonLine)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);
    // 外圈点+tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('z-index', 10)
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('font-size', '14px')
      .style('color', '#000');
    svg.selectAll('.node')
      .data(points)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', width < 400 ? 5 : 7)
      .attr('fill', '#000')
      .on('mouseover', function(e, d) {
        tooltip.style('visibility', 'visible')
          .text(`${d.lang}: ${d.token}`);
      })
      .on('mousemove', function(e) {
        tooltip.style('top', (e.pageY - 30) + 'px')
          .style('left', (e.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });
    // 内部矩阵
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = width < 400 ? 9 : 13;
    const yGap = dotR * 2.2;
    const xGap = dotR * 2.2;
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
    // 词语标签
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', radius + 45)
      .attr('fill', '#000')
      .attr('font-size', width < 400 ? 13 : 15)
      .text(localWord);
  };

  return (
    <MinimalBox ref={containerRef}>
      {/* 左侧表单区 */}
      <MinimalPaper sx={{ 
        width: { xs: '100%', md: 280 }, 
        minWidth: { xs: 'auto', md: 180 }, 
        mr: { xs: 0, md: 2 }, 
        mb: { xs: 2, md: 0 },
        boxSizing: 'border-box', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        p: 2 
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: 20, md: 22 }, mb: 2 }}>
          查找词语
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <MinimalSelect
            value={sourceLanguage}
            onChange={(e) => {
              setSourceLanguage(e.target.value);
              setWord('');
            }}
            displayEmpty
            sx={{ width: '100%', fontSize: { xs: 14, md: 15 }, height: { xs: 38, md: 40 } }}
          >
            <MinimalMenuItem value="">选择源语言</MinimalMenuItem>
            {languages.map(lang => (
              <MinimalMenuItem key={lang.code} value={lang.nameEn}>{lang.name}</MinimalMenuItem>
            ))}
          </MinimalSelect>
          <MinimalSelect
            value={word}
            onChange={(e) => setWord(e.target.value)}
            displayEmpty
            sx={{ width: '100%', fontSize: { xs: 14, md: 15 }, height: { xs: 38, md: 40 } }}
            disabled={!sourceLanguage}
          >
            <MinimalMenuItem value="">选择词语</MinimalMenuItem>
            {wordOptions.map((w, idx) => (
              <MinimalMenuItem key={w.local_word + idx} value={w.main_word + '|' + w.local_word}>{w.local_word}</MinimalMenuItem>
            ))}
          </MinimalSelect>
          <MinimalButton
            variant="contained" 
            onClick={handleGenerate}
            disabled={!word || !sourceLanguage}
            sx={{ height: { xs: 38, md: 40 }, fontSize: { xs: 14, md: 15 }, minWidth: { xs: 90, md: 100 } }}
          >
            生成可视化
          </MinimalButton>
        </Box>
        <Typography variant="body2" sx={{ color: '#bbb', fontSize: { xs: 12, md: 13 } }}>
          请选择语言和词语，词语列表会根据语言自动变化。
        </Typography>
      </MinimalPaper>
      {/* 右侧可视化区 */}
      <MinimalPaper sx={{ 
        flex: 1, 
        minWidth: 0, 
        maxWidth: { xs: '100%', md: 'none' },
        boxSizing: 'border-box', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: { xs: 1, md: 2 }, 
        mb: 0 
      }}>
        <svg ref={graphRef}></svg>
      </MinimalPaper>
    </MinimalBox>
  );
};

export default TokenGenerator; 