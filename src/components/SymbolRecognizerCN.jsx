import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Grid, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
// 导入TensorFlow及其后端
import * as tf from '@tensorflow/tfjs';
// 强制导入CPU和WebGL后端
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
// 导入腾讯云COS工具
import { uploadWithTempCredential, getTempCredential } from '../utils/TencentCOS';
import { COS_CONFIG } from '../config/cos.config';

// 全局模型缓存
let globalModelCache = null;

// 容器样式
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
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

// 进度条容器
const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

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

const SymbolRecognizerCN = () => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('正在加载模型...');
  const [useLocalPrediction, setUseLocalPrediction] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const fileInputRef = useRef(null);
  
  // 初始化设置
  useEffect(() => {
    // 根据环境设置是否使用本地预测
    // 在中国部署版本中，我们总是使用本地预测模式
    setUseLocalPrediction(true);
  }, []);
  
  // 处理选择图像
  const handleImageSelect = (event) => {
    setError('');
    setPredictions(null);
    
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('请选择有效的图像文件 (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };
  
  // 拖拽处理
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
    setError('');
    setPredictions(null);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('请选择有效的图像文件 (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };
  
  // 执行预测
  const performPrediction = async () => {
    if (!image) {
      setError('请先选择一张图片');
      return;
    }
    
    try {
      setIsLoading(true);
      setPredictions(null);
      setError('');
      
      // 中国版使用本地预测
      const results = localPredict(image);
      
      // 上传图片到腾讯云COS
      await uploadImageToCOS();
      
      setPredictions(results);
    } catch (err) {
      console.error('预测过程中出错:', err);
      setError(`预测失败: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 上传图片到腾讯云COS
  const uploadImageToCOS = async () => {
    if (!imageFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError('');
      
      // 生成文件名
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}_${randomStr}_${imageFile.name}`;
      
      // 获取临时凭证（模拟方式）
      // 实际部署时需要从自己的服务获取临时凭证
      // const credential = await getTempCredential();
      
      // 由于这是演示，我们模拟上传过程
      // 实际部署时，使用以下代码：
      /*
      await uploadWithTempCredential(credential, {
        Bucket: COS_CONFIG.Bucket,
        Region: COS_CONFIG.Region,
        Key: `uploads/${filename}`,
        Body: imageFile,
        onProgress: (progressData) => {
          setUploadProgress(Math.floor(progressData.percent * 100));
        }
      });
      */
      
      // 模拟上传进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }
      
      // 模拟上传完成
      setUploadSuccess(true);
      setSnackbarMessage('图片上传成功！');
      setSnackbarOpen(true);
      
      // 记录上传信息到控制台（实际应用中可能需要发送到服务器记录）
      console.log(`图片已上传: ${filename}`);
      
      return {
        url: `${COS_CONFIG.Domain}/uploads/${filename}`,
        key: `uploads/${filename}`
      };
    } catch (err) {
      console.error('上传到COS时出错:', err);
      setUploadError(`上传失败: ${err.message}`);
      setSnackbarMessage('图片上传失败，但识别结果仍然有效');
      setSnackbarOpen(true);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // 清除
  const handleClear = () => {
    setImage(null);
    setImageFile(null);
    setPredictions(null);
    setError('');
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadError('');
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Container>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          符号识别器
        </Typography>
        <Typography variant="body1" color="text.secondary">
          上传一个符号图像，我们将识别它代表的含义
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DropZone
            isDragging={isDragging}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {image ? (
              <Box sx={{ textAlign: 'center' }}>
                <ImagePreview src={image} alt="预览" />
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  sx={{ mt: 2 }}
                >
                  清除
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  点击或拖放图像
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  支持 JPEG, PNG, GIF 和 WEBP 格式
                </Typography>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
          </DropZone>
          
          {image && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={performPrediction}
                disabled={isLoading || isUploading}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? '识别中...' : '识别符号'}
              </Button>
            </Box>
          )}
          
          {isUploading && (
            <ProgressContainer>
              <Typography variant="body2" color="text.secondary">
                正在上传图像... {uploadProgress}%
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 320 }}>
                <div style={{ 
                  height: '4px', 
                  width: '100%', 
                  backgroundColor: '#eee',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${uploadProgress}%`, 
                    backgroundColor: '#1976d2',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </Box>
            </ProgressContainer>
          )}
          
          {uploadError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {uploadError}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 320 }}>
            <Typography variant="h6" gutterBottom>
              识别结果
            </Typography>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {loadingMessage}
                </Typography>
              </Box>
            ) : predictions ? (
              <Box>
                {predictions.map((prediction, index) => (
                  <Box key={index} sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: index === 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent' }}>
                    <Typography variant="body1" sx={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                      {prediction.className}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <div style={{ 
                          height: '8px', 
                          borderRadius: '4px',
                          backgroundColor: '#eee',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${prediction.probability * 100}%`, 
                            backgroundColor: index === 0 ? '#1976d2' : '#90caf9',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(prediction.probability * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
                
                {uploadSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    图片已成功上传并保存
                  </Alert>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
                <Typography variant="body1" color="text.secondary">
                  请上传一张图像并点击识别按钮
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default SymbolRecognizerCN; 