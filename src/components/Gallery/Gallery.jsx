import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import { presetVisualizations } from '../../data/visualizations';
import * as d3 from 'd3';

const Gallery = () => {
  const [selectedViz, setSelectedViz] = useState(null);
  const [scale, setScale] = useState(1);
  const previewRefs = useRef({});
  const modalRef = useRef();
  const svgRef = useRef(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  
  const words = [
    'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst',
    'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival',
    'adventure', 'blessings', 'healthy', 'success', 'prosperity', 'joy', 'kindness', 'harmony',
    'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude', 'observation', 'exploration',
    'perception', 'creation', 'push', 'poetry', 'experience', 'wisdom', 'dream', 'leader',
    'teach', 'despair', 'unforgettable', 'fresh', 'resilient', 'smile', 'future', 'brilliant',
    'stillness', 'majestic'
  ];

  // const handleZoomIn = () => {
  //   setScale(prev => Math.min(prev + 0.2, 2));
  // };

  // const handleZoomOut = () => {
  //   setScale(prev => Math.max(prev - 0.2, 0.5));
  // };

  const generateVisualization = (container, word, x, y, size = 100) => {
    const margin = size * 0.15;
    const radius = size / 2 - margin;

    const g = container.append('g')
      .attr('transform', `translate(${x},${y})`);

    // 生成17边形的顶点
    const numSides = 17;
    const angles = d3.range(numSides).map(i => i * (2 * Math.PI / numSides));
    
    const vertices = angles.map(angle => ({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    }));

    // 生成随机比例作为示例数据
    const ratios = Array(17).fill(0).map(() => Math.random());

    // 计算边上的点
    const points = vertices.map((vertex, i) => {
      const nextVertex = vertices[(i + 1) % numSides];
      const ratio = ratios[i];
      return {
        x: vertex.x * (1 - ratio) + nextVertex.x * ratio,
        y: vertex.y * (1 - ratio) + nextVertex.y * ratio
      };
    });

    // 绘制填充的多边形
    const pointLine = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    g.append('path')
      .datum([...points, points[0]])
      .attr('d', pointLine)
      .attr('fill', 'rgba(66, 133, 244, 0.1)')
      .attr('stroke', '#4285f4')
      .attr('stroke-width', 1);

    // 添加点
    g.selectAll('.node')
      .data(points)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 2)
      .attr('fill', '#4285f4');

    // 添加词语标签
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', radius + 20)
      .attr('fill', '#fff')
      .text(word);

    return g;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const padding = 150; // 词语之间的间距

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#1a1a1a');

    const container = svg.append('g');

    // 创建力导向图布局
    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(padding));

    // 创建节点数据
    const nodes = words.map((word, i) => ({
      id: i,
      word: word,
      x: Math.random() * width,
      y: Math.random() * height
    }));

    simulation.nodes(nodes).on('tick', () => {
      container.selectAll('g').remove();
      nodes.forEach(node => {
        generateVisualization(container, node.word, node.x, node.y);
      });
    });

    // 添加缩放功能
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setTransform(event.transform);
      });

    svg.call(zoom);

    // 初始缩放以适应屏幕
    const initialScale = 0.8;
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(initialScale)
      .translate(-width / 2, -height / 2));

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#1a1a1a'
    }}>
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export default Gallery; 