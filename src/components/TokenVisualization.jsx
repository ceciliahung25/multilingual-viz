import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Paper, Select, MenuItem, TextField, Button } from '@mui/material';

const TokenVisualization = () => {
  const graphRef = useRef();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // 示例数据
  const languageData = [
    { lang: "Dutch", word: "vrede", token: 97571 },
    { lang: "Portuguese", word: "paz", token: 24566 },
    { lang: "Russian", word: "мир", token: 20932 },
    { lang: "German", word: "Frieden", token: 41010 },
    { lang: "English", word: "peace", token: 8043 },
    { lang: "Spanish", word: "paz", token: 24566 },
    { lang: "French", word: "paix", token: 27346 },
    { lang: "Hindi", word: "शांति", token: 173653 }
  ];

  useEffect(() => {
    if (!graphRef.current) return;

    // 设置画布尺寸
    const width = 800;
    const height = 800;
    const radius = Math.min(width, height) / 2 - 100;

    // 清除之前的内容
    d3.select(graphRef.current).selectAll("*").remove();

    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // 创建同心圆
    const circles = [radius * 0.3, radius * 0.6, radius];
    svg.selectAll('.orbit')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'orbit')
      .attr('r', d => d)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3');

    // 计算节点位置
    const angleStep = (2 * Math.PI) / languageData.length;
    const nodes = languageData.map((d, i) => ({
      ...d,
      x: radius * Math.cos(i * angleStep),
      y: radius * Math.sin(i * angleStep)
    }));

    // 创建中心点
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
      .attr('fill', '#e91e63');

    // 添加连接线
    svg.selectAll('.connection')
      .data(nodes)
      .enter()
      .append('line')
      .attr('class', 'connection')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

    // 添加节点
    const nodeGroups = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // 添加节点圆圈
    nodeGroups.append('circle')
      .attr('r', 6)
      .attr('fill', '#4285f4');

    // 添加文本标签
    nodeGroups.append('text')
      .attr('x', d => (d.x > 0 ? 15 : -15))
      .attr('y', 5)
      .attr('text-anchor', d => d.x > 0 ? 'start' : 'end')
      .text(d => `${d.lang}: ${d.token}`)
      .attr('fill', '#fff')
      .attr('font-size', '12px');

  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, bgcolor: '#2d2d2d', color: '#fff', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          多语言Token可视化
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            sx={{ 
              width: 200, 
              bgcolor: '#3d3d3d',
              color: '#fff',
              '& .MuiSelect-icon': { color: '#fff' }
            }}
            displayEmpty
          >
            <MenuItem value="">选择语言</MenuItem>
            {languageData.map(lang => (
              <MenuItem key={lang.lang} value={lang.lang}>
                {lang.lang}
              </MenuItem>
            ))}
          </Select>
          <TextField
            placeholder="输入Token ID"
            variant="outlined"
            size="small"
            sx={{ 
              width: 200,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                bgcolor: '#3d3d3d',
                '& fieldset': {
                  borderColor: '#666',
                },
                '&:hover fieldset': {
                  borderColor: '#999',
                },
              }
            }}
          />
          <Button 
            variant="contained" 
            color="primary"
            sx={{ bgcolor: '#4285f4' }}
          >
            搜索
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ p: 3, bgcolor: '#2d2d2d' }}>
        <svg ref={graphRef}></svg>
      </Paper>
    </Box>
  );
};

export default TokenVisualization;
