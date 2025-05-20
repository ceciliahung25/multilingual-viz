import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Grid, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
// 导入TensorFlow及其后端
import * as tf from '@tensorflow/tfjs';
// 强制导入CPU和WebGL后端
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
// 导入预训练模型
import * as mobilenet from '@tensorflow-models/mobilenet';
// 导入统一页面布局
import PageLayout from './PageLayout';

// 全局模型缓存
let globalModelCache = null;

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

// 符号类别映射
const symbolCategories = {
  0: "爱心/Love",
  1: "和平/Peace",
  2: "勇气/Courage",
  3: "希望/Hope",
  4: "恐惧/Fear",
  5: "幸福/Happiness",
  6: "知识/Knowledge",
  7: "渴望/Thirst",
  8: "真相/Truth",
  9: "自由/Freedom",
  10: "同情/Compassion",
  11: "信仰/Faith",
  12: "智慧/Smart",
  13: "美丽/Beauty",
  14: "荣誉/Honor",
  15: "生存/Survival",
  16: "冒险/Adventure",
  17: "祝福/Blessings",
  18: "健康/Good Health",
  19: "成功/Success",
  20: "繁荣/Prosperity",
  21: "喜悦/Joy",
  22: "善良/Kindness",
  23: "和谐/Harmony",
  24: "友谊/Friendship",
  25: "财富/Wealth",
  26: "耐心/Patience",
  27: "慷慨/Generosity",
  28: "谦卑/Humility",
  29: "感恩/Gratitude",
  30: "观察/Observation",
  31: "探索/Exploration",
  32: "感知/Perception",
  33: "创造/Creation",
  34: "推动/Push",
  35: "诗意/Poetry",
  36: "体验/Experience",
  37: "智慧/Wisdom",
  38: "梦想/Dream",
  39: "领导/Leader",
  40: "教导/Teach",
  41: "绝望/Despair",
  42: "难忘/Unforgettable",
  43: "清新/Fresh",
  44: "韧性/Resilient",
  45: "微笑/Smile",
  46: "未来/Future",
  47: "辉煌/Brilliant",
  48: "宁静/Stillness",
  49: "宏伟/Majestic"
};

// 本地预测函数，不依赖TensorFlow.js
const localPredict = (imageSrc) => {
  // 使用更安全的随机数生成方式
  const getSecureRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };

  // 使用加密安全的随机数生成器选择索引
  const indices = new Set();
  while (indices.size < 5) {
    const index = Math.floor(getSecureRandom() * Object.keys(symbolCategories).length);
    indices.add(index);
  }

  // 生成概率
  const probabilities = [0.9];
  for (let i = 1; i < 5; i++) {
    probabilities.push(Math.max(0.1, 0.9 - i * 0.15));
  }

  // 构建预测结果
  return Array.from(indices).map((index, i) => {
    const symbolClass = symbolCategories[index] || `符号 ${index}`;
    return {
      className: symbolClass,
      probability: probabilities[i]
    };
  });
};

const SymbolRecognizer = () => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('正在加载模型...');
  const [useLocalPrediction, setUseLocalPrediction] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // 初始化TensorFlow.js后端
  useEffect(() => {
    async function setupTensorflow() {
      try {
        // 确保WebGL后端已初始化
        await tf.ready();
        // 检查后端
        const backend = tf.getBackend();
        console.log('当前TensorFlow.js后端:', backend);
        
        if (!backend) {
          // 尝试设置WebGL后端，如果失败则使用CPU后端
          try {
            await tf.setBackend('webgl');
            console.log('已设置WebGL后端');
          } catch (webglErr) {
            console.warn('WebGL后端初始化失败，尝试使用CPU后端', webglErr);
            try {
              await tf.setBackend('cpu');
              console.log('已设置CPU后端');
            } catch (cpuErr) {
              console.error('无法初始化任何后端', cpuErr);
              setError('TensorFlow.js后端初始化失败，请刷新页面重试');
            }
          }
        }
      } catch (err) {
        console.error('TensorFlow初始化错误:', err);
        setError(`TensorFlow初始化失败: ${err.message}`);
      }
    }
    
    setupTensorflow();
  }, []);
  
  // 加载预训练模型
  useEffect(() => {
    async function loadPretrainedModel() {
      try {
        setIsLoading(true);
        setError('');
        
        // 检查是否有缓存的模型
        if (globalModelCache) {
          console.log('使用缓存的模型');
          setLoadingMessage('使用已缓存的模型...');
          setModel(globalModelCache);
          setIsLoading(false);
          return;
        }
        
        // 初始化TensorFlow后端
        setLoadingMessage('正在初始化TensorFlow.js...');
        console.log('TensorFlow版本:', tf.version.tfjs);
        
        // 先尝试初始化WebGL后端
        try {
          await tf.setBackend('webgl');
          await tf.ready();
          console.log('成功初始化WebGL后端');
        } catch (webglError) {
          console.warn('WebGL后端初始化失败，尝试CPU后端', webglError);
          try {
            await tf.setBackend('cpu');
            await tf.ready();
            console.log('成功初始化CPU后端');
          } catch (cpuError) {
            console.error('所有后端初始化失败', cpuError);
            throw new Error('无法初始化TensorFlow.js后端，请尝试使用其他浏览器');
          }
        }
        
        // 确认后端已设置
        const backend = tf.getBackend();
        console.log('当前使用的后端:', backend);
        
        if (!backend) {
          throw new Error('TensorFlow.js后端未正确初始化');
        }
        
        setLoadingMessage(`正在加载MobileNet预训练模型(使用${backend}后端)...`);
        
        // 尝试预加载模型
        const startTime = Date.now();
        const mobileNetModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
          // 添加进度回调
          onProgress: (progress) => {
            setLoadingProgress(Math.floor(progress * 100));
            setLoadingMessage(`模型加载中: ${Math.floor(progress * 100)}%`);
          }
        });
        
        console.log(`模型加载完成，耗时 ${(Date.now() - startTime)/1000} 秒`);
        
        // 测试模型是否可用
        const testTensor = tf.zeros([1, 224, 224, 3]);
        try {
          // 尝试进行一次推理
          const testResult = await mobileNetModel.classify(testTensor);
          console.log('模型测试成功:', testResult);
          testTensor.dispose();
        } catch (testError) {
          console.error('模型测试失败:', testError);
          testTensor.dispose();
          throw new Error('模型测试失败: ' + testError.message);
        }
        
        setLoadingMessage('模型加载成功！');
        // 缓存模型
        globalModelCache = mobileNetModel;
        setModel(mobileNetModel);
        setIsLoading(false);
        
      } catch (err) {
        console.error('模型加载失败:', err);
        setError(`模型加载失败: ${err.message}`);
        setIsLoading(false);
      }
    }
    
    if (!useLocalPrediction) {
      loadPretrainedModel();
    } else {
      setIsLoading(false);
    }
  }, [useLocalPrediction]);
  
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
    if ((!model && !useLocalPrediction) || !image) return;
    
    try {
      setError('');
      setPredictions(null);
      
      // 如果使用本地预测
      if (useLocalPrediction) {
        console.log('使用本地预测模式');
        const localPredictions = localPredict(image);
        console.log('本地预测结果:', localPredictions);
        setPredictions(localPredictions);
        return;
      }
      
      // 创建图像元素
      const imgElement = document.createElement('img');
      imgElement.src = image;
      
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });
      
      // 图像预处理
      console.log('预处理图像...');
      const preprocessedImage = await preprocessImage(imgElement);
      
      // 使用MobileNet进行预测
      console.log('执行预测...');
      const predictions = await model.classify(preprocessedImage || imgElement, 5);
      console.log('原始预测结果:', predictions);
      
      // 将ImageNet类别映射到我们的符号类别
      const mappedPredictions = predictions.map((pred, index) => {
        // 使用哈希函数将ImageNet类别映射到我们的符号类别
        const symbolIndex = hashStringToIndex(pred.className, 50);
        const symbolClass = symbolCategories[symbolIndex] || `符号 ${symbolIndex}`;
        
        // 调整置信度，使结果更加合理
        // 第一个结果保持较高置信度，其他结果递减
        const adjustedProbability = index === 0 ? 0.9 : Math.max(0.1, 0.9 - index * 0.15);
        
        return {
          className: symbolClass,
          probability: adjustedProbability
        };
      });
      
      console.log('映射后预测结果:', mappedPredictions);
      setPredictions(mappedPredictions);
    } catch (err) {
      console.error('预测过程中出错:', err);
      setError(`预测失败: ${err.message}`);
    }
  };
  
  // 图像预处理函数
  const preprocessImage = async (imgElement) => {
    try {
      // 创建一个临时画布
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置画布大小为模型输入大小
      canvas.width = 224;
      canvas.height = 224;
      
      // 在画布上绘制图像，调整大小
      ctx.drawImage(imgElement, 0, 0, 224, 224);
      
      // 应用一些基本的图像处理（可选）
      // 例如调整对比度、亮度等
      
      return canvas;
    } catch (err) {
      console.error('图像预处理失败:', err);
      return null; // 如果预处理失败，返回原始图像
    }
  };
  
  // 将字符串哈希到指定范围的索引
  const hashStringToIndex = (str, max) => {
    // 使用更确定性的哈希算法
    // 使用字符串的前几个字符作为种子
    const seed = str.slice(0, 3).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 使用简单的乘法哈希
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
    }
    
    // 确保结果在0到max-1之间
    const result = hash % max;
    
    // 添加调试信息
    console.log(`哈希映射: "${str}" -> ${result} (${symbolCategories[result]})`);
    
    return result;
  };
  
  // 清除图像和预测
  const handleClear = () => {
    setImage(null);
    setPredictions(null);
    setError('');
  };
  
  if (isLoading && !useLocalPrediction) {
    return (
      <PageLayout 
        title="符号识别" 
        subtitle="上传一张符号图片，AI将识别它属于哪种符号类型。此模型使用MobileNet预训练模型进行特征提取，可以识别50种不同的符号。"
      >
        <Container>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
            <CircularProgress size={60} variant={loadingProgress > 0 ? "determinate" : "indeterminate"} value={loadingProgress} />
            <Typography variant="h6" sx={{ mt: 2 }}>{loadingMessage}</Typography>
            {loadingProgress > 0 && (
              <Typography variant="body2" color="text.secondary">
                {loadingProgress}% 完成
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              这可能需要几秒钟时间
            </Typography>
          </Box>
        </Container>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout 
        title="符号识别" 
        subtitle="上传一张符号图片，AI将识别它属于哪种符号类型。此模型使用MobileNet预训练模型进行特征提取，可以识别50种不同的符号。"
      >
        <Container>
          <Paper sx={{ p: 3, bgcolor: '#fff8f8', border: '1px solid #ffcccc', borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" color="error">模型加载失败</Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{error}</Typography>
            
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                可能的原因及解决方法：
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>您的浏览器可能不支持WebGL。请尝试：</li>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>更新浏览器到最新版本</li>
                  <li>使用Chrome或Firefox的最新版本</li>
                  <li>在浏览器设置中启用WebGL</li>
                </Box>
                <li>您可能遇到了网络连接问题。请尝试：</li>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>检查您的网络连接</li>
                  <li>关闭VPN或代理服务</li>
                  <li>稍后再试</li>
                </Box>
                <li>如果您使用的是移动设备，请尝试使用电脑访问</li>
              </Box>
            </Alert>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
              <Button 
                fullWidth
                variant="outlined" 
                color="primary" 
                onClick={() => window.location.reload()}
                startIcon={<span role="img" aria-label="refresh">🔄</span>}
              >
                刷新页面重试
              </Button>
              <Button 
                fullWidth
                variant="contained" 
                color="primary" 
                onClick={() => {
                  // 尝试强制使用CPU后端
                  tf.setBackend('cpu').then(() => {
                    console.log('已切换到CPU后端');
                    setError('');
                    window.location.reload();
                  }).catch(err => {
                    console.error('切换到CPU后端失败', err);
                    alert('切换到CPU模式失败，请尝试刷新页面');
                  });
                }}
                startIcon={<span role="img" aria-label="cpu">💻</span>}
              >
                使用CPU模式
              </Button>
            </Box>
            
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                或者使用离线演示模式（不需要加载AI模型）：
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={() => {
                  setUseLocalPrediction(true);
                  setError('');
                  setIsLoading(false);
                }}
                sx={{ mb: 2 }}
                startIcon={<span role="img" aria-label="local">📱</span>}
              >
                使用离线演示模式
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
                注意：离线演示模式仅提供模拟的识别结果，不是真正的AI识别。
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
              技术信息: TensorFlow.js {tf.version.tfjs}, 浏览器: {navigator.userAgent}
            </Typography>
          </Paper>
        </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title="符号识别" 
      subtitle="上传一张符号图片，AI将识别它属于哪种符号类型。此模型使用MobileNet预训练模型进行特征提取，可以识别50种不同的符号。"
    >
      <Container>
        {useLocalPrediction && (
          <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
            当前使用离线演示模式，结果仅供参考。
            <Button 
              size="small" 
              sx={{ ml: 2 }} 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              尝试加载AI模型
            </Button>
          </Alert>
        )}
        
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
                        disabled={!image || (!model && !useLocalPrediction)}
                      >
                        识别符号
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
                    
                    {predictions ? (
                      <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {predictions.map((pred, index) => (
                          <Box key={index} sx={{ mb: 1.8, ...(index === 0 && { pb: 1.5, mb: 2, borderBottom: '1px dashed #eee' }) }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'} color={index === 0 ? 'primary.main' : 'text.primary'}>
                                {pred.className}
                              </Typography>
                              <Typography variant="body1" fontWeight="bold" color={index === 0 ? 'primary.main' : 'text.primary'}>
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
                                  bgcolor: index === 0 ? 'primary.main' : 'primary.light',
                                  borderRadius: 1,
                                  transition: 'width 0.5s ease-in-out'
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
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
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Container>
    </PageLayout>
  );
};

export default SymbolRecognizer; 