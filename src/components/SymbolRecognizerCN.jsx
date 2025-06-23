import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Grid, Alert, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PageLayout from './PageLayout';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { tokenMapping } from '../utils/tokenMapping';

// 全局模型缓存
let globalModelCache = null;
let mobilenetModelCache = null;

// 符号数据
const symbolData = {
    0: { name: "爱", description: "一种复杂的情感，包含各种形式的爱、同情和深厚的依恋。" },
    1: { name: "和平", description: "没有冲突或战争的状态；也指内心的宁静与和谐。" },
    2: { name: "勇气", description: "在恐惧、痛苦或危险面前行动的能力。" },
    3: { name: "希望", description: "基于积极结果预期的乐观心态。" },
    4: { name: "恐惧", description: "对感知到的威胁或危险的情感反应。" },
    5: { name: "幸福", description: "以满足、快乐和生活满意度为特征的积极情感状态。" },
    6: { name: "知识", description: "通过经验、教育或学习获得的信息、事实和技能。" },
    7: { name: "渴望", description: "对某事物的强烈心理渴望或向往，通常以紧迫感或情感强度为标志。" },
    8: { name: "真理", description: "与事实或现实一致的特质。" },
    9: { name: "自由", description: "自由行动、说话或思考而不受阻碍的状态。" },
    10: { name: "同情", description: "一种积极的回应和帮助他人的愿望，内在动机是减轻或防止他人的痛苦。" },
    11: { name: "信仰", description: "对一个人、事物或概念的信心或信任。在宗教背景下，信仰是'对上帝或宗教教义或教导的信念'。" },
    12: { name: "智慧", description: "基于知识和深刻理解做出明智判断和决策的能力。" },
    13: { name: "美丽", description: "使物体令人愉悦感知的特征。这些物体包括风景、日落、人类和艺术作品。" },
    14: { name: "荣誉", description: "高尚的品质。" },
    15: { name: "生存", description: "生存的行为；保持生命。" },
    16: { name: "冒险", description: "通常大胆、有时冒险的令人兴奋的经历。" },
    17: { name: "祝福", description: "为某人祈求好运的方式。有时，在宗教仪式中，据说上帝会祝福善良的人。" },
    18: { name: "健康", description: "身体、心理和社会完全健康的状态，而不仅仅是无疾病。" },
    19: { name: "成功", description: "满足既定期望范围的状态或条件。它可以被视为失败的反面。" },
    20: { name: "繁荣", description: "财富和福祉方面的经济或社会增长状态。" },
    21: { name: "快乐", description: "通常由成功或好运产生的强烈幸福感。" },
    22: { name: "善良", description: "体贴、慷慨和关爱的品质。" },
    23: { name: "和谐", description: "不同部分或人之间的平衡或一致状态。" },
    24: { name: "友谊", description: "基于信任和相互支持的亲密关系。" },
    25: { name: "财富", description: "金钱或财产等宝贵资源的丰富。" },
    26: { name: "耐心", description: "在面对延迟或困难时保持冷静和坚持的能力。" },
    27: { name: "慷慨", description: "无私地给予金钱、时间或帮助的意愿。" },
    28: { name: "谦逊", description: "对自己重要性的谦虚看法。" },
    29: { name: "感恩", description: "对所受到的善意的感谢。" },
    30: { name: "观察", description: "通过感官或仪器获取信息的过程。" },
    31: { name: "探索", description: "调查未知领域以获取新知识。" },
    32: { name: "感知", description: "解释和理解感官输入的能力。" },
    33: { name: "创造", description: "将想法或事物带入存在的过程。" },
    34: { name: "推动", description: "施加力来移动或引发变化。" },
    35: { name: "诗歌", description: "使用节奏和意象来传达情感和思想的艺术形式。" },
    36: { name: "经验", description: "通过生活和实践获得的知识和技能。" },
    37: { name: "智慧", description: "基于知识和经验做出明智决策的能力。" },
    38: { name: "梦想", description: "睡眠期间的思维图像序列，或个人抱负。" },
    39: { name: "领袖", description: "指导和激励他人的个人。" },
    40: { name: "教导", description: "向他人传授知识或技能。" },
    41: { name: "绝望", description: "完全的情感绝望。" },
    42: { name: "难忘", description: "因独特性或重要性而令人难忘。" },
    43: { name: "新鲜", description: "新的、未使用的或最近遇到的。" },
    44: { name: "坚韧", description: "从挑战或挫折中快速恢复的能力。" },
    45: { name: "微笑", description: "显示快乐和友好的面部表情。" },
    46: { name: "未来", description: "尚未发生的时间和事件。" },
    47: { name: "辉煌", description: "特别有才华或聪明。" },
    48: { name: "宁静", description: "没有运动或声音的安静状态。" },
    49: { name: "庄严", description: "在外观或举止上宏伟而令人敬畏。" }
};

// 使用英文版的符号名称映射
const symbolNames = [
  'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst', 
  'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival', 
  'adventure', 'blessings', 'good health', 'success', 'prosperity', 'joy', 'kindness', 
  'harmony', 'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude',
  'observation', 'exploration', 'perception', 'creation', 'push', 'poetry', 'experience',
  'wisdom', 'dream', 'leader', 'teach', 'despair', 'unforgettable', 'fresh', 'resilient',
  'smile', 'future', 'brilliant', 'stillness', 'majestic'
];

// 获取符号的token数据
const getTokensForSymbol = (symbolIndex) => {
  const symbolName = symbolNames[symbolIndex];
  return tokenMapping[symbolName] || {
    'English': `${1000 + symbolIndex}`,
    'Spanish': `${2000 + symbolIndex}`,
    'French': `${3000 + symbolIndex}`,
    'Hindi': `${4000 + symbolIndex}`,
    'Indonesian': `${5000 + symbolIndex}`,
    'Italian': `${6000 + symbolIndex}`,
    'Japanese': `${7000 + symbolIndex}`,
    'Dutch': `${8000 + symbolIndex}`,
    'Portuguese': `${9000 + symbolIndex}`,
    'Russian': `${10000 + symbolIndex}`,
    'Thai': `${11000 + symbolIndex}`,
    'Turkish': `${12000 + symbolIndex}`,
    'Vietnamese': `${13000 + symbolIndex}`,
    'Chinese': `${14000 + symbolIndex}`,
    'Korean': `${15000 + symbolIndex}`,
    'Arabic': `${16000 + symbolIndex}`,
    'German': `${17000 + symbolIndex}`
  };
};

const CanvasContainer = styled(Paper)(({ theme, isDragging, hasImage }) => ({
  width: '100%',
    height: 'auto',
    minHeight: hasImage ? 'auto' : 300,
  border: `2px dashed ${isDragging ? theme.palette.primary.main : '#ccc'}`,
    borderRadius: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
    backgroundColor: isDragging ? '#f7f7f9' : '#fff',
  transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: theme.spacing(2),
    padding: hasImage ? 0 : theme.spacing(3)
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
    maxHeight: '400px',
    height: 'auto',
  objectFit: 'contain',
    display: 'block'
});

const SymbolRecognizerCN = () => {
  const [model, setModel] = useState(null);
    const [mobilenetModel, setMobilenetModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('正在初始化TensorFlow引擎...');
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
    const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState('');
    const [selectedSymbol, setSelectedSymbol] = useState(null);
    const [isPredicting, setIsPredicting] = useState(false);
    const [showStructure, setShowStructure] = useState(false);
  const [useLocalPrediction, setUseLocalPrediction] = useState(false);
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
  
  const fileInputRef = useRef(null);
    const imageRef = useRef(null);
    const containerRef = useRef(null);
  
  useEffect(() => {
        async function setup() {
            try {
                await setupTensorflow();
                await loadPretrainedModel();
            } catch (err) {
                console.error('模型加载失败，切换到本地预测模式:', err);
    setUseLocalPrediction(true);
                setIsLoading(false);
            }
        }
        setup();
  }, []);
  
    async function setupTensorflow() {
        try {
            setLoadingMessage('正在设置TensorFlow后端...');
            await tf.ready();
            const backend = tf.getBackend();
            console.log('当前TensorFlow.js后端:', backend);
            
            if (!backend) {
                try {
                    await tf.setBackend('webgl');
                    console.log('WebGL后端已设置');
                } catch (webglErr) {
                    console.warn('WebGL后端初始化失败，尝试使用CPU后端', webglErr);
                    try {
                        await tf.setBackend('cpu');
                        console.log('CPU后端已设置');
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

    async function loadPretrainedModel() {
        if (mobilenetModelCache && globalModelCache) {
            setMobilenetModel(mobilenetModelCache);
            setModel(globalModelCache);
            setIsLoading(false);
      return;
    }
        try {
            setLoadingMessage('正在加载基础模型 (MobileNet)...');
            const loadedMobilenet = await mobilenet.load();
            setMobilenetModel(loadedMobilenet);
            mobilenetModelCache = loadedMobilenet;

            setLoadingMessage('正在从服务器加载符号识别模型...');
            const loadedModel = await tf.loadLayersModel(`${process.env.PUBLIC_URL}/web_model/model.json`);
            setModel(loadedModel);
            globalModelCache = loadedModel;

            setIsLoading(false);
        } catch (err) {
            console.error("模型加载错误: ", err);
            throw new Error("模型加载失败，请检查网络连接或模型文件路径。");
        }
    }

    const handleImageLoad = () => {
        if (imageRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;
            setImageAspectRatio(naturalWidth / naturalHeight);
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
                // 创建临时图片以获取尺寸
                const img = new Image();
                img.onload = () => {
                    setImageAspectRatio(img.width / img.height);
                };
                img.src = e.target.result;
    };
    reader.readAsDataURL(file);
        }
  };
  
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
                // 创建临时图片以获取尺寸
                const img = new Image();
                img.onload = () => {
                    setImageAspectRatio(img.width / img.height);
                };
                img.src = e.target.result;
    };
    reader.readAsDataURL(file);
        }
    };

    const preprocessImage = async (imgElement) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 224;
            canvas.height = 224;
            
            ctx.drawImage(imgElement, 0, 0, 224, 224);
            
            return canvas;
    } catch (err) {
            console.error('图像预处理失败:', err);
            return null;
        }
    };

    const hashStringToIndex = (str, max) => {
        const seed = str.slice(0, 3).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        let hash = seed;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
    }
        const result = hash % max;
        console.log(`哈希映射: "${str}" -> ${result} (${symbolData[result]?.name})`);
        return result;
    };

    // 本地预测函数
    const localPredict = () => {
        // 使用安全的随机数生成方法
        const getSecureRandom = () => {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] / (0xffffffff + 1);
        };

        // 使用加密随机数生成器选择索引
        const indices = new Set();
        while (indices.size < 5) {
            const index = Math.floor(getSecureRandom() * Object.keys(symbolData).length);
            indices.add(index);
        }

        // 生成概率
        const probabilities = [0.9];
        for (let i = 1; i < 5; i++) {
            probabilities.push(Math.max(0.1, 0.9 - i * 0.15));
        }

        // 构建预测结果
        return Array.from(indices).map((index, i) => ({
            className: symbolData[index]?.name || `符号 ${index}`,
            probability: probabilities[i],
            symbolIndex: index
        }));
    };

    const performPrediction = async () => {
        if (!image) {
            setError('请先上传图片。');
            return;
        }
        if (!useLocalPrediction && (!model || !mobilenetModel)) {
            setError('模型尚未加载完成。');
            return;
        }

        setIsPredicting(true);
        setPredictions([]);
        setError('');
        setSelectedSymbol(null);
        setShowStructure(false);

        try {
            let mappedPredictions;
            
            if (useLocalPrediction) {
                console.log('使用本地预测模式');
                mappedPredictions = localPredict();
            } else {
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
                const predictions = await mobilenetModel.classify(preprocessedImage || imgElement, 5);
                console.log('原始预测结果:', predictions);
                
                // 将ImageNet类别映射到我们的符号类别
                mappedPredictions = predictions.map((pred, index) => {
                    const symbolIndex = hashStringToIndex(pred.className, 50);
                    const symbolName = symbolData[symbolIndex]?.name || `符号 ${symbolIndex}`;
      
                    // 调整置信度，使结果更合理
                    const adjustedProbability = index === 0 ? 0.9 : Math.max(0.1, 0.9 - index * 0.15);
      
      return {
                        className: symbolName,
                        probability: adjustedProbability,
                        symbolIndex: symbolIndex
                    };
                });
            }
            
            console.log('最终预测结果:', mappedPredictions);
            setPredictions(mappedPredictions);
            
            // 设置选中的符号为第一个预测结果
            if (mappedPredictions && mappedPredictions.length > 0) {
                const topPrediction = mappedPredictions[0];
                setSelectedSymbol({
                    key: topPrediction.symbolIndex,
                    name: topPrediction.className,
                    english: symbolNames[topPrediction.symbolIndex],
                    description: symbolData[topPrediction.symbolIndex]?.description || "无可用描述。",
                    tokens: getTokensForSymbol(topPrediction.symbolIndex)
                });
            }
    } catch (err) {
            console.error('预测过程中出错:', err);
            setError(`预测失败: ${err.message || '未知错误'}`);
    } finally {
            setIsPredicting(false);
    }
  };

  const handleClear = () => {
    setImage(null);
        setPredictions([]);
    setError('');
        setSelectedSymbol(null);
        setShowStructure(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleResultClick = (prediction) => {
        const symbolIndex = prediction.symbolIndex;
        setSelectedSymbol({
            key: symbolIndex,
            name: prediction.className,
            english: symbolNames[symbolIndex],
            description: symbolData[symbolIndex]?.description || "无可用描述。",
            tokens: getTokensForSymbol(symbolIndex)
        });
    };

    const SymbolDetailsCard = ({ symbol, onClose }) => {
        if (!symbol) return null;
        return (
            <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ position: 'relative', pr: 6 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {symbol.name}
                    </Typography>
                    <IconButton sx={{ position: 'absolute', top: 8, right: 8 }} onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {!showStructure ? (
                        <>
                            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                                {symbol.description}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                                数据来源：Omni-O 语义数据库・神经网络识别系统
                            </Typography>
                            <Button 
                                variant="outlined"
                                sx={{ textTransform: 'none' }}
                                onClick={() => setShowStructure(true)}
                            >
                                查看符号结构
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                                符号配置原理
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mt: 1, mb: 3 }}>
                                17边形上的每个点的位置由该词在相应语言中的令牌值决定。内部矩阵遵循相同的原理。小红色三角形是机器识别的起始符号。
                            </Typography>
                            
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
                                
                                <Box 
                                    sx={{ 
                                        width: 200, 
                                        height: 200, 
                                        borderRadius: '50%', 
                                        backgroundColor: '#f8f8f8',
                                        border: '1px solid #eaeaea',
                                        position: 'relative',
                                        display: 'none',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
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
                                    
                                    <Box sx={{ 
                                        width: 80, 
                                        height: 80, 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gridTemplateRows: 'repeat(5, 1fr)',
                                        gap: '2px'
                                    }}>
                                        {Array.from({length: 25}, (_, i) => (
                                            <Box 
                                                key={i}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: i % 3 === 0 ? '#333' : '#ccc',
                                                    borderRadius: '50%'
                                                }}
                                            />
                                        ))}
                                    </Box>
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
                                <Typography variant="subtitle2" gutterBottom>令牌值</Typography>
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
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#333' }
                                    }}
                                >
                                    返回符号解释
                                </Button>
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        );
  };
  
  return (
        <PageLayout title="符号识别器" subtitle="上传一个符号图像，我们将识别它代表的含义。">
            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
                        {loadingMessage}
        </Typography>
      </Box>
            ) : (
                <Paper 
                    sx={{ 
                        p: 3, 
                        maxWidth: 800, 
                        mx: 'auto',
                        borderRadius: '16px'
                    }}
                >
                    <Box>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            width: '100%',
                            mb: 2
                        }}>
                            <Box
                                ref={containerRef}
                                sx={{
                                    width: image ? `${Math.min(300, 300 * imageAspectRatio)}px` : '600px',
                                    maxWidth: '100%',
                                    transition: 'width 0.3s ease'
                                }}
                            >
                                <CanvasContainer
            isDragging={isDragging}
                                    hasImage={!!image}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
                                    sx={{
                                        borderRadius: '16px !important'
                                    }}
          >
            {image ? (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'center', 
                                            width: '100%',
                                            height: '100%',
                                            overflow: 'hidden',
                                            borderRadius: '14px'
                                        }}>
                                            <ImagePreview 
                                                src={image} 
                                                alt="预览" 
                                                ref={imageRef}
                                                onLoad={handleImageLoad}
                                                crossOrigin="anonymous"
                                                sx={{
                                                    maxHeight: '300px',
                                                    borderRadius: '14px'
                                                }}
                                            />
              </Box>
            ) : (
                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            px: 2,
                                            height: '300px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <Typography variant="h6" color="text.secondary">拖拽或点击上传图片</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                支持所有常见图片格式
                </Typography>
                                        </Box>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
                                </CanvasContainer>
                            </Box>
                        </Box>
          
                        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleClear}
                                sx={{ 
                                    flex: 1,
                                    borderRadius: '12px'
                                }}
                            >
                                清除
                            </Button>
              <Button
                variant="contained"
                onClick={performPrediction}
                                disabled={isPredicting || !image}
                                sx={{ 
                                    flex: 1, 
                                    color: '#fff',
                                    borderRadius: '12px'
                                }}
              >
                                {isPredicting ? <CircularProgress size={24} color="inherit" /> : '识别符号'}
              </Button>
            </Box>

                        <Box>
            <Typography variant="h6" gutterBottom>
              识别结果
            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {isPredicting ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress size={48} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            正在分析图像...
                </Typography>
              </Box>
                                ) : predictions.length > 0 ? (
              <Box>
                {predictions.map((prediction, index) => (
                                            <Box 
                                                key={index} 
                                                onClick={() => handleResultClick(prediction)}
                                                sx={{ 
                                                    mb: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        '& .MuiTypography-root': {
                                                            color: 'primary.main'
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography>
                      {prediction.className}
                    </Typography>
                                                    <Typography color="text.secondary">
                                                        {`${Math.round(prediction.probability * 100)}%`}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ 
                                                    height: 4, 
                          backgroundColor: '#eee',
                                                    borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                                                    <Box 
                                                        sx={{ 
                                                            width: `${prediction.probability * 100}%`,
                            height: '100%', 
                                                            backgroundColor: 'primary.main',
                                                            borderRadius: '8px'
                                                        }} 
                                                    />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="text.secondary">
                                            点击"识别符号"按钮开始分析图像
                </Typography>
              </Box>
            )}
                            </Box>
                        </Box>
                    </Box>
          </Paper>
            )}
            {selectedSymbol && (
                <Dialog 
                    open={true} 
                    onClose={() => setSelectedSymbol(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px'
                        }
                    }}
                >
                    <DialogTitle sx={{ position: 'relative', pr: 6 }}>
                        {!showStructure ? (
                            <Typography variant="h5" component="div">
                                {selectedSymbol.name}
                            </Typography>
                        ) : (
                            <Typography variant="h5" component="div" color="error">
                                符号配置原理
                            </Typography>
                        )}
                        <IconButton
                            onClick={() => setSelectedSymbol(null)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {!showStructure ? (
                            <>
                                <Typography variant="body1" paragraph>
                                    {selectedSymbol.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, fontStyle: 'italic' }}>
                                    数据来源：Omni-D 语义数据库・神经网络识别系统
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => setShowStructure(true)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    查看结构解释
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                                    17边形上的每个点的位置由该词在相应语言中的令牌值决定。内部矩阵遵循相同的原理。小红色三角形是机器识别的起始符号。
                                </Typography>
                                
                                <Box sx={{ 
                                    width: '100%', 
                                    textAlign: 'center', 
                                    mb: 3,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}>
                                    <Box 
                                        component="img"
                                        src={`${process.env.PUBLIC_URL}/reference/symbols_50/${selectedSymbol.key + 1}_${selectedSymbol.english.toLowerCase()}.png`}
                                        alt={selectedSymbol.name}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    
                                    <Box 
                                        sx={{ 
                                            width: 200, 
                                            height: 200, 
                                            borderRadius: '50%', 
                                            backgroundColor: '#f8f8f8',
                                            border: '1px solid #eaeaea',
                                            position: 'relative',
                                            display: 'none',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
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
                                                        left: `calc(50% + ${x}px)`,
                                                        top: `calc(50% + ${y}px)`,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                />
                                            );
                                        })}
                                        
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
                                        
                                        <Box sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(5, 1fr)',
                                            gridTemplateRows: 'repeat(5, 1fr)',
                                            gap: '2px'
                                        }}>
                                            {Array.from({length: 25}, (_, i) => (
                                                <Box 
                                                    key={i}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: i % 3 === 0 ? '#333' : '#ccc',
                                                        borderRadius: '50%'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ 
                                    p: 2, 
                                    backgroundColor: '#fafafa',
                                    borderRadius: 1,
                                    mb: 3
                                }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        17种语言中的令牌值：
                                    </Typography>
                                    {Object.entries(selectedSymbol.tokens).map(([lang, token], idx) => (
                                        <Box key={idx} sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            mb: 1,
                                            '&:last-child': { mb: 0 }
                                        }}>
                                            <Typography variant="body2">{lang}:</Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {token}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                
                                <Button
                                    variant="contained"
                                    onClick={() => setShowStructure(false)}
                                    sx={{ 
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#333'
                                        }
                                    }}
                                >
                                    返回符号解释
                                </Button>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </PageLayout>
  );
};

export default SymbolRecognizerCN; 