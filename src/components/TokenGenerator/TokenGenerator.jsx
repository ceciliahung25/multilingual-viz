import React, { useState, useRef} from 'react';
import { Box, Paper, Typography, TextField, Button, Select, MenuItem } from '@mui/material';
import * as d3 from 'd3';

const TokenGenerator = () => {
  const [word, setWord] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const graphRef = useRef();

  // 17种语言
  const languages = [
    { code: 'ar', name: '阿拉伯语' },
    { code: 'de', name: '德语' },
    { code: 'en', name: '英语' },
    { code: 'es', name: '西班牙语' },
    { code: 'fr', name: '法语' },
    { code: 'hi', name: '印地语' },
    { code: 'id', name: '印度尼西亚语' },
    { code: 'it', name: '意大利语' },
    { code: 'ja', name: '日语' },
    { code: 'nl', name: '荷兰语' },
    { code: 'pt', name: '葡萄牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'th', name: '泰语' },
    { code: 'tr', name: '土耳其语' },
    { code: 'vi', name: '越南语' },
    { code: 'zh', name: '中文' },
    { code: 'ko', name: '朝鲜语' }
  ];

  const handleGenerate = () => {
    // 示例数据，实际应该从API获取
    const mockRatios = [0.34025, 0.13204, 0.0065, 0.078165, 0.124275, 0.100605, 0.23327, 
                       0.094075, 0.07116, 0.436815, 0.078165, 0.348245, 0.43296, 
                       0.855315, 0.096285, 0.314425, 0.049595];
    generateVisualization(mockRatios);
  };

  const generateVisualization = (ratios) => {
    if (!graphRef.current) return;

    // 清除之前的内容
    d3.select(graphRef.current).selectAll("*").remove();

    // 设置画布尺寸和边距
    const width = 800;
    const height = 800;
    const margin = 100;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(graphRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);

    // 生成17边形的顶点
    const numSides = 17;
    const angles = d3.range(numSides).map(i => i * (2 * Math.PI / numSides));
    
    // 计算顶点坐标
    const vertices = angles.map(angle => ({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    }));

    // 绘制17边形轮廓
    const polygonLine = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    svg.append('path')
      .datum([...vertices, vertices[0]])
      .attr('d', polygonLine)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

    // 计算边上的点
    const points = vertices.map((vertex, i) => {
      const nextVertex = vertices[(i + 1) % numSides];
      const ratio = ratios[i];
      return {
        x: vertex.x * (1 - ratio) + nextVertex.x * ratio,
        y: vertex.y * (1 - ratio) + nextVertex.y * ratio,
        ratio: ratio,
        language: languages[i].name
      };
    });

    // 绘制连接的点
    const pointLine = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    // 绘制填充的多边形
    svg.append('path')
      .datum([...points, points[0]])
      .attr('d', pointLine)
      .attr('fill', 'rgba(66, 133, 244, 0.1)')
      .attr('stroke', '#4285f4')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .attr('opacity', 1);

    // 添加点
    const nodes = svg.selectAll('.node')
      .data(points)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle')
      .attr('r', 4)
      .attr('fill', '#4285f4')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr('opacity', 1);

    // 添加标签
    nodes.append('text')
      .attr('x', d => (d.x > 0 ? 15 : -15))
      .attr('y', 5)
      .attr('text-anchor', d => d.x > 0 ? 'start' : 'end')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('opacity', 0)
      .text(d => `${d.language}: ${Math.round(d.ratio * 200000)}`)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .attr('opacity', 1);

    // 添加参考圆
    const circles = [radius * 0.3, radius * 0.6, radius];
    svg.selectAll('.reference-circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('class', 'reference-circle')
      .attr('r', d => d)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.3);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, bgcolor: '#2d2d2d', color: '#fff', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Token生成器
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            sx={{ 
              width: 200,
              bgcolor: '#3d3d3d',
              color: '#fff',
              '& .MuiSelect-icon': { color: '#fff' }
            }}
            displayEmpty
          >
            <MenuItem value="">选择源语言</MenuItem>
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="输入词语"
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
            onClick={handleGenerate}
            sx={{ bgcolor: '#4285f4' }}
          >
            生成可视化
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          使用 xlm-mlm-17-1280 模型生成多语言Token映射
        </Typography>
      </Paper>
      <Paper sx={{ p: 3, bgcolor: '#2d2d2d' }}>
        <svg ref={graphRef}></svg>
      </Paper>
    </Box>
  );
};

export default TokenGenerator; 