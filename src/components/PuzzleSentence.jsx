import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Select, MenuItem, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';

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

const words = [
  'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst',
  'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival',
  'adventure', 'blessings', 'healthy', 'success', 'prosperity', 'joy', 'kindness', 'harmony',
  'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude', 'observation', 'exploration',
  'perception', 'creation', 'push', 'poetry', 'experience', 'wisdom', 'dream', 'leader',
  'teach', 'despair', 'unforgettable', 'fresh', 'resilient', 'smile', 'future', 'brilliant',
  'stillness', 'majestic'
];

const PuzzleBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 32,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  alignItems: 'flex-start',
  justifyContent: 'center',
}));
const LeftPanel = styled(Box)(({ theme }) => ({
  width: 220,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  marginTop: 24,
}));
const CenterPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 24,
}));
const RightPanel = styled(Paper)(({ theme }) => ({
  width: 420,
  minHeight: 420,
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
  marginBottom: 32,
}));
const Hole = styled(Paper)(({ theme }) => ({
  width: 150,
  height: 56,
  borderRadius: 16,
  background: '#f7f7f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  color: '#bbb',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  position: 'relative',
}));
const WordButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  background: '#fff',
  color: '#222',
  fontWeight: 500,
  fontSize: 16,
  margin: 4,
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  textTransform: 'none',
  minWidth: 80,
  minHeight: 40,
  '&:hover': {
    background: '#f7f7f9',
  },
}));

const langOrder = [
  'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
  'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
];

const PuzzleSentence = () => {
  const [language, setLanguage] = useState('en');
  const [holes, setHoles] = useState([null, null, null]);
  const [dragWord, setDragWord] = useState(null);
  const [data, setData] = useState([]);
  const graphRef = React.useRef();

  useEffect(() => {
    fetch('/reference/words_tokens_cleaned.csv')
      .then(res => res.text())
      .then(text => setData(parseCSV(text)));
  }, []);

  // 当前语言下的50个词（本地词+英文主词）
  const currentLang = languages.find(l => l.code === language);
  const wordOptions = data.filter(d => d.language.toLowerCase() === (currentLang?.nameEn || '').toLowerCase()).slice(0, 50);

  // 拖拽开始
  const handleDragStart = (main_word, local_word) => {
    setDragWord({ main_word, local_word });
  };
  // 拖拽到洞
  const handleDrop = (idx) => {
    if (dragWord) {
      const newHoles = [...holes];
      newHoles[idx] = dragWord;
      setHoles(newHoles);
      setDragWord(null);
    }
  };
  // 允许放置
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  // 移除洞内词语
  const handleRemove = (idx) => {
    const newHoles = [...holes];
    newHoles[idx] = null;
    setHoles(newHoles);
  };

  // 实时生成多层嵌套符号
  useEffect(() => {
    if (!graphRef.current) return;
    d3.select(graphRef.current).selectAll('*').remove();
    const filled = holes.filter(Boolean);
    if (filled.length === 0) return;
    // 1. 计算ratios_list和token_ids_list
    let ratiosList = [];
    let tokenIdsList = [];
    filled.forEach(wordObj => {
      const main_word = wordObj.main_word;
      const tokens = langOrder.map(lang => {
        const item = data.find(d => d.main_word.trim().toLowerCase() === main_word.trim().toLowerCase() && d.language.trim().toLowerCase() === lang.trim().toLowerCase());
        return item ? item.token_id : 0;
      });
      tokenIdsList.push(tokens);
      // 计算ratios
      const tokenIdsLog = tokens.map(tid => Math.log1p(tid));
      const minTid = Math.min(...tokenIdsLog);
      const maxTid = Math.max(...tokenIdsLog);
      let ratios = maxTid > minTid
        ? tokenIdsLog.map(tid => (tid - minTid) / (maxTid - minTid))
        : tokenIdsLog.map(() => 0.5);
      ratios = ratios.map(r => 0.05 + (0.95 - 0.05) * r);
      ratiosList.push(ratios);
    });
    // 2. 计算bits
    const s = tokenIdsList.map(arr => arr.join('_')).join('|');
    const h = CryptoJS.MD5(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    // 3. 绘制
    const width = 340, height = 340, margin = 36;
    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    const numSides = 17;
    const baseRadius = Math.min(width, height) / 2 - margin;
    const radiusStep = 38;
    // 多层多边形
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
    const dotR = 4;
    const yGap = 8;
    const xGap = 8;
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
      .attr('y', baseRadius + 30)
      .attr('fill', '#000')
      .attr('font-size', 15)
      .text(filled.map(w => w.local_word).join(' '));
  }, [holes, data]);

  return (
    <PuzzleBox>
      {/* 左侧语言选择 */}
      <LeftPanel>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>选择语言</Typography>
        <Select
          value={language}
          onChange={e => {
            setLanguage(e.target.value);
            setHoles([null, null, null]); // 切换语言时清空洞
          }}
          displayEmpty
          sx={{ width: '100%', fontSize: 16, borderRadius: 2 }}
        >
          {languages.map(lang => (
            <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
          ))}
        </Select>
      </LeftPanel>
      {/* 中间拼图区 */}
      <CenterPanel>
        <HoleRow>
          {holes.map((wordObj, idx) => (
            <Hole
              key={idx}
              onDrop={() => handleDrop(idx)}
              onDragOver={handleDragOver}
            >
              {wordObj ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 14, color: '#888', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 90 }}>{wordObj.local_word}</span>
                  <IconButton size="small" onClick={() => handleRemove(idx)} sx={{ ml: 0.5 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <span style={{ color: '#bbb' }}>{`空${idx + 1}`}</span>
              )}
            </Hole>
          ))}
        </HoleRow>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', maxWidth: 600, justifyContent: 'center' }}>
          {wordOptions.map(w => (
            <WordButton
              key={w.main_word + w.local_word}
              draggable
              onDragStart={() => handleDragStart(w.main_word, w.local_word)}
              disabled={holes.some(h => h && h.main_word === w.main_word)}
            >
              {w.local_word}
            </WordButton>
          ))}
        </Box>
      </CenterPanel>
      {/* 右侧可视化区 */}
      <RightPanel>
        <svg ref={graphRef}></svg>
      </RightPanel>
    </PuzzleBox>
  );
};

export default PuzzleSentence; 