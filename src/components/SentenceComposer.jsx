import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 64,
  width: '100%',
  minHeight: 'calc(100vh - 48px)',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
}));
const LeftPanel = styled(Box)(({ theme }) => ({
  width: 600,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  marginTop: 24,
  alignItems: 'flex-start',
  paddingLeft: 30,
  paddingRight: 8,
  boxSizing: 'border-box',
}));
const WordList = styled(Box)(({ theme }) => ({
  background: '#f7f7f9',
  borderRadius: 14,
  padding: '8px 6px',
  minHeight: 90,
  marginBottom: 8,
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
}));
const CenterPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: 24,
  gap: 18,
}));
const HoleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 16,
  marginBottom: 12,
  justifyContent: 'flex-start',
  width: '100%',
}));
const Hole = styled(Paper)(({ theme }) => ({
  minWidth: 120,
  maxWidth: 180,
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
  padding: '0 18px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));
const RightPanel = styled(Paper)(({ theme }) => ({
  width: 420,
  minWidth: 420,
  minHeight: 420,
  borderRadius: 18,
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
  background: '#fff',
  marginTop: 24,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: 16,
}));
const WordButton = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  margin: '4px',
  padding: '8px 14px',
  borderRadius: 8,
  background: '#fff',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  fontSize: 16,
  minHeight: 32,
  height: 'auto',
  cursor: 'grab',
  transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
  userSelect: 'none',
  '&:hover': {
    background: '#f7f7f9',
  },
  '&.dragging': {
    transform: 'scale(1.18)',
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.18)',
    zIndex: 2,
  },
}));

const languageOptions = [
  { code: 'en', label: '英语',
    subjects: ['I', 'we', 'you', 'they', 'astronaut', 'robot', 'earthling', 'commander'],
    verbs: ['observe', 'build', 'repair', 'communicate', 'float', 'dream', 'share', 'explore'],
    objects: ['earth', 'station', 'experiment', 'food', 'data', 'star', 'story', 'future']
  },
  { code: 'zh', label: '中文',
    subjects: ['我', '我们', '你', '你们', '宇航员', '机器人', '地球人', '指挥官'],
    verbs: ['观察', '建造', '修理', '交流', '漂浮', '梦想', '分享', '探索'],
    objects: ['地球', '空间站', '实验', '食物', '数据', '星星', '故事', '未来']
  }
];
const roleNames = ['主语', '谓语', '宾语'];

const SentenceComposer = () => {
  // 当前语言
  const [language, setLanguage] = useState('en');
  // 洞的内容：主语、谓语、宾语
  const [holes, setHoles] = useState([null, null, null]);
  // 当前拖拽的词语
  const [dragWord, setDragWord] = useState(null);
  // 动画高亮
  const [dragging, setDragging] = useState(null);
  // one-hot数据
  const [oneHotData, setOneHotData] = useState([]);
  // token id数据
  const [tokenIdData, setTokenIdData] = useState([]);
  const [langOrder, setLangOrder] = useState([
    'Arabic', 'German', 'English', 'Spanish', 'French', 'Hindi', 'Indonesian', 'Italian',
    'Japanese', 'Dutch', 'Portuguese', 'Russian', 'Thai', 'Turkish', 'Vietnamese', 'Chinese', 'Korean'
  ]); // 默认值，后续会被覆盖
  const graphRef = useRef();

  // 加载one-hot和token id表
  useEffect(() => {
    fetch('/reference/Final_Multilingual_OneHot_Table.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const header = lines[0].split(',');
        const idx = {
          main_word: header.indexOf('main_word'),
          language: header.indexOf('language'),
          local_word: header.indexOf('local_word'),
        };
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row.length < 3) continue;
          data.push({
            main_word: row[idx.main_word],
            language: row[idx.language],
            local_word: row[idx.local_word],
          });
        }
        setOneHotData(data);
      });
    fetch('/reference/Final_Multilingual_TokenID_Table.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const header = lines[0].split(',');
        setLangOrder(header.slice(1)); // 动态设置langOrder
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          const main_word = row[0];
          const obj = { main_word };
          for (let j = 1; j < header.length; j++) {
            obj[header[j]] = parseInt(row[j]);
          }
          data.push(obj);
        }
        setTokenIdData(data);
      });
  }, []);

  // 当前语言的词库
  const currentLang = languageOptions.find(l => l.code === language) || languageOptions[0];
  // 按钮分组（main_word）
  const subjects = currentLang.subjects;
  const verbs = currentLang.verbs;
  const objects = currentLang.objects;
  // 当前语言英文名
  const langName = language === 'zh' ? 'Chinese' : 'English';

  // 根据 main_word 和当前语言，查找本地词
  const getLocalWord = (main_word) => {
    const row = oneHotData.find(d => d.main_word === main_word && d.language === langName);
    return row ? row.local_word : main_word;
  };

  // 可视化逻辑
  useEffect(() => {
    if (!graphRef.current) return;
    d3.select(graphRef.current).selectAll('*').remove();
    const filled = holes.filter(Boolean);
    if (filled.length === 0 || tokenIdData.length === 0) return;
    let ratiosList = [];
    let tokenIdsList = [];
    filled.forEach((local_word, idx) => {
      const row = oneHotData.find(d => d.local_word === local_word && d.language === langName);
      const main_word = row ? row.main_word : local_word;
      const tokenRow = tokenIdData.find(d => d.main_word === main_word);
      const tokens = langOrder.map(lang => tokenRow ? tokenRow[lang] : 0);
      tokenIdsList.push(tokens);
      // 调试输出
      // console.log('main_word', main_word, 'tokens', tokens);
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
    const width = 420, height = 420, margin = 36;
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
      // 正17边形底（灰色）
      svg.append('path')
        .datum([...vertices, vertices[0]])
        .attr('d', d3.line().x(d => d.x).y(d => d.y))
        .attr('fill', 'rgba(200,200,200,0.12)')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
      // 变形17边形点
      const points = vertices.map((vertex, j) => {
        const nextVertex = vertices[(j + 1) % numSides];
        const ratio = ratios[j];
        return {
          x: vertex.x * (1 - ratio) + nextVertex.x * ratio,
          y: vertex.y * (1 - ratio) + nextVertex.y * ratio
        };
      });
      // 变形17边形黑线
      svg.append('path')
        .datum([...points, points[0]])
        .attr('d', d3.line().x(d => d.x).y(d => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', 1);
      // 变形17边形黑点
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
      .text(filled.join(' '));
  }, [holes, tokenIdData, oneHotData, language, langOrder]);

  // 拖拽到洞位（限制类型）
  const handleDrop = (idx) => {
    if (!dragWord) return;
    if (
      (idx === 0 && subjects.includes(dragWord)) ||
      (idx === 1 && verbs.includes(dragWord)) ||
      (idx === 2 && objects.includes(dragWord))
    ) {
      const newHoles = [...holes];
      newHoles[idx] = dragWord;
      setHoles(newHoles);
      setDragWord(null);
      setDragging(null);
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

  // 判断词语是否已被使用
  const isUsed = (w) => holes.includes(w);

  return (
    <MainBox>
      <LeftPanel>
        <Box sx={{ mb: 2, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: '0 0 160px', mr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>选择语言</Typography>
            <Select
              value={language}
              onChange={e => {
                setLanguage(e.target.value);
                setHoles([null, null, null]);
              }}
              sx={{ width: '100%', fontSize: 16, borderRadius: 2 }}
            >
              {languageOptions.map(opt => (
                <MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', mt: '40px' }}>
            <HoleRow sx={{ alignItems: 'flex-start' }}>
              {[0,1,2].map(idx => (
                <Hole key={idx} onDrop={() => handleDrop(idx)} onDragOver={handleDragOver}>
                  {holes[idx] ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 18, color: '#888', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span>{holes[idx]}</span>
                      <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => handleRemove(idx)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <span style={{ color: '#bbb' }}>{roleNames[idx]}</span>
                  )}
                </Hole>
              ))}
            </HoleRow>
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>主语</Typography>
        <WordList>
          {subjects.map(w => (
            <WordButton
              key={w}
              draggable
              onDragStart={() => { setDragWord(w); setDragging(w); }}
              onDragEnd={() => setDragging(null)}
              className={clsx({ dragging: dragging === w })}
              style={{ opacity: isUsed(getLocalWord(w)) ? 0.4 : 1, pointerEvents: isUsed(getLocalWord(w)) ? 'none' : 'auto' }}
            >
              {getLocalWord(w)}
            </WordButton>
          ))}
        </WordList>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>谓语</Typography>
        <WordList>
          {verbs.map(w => (
            <WordButton
              key={w}
              draggable
              onDragStart={() => { setDragWord(w); setDragging(w); }}
              onDragEnd={() => setDragging(null)}
              className={clsx({ dragging: dragging === w })}
              style={{ opacity: isUsed(getLocalWord(w)) ? 0.4 : 1, pointerEvents: isUsed(getLocalWord(w)) ? 'none' : 'auto' }}
            >
              {getLocalWord(w)}
            </WordButton>
          ))}
        </WordList>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>宾语</Typography>
        <WordList>
          {objects.map(w => (
            <WordButton
              key={w}
              draggable
              onDragStart={() => { setDragWord(w); setDragging(w); }}
              onDragEnd={() => setDragging(null)}
              className={clsx({ dragging: dragging === w })}
              style={{ opacity: isUsed(getLocalWord(w)) ? 0.4 : 1, pointerEvents: isUsed(getLocalWord(w)) ? 'none' : 'auto' }}
            >
              {getLocalWord(w)}
            </WordButton>
          ))}
        </WordList>
      </LeftPanel>
      <RightPanel>
        <svg ref={graphRef}></svg>
      </RightPanel>
    </MainBox>
  );
};

export default SentenceComposer; 