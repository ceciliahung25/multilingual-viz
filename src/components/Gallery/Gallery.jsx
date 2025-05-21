import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';
import { presetVisualizations } from '../../data/visualizations';
import * as d3 from 'd3';
import PageLayout from '../PageLayout';

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

    // 绘制17边形轮廓
    const polygonLine = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    g.append('path')
      .datum([...vertices, vertices[0]])
      .attr('d', polygonLine)
      .attr('fill', 'rgba(200, 200, 200, 0.12)')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // 绘制内部多边形
    g.append('path')
      .datum([...points, points[0]])
      .attr('d', polygonLine)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    // 添加点（外圈）
    g.selectAll('.node')
      .data(points)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 3)
      .attr('fill', '#000');

    // 内部矩阵参数
    const rowCounts = [2, 4, 6, 6, 4, 2];
    const dotR = size * 0.035; // 圆点半径
    const yGap = dotR * 2.2;   // 行间距
    const xGap = dotR * 2.2;   // 列间距
    let bitIdx = 0;
    const totalRows = rowCounts.length;
    const matrixGroup = g.append('g').attr('class', 'matrix-group');
    let firstDotPos = null;
    rowCounts.forEach((count, row) => {
      const y = (row - (totalRows - 1) / 2) * yGap;
      const xStart = -((count - 1) / 2) * xGap;
      for (let i = 0; i < count; i++) {
        const x = xStart + i * xGap;
        const color = Math.random() > 0.5 ? '#000' : '#ccc';
        matrixGroup.append('circle')
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
      matrixGroup.append('path')
        .attr('d', `M ${triX} ${triY} L ${triX - triangleBase} ${triY + triangleHeight/2} L ${triX - triangleBase} ${triY - triangleHeight/2} Z`)
        .attr('fill', 'red');
    }

    // 添加词语标签
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', radius + size * 0.18)
      .attr('fill', '#000')
      .attr('font-size', size * 0.13)
      .text(word);

    return g;
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight - 180; // 为PageLayout的标题留出空间
    const nodeSpacing = 150; // 词语之间的间距

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', '#fff');

    const container = svg.append('g');

    // 创建力导向图布局
    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeSpacing));

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
    <PageLayout
      title="视觉化图库"
      subtitle="浏览不同词语的视觉符号表示，可以拖动和缩放查看更多细节"
    >
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 220px)',
        overflow: 'hidden',
        bgcolor: '#fff',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <svg ref={svgRef}></svg>
      </Box>
    </PageLayout>
  );
};

export default Gallery; 