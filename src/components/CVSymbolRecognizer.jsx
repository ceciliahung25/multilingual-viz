import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Grid, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
// 导入页面布局
import PageLayout from './PageLayout';
// 导入符号CV检测器
import SymbolCVDetector from '../utils/SymbolCVDetector';
// 导入符号描述数据
import { symbolCategories, symbolDescriptions } from '../data/symbolData';
// 导入符号Token映射函数
import { getTokensForSymbol } from '../utils/tokenMapping';

// 容器样式
const Container = styled(Box)(({ theme }) => ({
  width: '100%',
}));

const DropZone = styled(Paper)(({ theme, isDragging }) => ({
  padding: theme.spacing(6),
  border: `2px dashed ${isDragging ? theme.palette.primary.main : '#ccc'}`,
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backgroundColor: isDragging ? '#f7f7f9' : 'white',
  transition: 'all 0.3s ease',
  height: 320,
  maxWidth: 520,
  margin: '0 auto',
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: 320,
  objectFit: 'contain',
  marginTop: 8,
  borderRadius: 8,
  display: 'block',
});

const CVSymbolRecognizer = () => {
  const [detector, setDetector] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showStructure, setShowStructure] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('正在加载OpenCV.js...');
  
  const fileInputRef = useRef(null);
  
  // 初始化OpenCV.js和检测器
  useEffect(() => {
    async function initializeDetector() {
      try {
        setIsLoading(true);
        
        // 如果OpenCV.js尚未加载，添加脚本
        if (!window.cv) {
          setLoadingMessage('正在加载OpenCV.js...');
          const script = document.createElement('script');
          script.src = 'https://docs.opencv.org/4.6.0/opencv.js';
          script.async = true;
          script.onload = () => {
            setLoadingMessage('OpenCV.js已加载，正在初始化检测器...');
            window.onOpenCVReady = () => {
              console.log('OpenCV.js准备就绪');
              const newDetector = new SymbolCVDetector();
              setDetector(newDetector);
              setIsLoading(false);
            };
          };
          script.onerror = () => {
            setError('加载OpenCV.js失败');
            setIsLoading(false);
          };
          document.body.appendChild(script);
        } else {
          // 如果OpenCV.js已加载，直接初始化检测器
          setLoadingMessage('正在初始化检测器...');
          const newDetector = new SymbolCVDetector();
          setDetector(newDetector);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('初始化错误:', err);
        setError(`初始化失败: ${err.message}`);
        setIsLoading(false);
      }
    }
    
    initializeDetector();
  }, []);
  
  // 处理图像选择
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setPredictions(null); // 重置预测结果
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 处理拖放
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setPredictions(null); // 重置预测结果
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 执行预测
  const performPrediction = async () => {
    if (!detector || !image) return;
    
    try {
      setError('');
      setPredictions(null);
      setSelectedSymbol(null); // 重置选中的符号
      setShowStructure(false); // 重置结构视图
      setIsLoading(true); // 开始加载
      
      // 使用CV检测器识别符号
      const result = await detector.detectSymbol(image);
      
      if (result) {
        const { word, wordId } = result;
        const symbolIndex = wordId - 1; // wordId是从1开始的，转为0基索引
        
        // 查找符号类别
        const symbolKey = Object.keys(symbolCategories).find(
          key => parseInt(key) === symbolIndex
        );
        
        if (symbolKey) {
          const category = symbolCategories[symbolKey];
          const name = category.split('/')[0]; // 获取中文名称
          const english = category.split('/')[1]; // 获取英文名称
          
          // 构建预测结果
          const prediction = {
            className: category,
            probability: 0.95
          };
          
          setPredictions([prediction]);
          
          // 设置选中的符号
          setSelectedSymbol({
            key: parseInt(symbolKey),
            name: name,
            english: english,
            description: symbolDescriptions[symbolKey]?.cn || "暂无详细描述",
            description_en: symbolDescriptions[symbolKey]?.en || "No description available",
            tokens: getTokensForSymbol(symbolIndex),
            // 不再需要生成SVG，直接使用PNG
            wordId: wordId
          });
        } else {
          setError('无法识别的符号');
        }
      } else {
        setError('未能识别符号');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('预测过程中出错:', err);
      setError(`预测失败: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  // 清除图像和预测
  const handleClear = () => {
    setImage(null);
    setPredictions(null);
    setSelectedSymbol(null); // 清除选中的符号
    setShowStructure(false); // 重置结构视图
    setError('');
  };
  
  // 符号详情卡片组件
  const SymbolDetailsCard = ({ symbol }) => {
    if (!symbol) return null;
    
    // 符号释义视图
    if (!showStructure) {
    return (
        <Paper sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2, 
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Button 
            sx={{ position: 'absolute', top: 8, right: 8 }}
            size="small"
            onClick={() => setSelectedSymbol(null)}
          >
            ×
          </Button>
          
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {symbol.name}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.7 }}>
            {symbol.description}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
            {symbol.description_en}
          </Typography>
          
          <Button 
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setShowStructure(true)}
          >
            查看结构释义
          </Button>
        </Paper>
      );
    }
    
    // 符号结构视图
    return (
      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        borderRadius: 2, 
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Button 
          sx={{ position: 'absolute', top: 8, right: 8 }}
          size="small"
          onClick={() => setSelectedSymbol(null)}
        >
          ×
        </Button>
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', display: 'inline-block', mb: 1 }}>
            符号符号构型原理
          </Typography>
          <Typography variant="body2" sx={{ display: 'block', color: '#666' }}>
            17边形上的每个点的位置由对应语言中该词语的token值决定，内部矩阵同理，红色小三角形为机器识别起始符。
          </Typography>
        </Box>
        
        {/* 使用符号PNG图片 */}
        <Box sx={{ 
          width: '100%', 
          textAlign: 'center', 
          mb: 2,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Box 
            component="img"
            src={`${process.env.PUBLIC_URL}/reference/symbols_50/${symbol.key + 1}_${symbol.english.toLowerCase()}.png`}
            alt={symbol.name}
            onError={(e) => {
              // 如果图片加载失败，显示默认的圆形
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
            sx={{
              width: 200,
              height: 200,
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          
          {/* 备用显示 - 当图片加载失败时显示 */}
          <Box 
            sx={{ 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              backgroundColor: '#f8f8f8',
              border: '1px solid #eaeaea',
              position: 'relative',
              display: 'none', // 默认隐藏
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* 外围点 */}
            {Array.from({length: 17}, (_, i) => {
              const angle = (i / 17) * Math.PI * 2;
              const r = 90;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              return (
                <Box 
                  key={i}
                  sx={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    backgroundColor: '#333',
                    borderRadius: '50%',
                    left: 'calc(50% + ' + x + 'px)',
                    top: 'calc(50% + ' + y + 'px)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              );
            })}
            
            {/* 红色标识符 */}
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '12px solid #e53935',
                position: 'absolute',
                top: '20%',
                left: '30%'
              }}
            />
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            mt: 2, 
            mb: 3, 
            p: 2, 
            border: '1px solid #eee', 
            borderRadius: 2,
            backgroundColor: '#fafafa',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>17种语言对应Token值：</Typography>
          {Object.entries(symbol.tokens).map(([lang, token], idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{lang}:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                {token}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained"
            onClick={() => setShowStructure(false)}
            sx={{ 
              backgroundColor: '#000', 
              color: '#fff',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            回到释义
          </Button>
        </Box>
      </Paper>
    );
  };
  
  if (isLoading && !image) {
    return (
      <PageLayout 
        title="符号识别 (CV版)" 
        subtitle="上传一张符号图片，基于计算机视觉技术将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
      >
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>{loadingMessage}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            这可能需要几秒钟时间
          </Typography>
        </Box>
      </Container>
      </PageLayout>
    );
  }
  
  if (error && !image) {
    return (
      <PageLayout 
        title="符号识别 (CV版)" 
        subtitle="上传一张符号图片，基于计算机视觉技术将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
      >
      <Container>
        <Paper sx={{ p: 3, bgcolor: '#fff8f8', border: '1px solid #ffcccc', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" color="error">初始化失败</Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{error}</Typography>
          
          <Button 
            fullWidth
            variant="outlined" 
            color="primary" 
            onClick={() => window.location.reload()}
            startIcon={<span role="img" aria-label="refresh">🔄</span>}
          >
            刷新页面重试
          </Button>
        </Paper>
      </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title="符号识别 (CV版)" 
      subtitle="上传一张符号图片，基于计算机视觉技术将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
    >
    <Container>
      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        此版本使用传统计算机视觉算法进行识别，对符号的方向和拍摄角度有更高的要求，但处理速度更快。
        请确保符号在图片中清晰可见，且红色三角标记朝上。
      </Alert>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      {!image ? (
        <Paper sx={{ p: 4, bgcolor: '#f9f9f9', borderRadius: 3, mt: 2 }}>
          <DropZone
            isDragging={isDragging}
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Typography variant="h6" gutterBottom>拖放图片到此处</Typography>
            <Typography variant="body2" color="text.secondary">或点击选择图片</Typography>
          </DropZone>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <ImagePreview src={image} alt="上传的图片" />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleClear}>
                      清除
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={performPrediction}
                      disabled={!detector || isLoading}
                    >
                      {isLoading ? '识别中...' : '识别符号'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  border: '2px solid #f0f0f0', 
                  borderRadius: 2, 
                  p: 2, 
                  height: '100%', 
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                    识别结果
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                  )}
                  
                  {isLoading && (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1
                    }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        正在处理图像...
                      </Typography>
                    </Box>
                  )}
                  
                  {!isLoading && predictions ? (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      {predictions.map((pred, index) => (
                        <Box key={index} sx={{ mb: 1.8, ...(index === 0 && { pb: 1.5, mb: 2, borderBottom: '1px dashed #eee' }) }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight='bold' color='primary.main'>
                              {pred.className}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color='primary.main'>
                              {(pred.probability * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              mt: 0.5,
                              height: 6,
                              width: '100%',
                              bgcolor: '#eee',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${pred.probability * 100}%`,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                transition: 'width 0.5s ease-in-out'
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    !isLoading && (
                      <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'text.secondary',
                        p: 2
                      }}>
                        <Box sx={{ opacity: 0.5, mb: 2 }}>
                          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                          </svg>
                        </Box>
                        <Typography variant="body1" align="center">
                          点击"识别符号"按钮开始分析图片
                        </Typography>
                      </Box>
                    )
                  )}
                </Box>
              </Grid>
            </Grid>
              
            {/* 符号详情卡片 */}
            {selectedSymbol && <SymbolDetailsCard symbol={selectedSymbol} />}
          </Box>
        </Paper>
      )}
    </Container>
    </PageLayout>
  );
};

export default CVSymbolRecognizer; 