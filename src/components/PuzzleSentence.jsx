import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';
import PageLayout from './PageLayout';
import { 
  ContentBox, 
  StyledPaper, 
  PrimaryButton, 
  StyledSelect, 
  StyledMenuItem, 
  LeftPanel, 
  RightPanel, 
  InteractionBox
} from './CommonStyles';

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

const Hole = styled(StyledPaper)(({ theme }) => ({
  width: 150,
  height: 56,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  color: '#bbb',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  position: 'relative',
  padding: 0,
  marginBottom: 0,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    minWidth: 100,
    maxWidth: 140,
    height: 48,
    fontSize: 13,
  },
}));

const WordButton = styled(PrimaryButton)(({ theme }) => ({
  background: '#fff',
  color: '#222',
  fontWeight: 500,
  fontSize: 16,
  margin: 4,
  minWidth: 80,
  minHeight: 40,
  [theme.breakpoints.down('sm')]: {
    fontSize: 14,
    margin: 3,
    minWidth: 70,
    minHeight: 36,
    padding: '4px 10px',
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
  const containerRef = React.useRef();
  const [graphSize, setGraphSize] = useState({ width: 420, height: 420 });

  useEffect(() => {
    const updateGraphSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const size = Math.min(containerWidth - 32, 420);
      setGraphSize({ width: size, height: size });
    };

    updateGraphSize();
    window.addEventListener('resize', updateGraphSize);
    return () => window.removeEventListener('resize', updateGraphSize);
  }, []);

  useEffect(() => {
    fetch('/reference/words_tokens_cleaned.csv')
      .then(res => res.text())
      .then(text => setData(parseCSV(text)));
  }, []);

  const currentLang = languages.find(l => l.code === language);
  const wordOptions = data.filter(d => d.language.toLowerCase() === (currentLang?.nameEn || '').toLowerCase()).slice(0, 50);

  const handleDragStart = (main_word, local_word) => {
    setDragWord({ main_word, local_word });
  };

  const handleDrop = (idx) => {
    if (dragWord) {
      const newHoles = [...holes];
      newHoles[idx] = dragWord;
      setHoles(newHoles);
      setDragWord(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemove = (idx) => {
    const newHoles = [...holes];
    newHoles[idx] = null;
    setHoles(newHoles);
  };

  useEffect(() => {
    if (!graphRef.current) return;
    d3.select(graphRef.current).selectAll('*').remove();
    const filled = holes.filter(Boolean);
    if (filled.length === 0) return;
    let ratiosList = [];
    let tokenIdsList = [];
    filled.forEach(wordObj => {
      const main_word = wordObj.main_word;
      const tokens = langOrder.map(lang => {
        const item = data.find(d => d.main_word.trim().toLowerCase() === main_word.trim().toLowerCase() && d.language.trim().toLowerCase() === lang.trim().toLowerCase());
        return item ? item.token_id : 0;
      });
      tokenIdsList.push(tokens);
      const tokenIdsLog = tokens.map(tid => Math.log1p(tid));
      const minTid = Math.min(...tokenIdsLog);
      const maxTid = Math.max(...tokenIdsLog);
      let ratios = maxTid > minTid
        ? tokenIdsLog.map(tid => (tid - minTid) / (maxTid - minTid))
        : tokenIdsLog.map(() => 0.5);
      ratios = ratios.map(r => 0.05 + (0.95 - 0.05) * r);
      ratiosList.push(ratios);
    });
    const s = tokenIdsList.map(arr => arr.join('_')).join('|');
    const h = CryptoJS.SHA256(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    const { width, height } = graphSize;
    const margin = Math.floor(width * 0.09);
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
      svg.append('path')
        .datum([...vertices, vertices[0]])
        .attr('d', d3.line().x(d => d.x).y(d => d.y))
        .attr('fill', 'rgba(200,200,200,0.12)')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
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
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = width < 350 ? 3 : 5;
    const yGap = width < 350 ? 6 : 10;
    const xGap = width < 350 ? 6 : 10;
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
    if (firstDotPos) {
      const triangleBase = dotR * 1.5;
      const triangleHeight = triangleBase * 1.1;
      const triX = firstDotPos.x - dotR * 1.6;
      const triY = firstDotPos.y;
      svg.append('path')
        .attr('d', `M ${triX} ${triY} L ${triX - triangleBase} ${triY + triangleHeight/2} L ${triX - triangleBase} ${triY - triangleHeight/2} Z`)
        .attr('fill', 'red');
    }
    const sentence = filled.map(wordObj => wordObj.local_word).join(' ');
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', baseRadius + (width < 350 ? 20 : 30))
      .attr('fill', '#000')
      .attr('font-size', width < 350 ? 13 : 15)
      .text(sentence);
  }, [holes, data, graphSize]);

  const isUsed = (wordObj) => {
    return holes.some(h => h && h.main_word === wordObj.main_word);
  };

  return (
    <PageLayout
      title="词语拼图"
      subtitle="从不同语言中选择词语，组成一个多语言拼图，生成符号可视化"
    >
      <ContentBox>
        <LeftPanel>
          <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
            选择语言
          </Typography>
          <StyledSelect
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          >
            {languages.map(lang => (
              <StyledMenuItem key={lang.code} value={lang.code}>{lang.name}</StyledMenuItem>
            ))}
          </StyledSelect>

          <InteractionBox>
            <Typography variant="subtitle1" fontWeight={500}>
              拖拽词语到槽位中
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'flex-start',
              gap: 0.5,
              p: 1.5,
              backgroundColor: '#f7f7f9',
              borderRadius: 2
            }}>
              {words.slice(0, 12).map(word => {
                const lang = languages.find(l => l.code === language) || languages[2]; // 默认英语
                const wordObj = { main: word, lang: lang.nameEn };
                return (
                  <WordButton
                    key={word}
                    variant="text"
                    disabled={isUsed(wordObj)}
                    draggable={!isUsed(wordObj)}
                    onDragStart={() => handleDragStart(word, word)}
                    sx={{ opacity: isUsed(wordObj) ? 0.5 : 1 }}
                  >
                    {word}
                  </WordButton>
                );
              })}
            </Box>
          </InteractionBox>
        </LeftPanel>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: 2, 
            mb: 3,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: 'center'
          }}>
            {holes.map((item, idx) => (
              <Hole
                key={idx}
                onDrop={() => handleDrop(idx)}
                onDragOver={handleDragOver}
              >
                {item ? (
                  <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>{item.local}</span>
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(idx)}
                      sx={{ position: 'absolute', top: -8, right: -8, background: '#f0f0f0', width: 18, height: 18 }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <span style={{ color: '#bbb' }}>词语 {idx + 1}</span>
                )}
              </Hole>
            ))}
          </Box>

          <RightPanel ref={containerRef}>
            <svg ref={graphRef} width={graphSize.width} height={graphSize.height}></svg>
          </RightPanel>
        </Box>
      </ContentBox>
    </PageLayout>
  );
};

export default PuzzleSentence; 