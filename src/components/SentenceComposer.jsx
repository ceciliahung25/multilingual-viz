import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';
import * as d3 from 'd3';
import CryptoJS from 'crypto-js';
import PageLayout from './PageLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { 
  ContentBox, 
  StyledPaper, 
  StyledSelect, 
  StyledMenuItem, 
  LeftPanel as BaseLeftPanel, 
  RightPanel
} from './CommonStyles';

// 自定义左侧面板
const LeftPanel = styled(BaseLeftPanel)(({ theme }) => ({
  width: 550, // 调整宽度以容纳所有控件
  gap: 24,
  padding: '24px 28px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    maxWidth: 550,
    padding: '20px',
  },
}));

// 词语列表容器
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

// 槽位
const Hole = styled(StyledPaper)(({ theme }) => ({
  minWidth: 100,
  maxWidth: 180,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: '#bbb',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  position: 'relative',
  padding: '0 18px',
  overflow: 'visible',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  marginBottom: 0,
  [theme.breakpoints.down('sm')]: {
    minWidth: 90,
    fontSize: 14,
    height: 48,
    padding: '0 10px',
  },
}));

// 词语按钮
const WordButton = styled(Box)(({ theme }) => ({
  display: 'inline-block',
  margin: '4px',
  padding: '8px 14px',
  borderRadius: 16, // 统一圆角
  background: '#fff',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
  fontSize: 16,
  minHeight: 32,
  height: 'auto',
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
    fontSize: 14,
    padding: '6px 10px',
    minHeight: 28,
  },
}));

const languageOptions = [
  { code: 'en', label: 'English',
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

const SentenceComposer = () => {
  const { language: appLanguage } = useLanguage();
  // 当前语言 - 根据应用语言设置默认值
  const [language, setLanguage] = useState(appLanguage === 'zh' ? 'zh' : 'en');
  // 洞的内容：主语、谓语、宾语
  const [holes, setHoles] = useState([null, null, null]);
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
  const containerRef = useRef();
  const [graphSize, setGraphSize] = useState({ width: 420, height: 420 });

  // 当应用语言改变时，同步更新组件语言并清空槽位
  useEffect(() => {
    const newLang = appLanguage === 'zh' ? 'zh' : 'en';
    setLanguage(newLang);
    setHoles([null, null, null]); // 清空槽位
  }, [appLanguage]);

  // 自适应调整图表大小
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
  // 当前语言英文名称（用于CSV数据查找）
  const langName = language === 'zh' ? 'Chinese' : 'English';

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
    const h = CryptoJS.SHA256(s).toString();
    const bits = h.slice(0, 24).split('').map(x => parseInt(x, 16) % 2);
    // 3. 绘制
    const { width, height } = graphSize;
    const margin = Math.floor(width * 0.09);
    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    const numSides = 17;
    const baseRadius = Math.min(width, height) / 2 - margin;
    const radiusStep = Math.min(38, baseRadius / filled.length);
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
        .attr('r', width < 350 ? 5 : 7)
        .attr('fill', '#000');
    });
    // 内部矩阵
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = width < 350 ? 3 : 4;
    const yGap = width < 350 ? 6 : 8;
    const xGap = width < 350 ? 6 : 8;
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
      .attr('y', baseRadius + (width < 350 ? 20 : 30))
      .attr('fill', '#000')
      .attr('font-size', width < 350 ? 13 : 15)
      .text(filled.join(' '));
  }, [holes, tokenIdData, oneHotData, language, langOrder, graphSize, langName]);

  // 拖拽开始
  const handleDragStart = (e, word) => {
    setDragging(word);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', word);
  };

  // 拖拽结束
  const handleDragEnd = () => {
    setDragging(null);
  };

  // 拖拽到洞位（限制类型）
  const handleDrop = (e, idx) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (!word) return;
    
    if (
      (idx === 0 && subjects.includes(word)) ||
      (idx === 1 && verbs.includes(word)) ||
      (idx === 2 && objects.includes(word))
    ) {
      const newHoles = [...holes];
      newHoles[idx] = word;
      setHoles(newHoles);
    }
    setDragging(null);
  };

  // 允许放置
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 判断词语是否已被使用
  const isUsed = (w) => holes.includes(w);

  const handleWordClick = (word, type) => {
    // 找到第一个空的对应类型的槽位
    let idx;
    if (type === 'subject') idx = 0;
    else if (type === 'verb') idx = 1;
    else if (type === 'object') idx = 2;

    // 如果该类型的槽位为空，则填充
    if (holes[idx] === null) {
      const newHoles = [...holes];
      newHoles[idx] = word;
      setHoles(newHoles);
    }
  };

  return (
    <PageLayout
      title={t('sentenceComposer.title', appLanguage)}
      subtitle={t('sentenceComposer.subtitle', appLanguage)}
    >
      <ContentBox>
        <LeftPanel>
          {/* 语言选择和句子槽位放在一起 */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('sentenceComposer.selectLanguage', appLanguage)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <StyledSelect
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {languageOptions.map(option => (
                  <StyledMenuItem key={option.code} value={option.code}>
                    {option.label}
                  </StyledMenuItem>
                ))}
              </StyledSelect>
            </Box>
            
            {/* 句子槽位 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              {holes.map((word, idx) => (
                <Hole 
                  key={idx}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragOver={handleDragOver}
                  sx={{ position: 'relative' }}
                >
                  {word ? (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {word}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newHoles = [...holes];
                          newHoles[idx] = null;
                          setHoles(newHoles);
                        }}
                        sx={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          backgroundColor: '#f0f0f0',
                          padding: '2px',
                          '&:hover': { backgroundColor: '#e0e0e0' }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </>
                  ) : (
                    <Typography variant="body1" sx={{ color: '#ccc' }}>
                      {appLanguage === 'zh' ? ['主语', '谓语', '宾语'][idx] : ['Subject', 'Verb', 'Object'][idx]}
                    </Typography>
                  )}
                </Hole>
              ))}
            </Box>
          </Box>
          
          {/* 词语列表 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            {/* 主语 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {appLanguage === 'zh' ? '主语' : 'Subject'}
              </Typography>
              <WordList>
                {languageOptions.find(opt => opt.code === language)?.subjects.map(word => (
                  <WordButton
                    key={word}
                    disabled={isUsed(word)}
                    draggable={!isUsed(word)}
                    onDragStart={(e) => handleDragStart(e, word)}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isUsed(word) && handleWordClick(word, 'subject')}
                    className={clsx(dragging === word && 'dragging')}
                    sx={{
                      opacity: isUsed(word) ? 0.3 : 1,
                      cursor: isUsed(word) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {word}
                  </WordButton>
                ))}
              </WordList>
            </Box>

            {/* 谓语 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {appLanguage === 'zh' ? '谓语' : 'Verb'}
              </Typography>
              <WordList>
                {languageOptions.find(opt => opt.code === language)?.verbs.map(word => (
                  <WordButton
                    key={word}
                    disabled={isUsed(word)}
                    draggable={!isUsed(word)}
                    onDragStart={(e) => handleDragStart(e, word)}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isUsed(word) && handleWordClick(word, 'verb')}
                    className={clsx(dragging === word && 'dragging')}
                    sx={{
                      opacity: isUsed(word) ? 0.3 : 1,
                      cursor: isUsed(word) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {word}
                  </WordButton>
                ))}
              </WordList>
            </Box>

            {/* 宾语 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {appLanguage === 'zh' ? '宾语' : 'Object'}
              </Typography>
              <WordList>
                {languageOptions.find(opt => opt.code === language)?.objects.map(word => (
                  <WordButton
                    key={word}
                    disabled={isUsed(word)}
                    draggable={!isUsed(word)}
                    onDragStart={(e) => handleDragStart(e, word)}
                    onDragEnd={handleDragEnd}
                    onClick={() => !isUsed(word) && handleWordClick(word, 'object')}
                    className={clsx(dragging === word && 'dragging')}
                    sx={{
                      opacity: isUsed(word) ? 0.3 : 1,
                      cursor: isUsed(word) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {word}
                  </WordButton>
                ))}
              </WordList>
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

export default SentenceComposer; 