import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Dialog, DialogContent, DialogTitle, Grid, Card, CardMedia, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PageLayout from '../PageLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';
// 导入真实的token映射数据
import { tokenMapping } from '../../utils/tokenMapping';

// 复用SymbolRecognizer中的符号数据
const symbolDescriptions = {
  0: { 
    description: "A complex emotion encompassing affection, compassion, and deep attachment in various forms.",
    descriptionZh: "一种复杂的情感，包含各种形式的爱、同情和深厚的依恋。"
  },
  1: { 
    description: "A state without conflict or war; also denotes inner tranquility and harmony.",
    descriptionZh: "没有冲突或战争的状态；也指内心的宁静与和谐。"
  },
  2: { 
    description: "The ability to act in the face of fear, pain, or danger.",
    descriptionZh: "在恐惧、痛苦或危险面前行动的能力。"
  },
  3: { 
    description: "An optimistic state of mind based on the expectation of positive outcomes.",
    descriptionZh: "基于积极结果预期的乐观心态。"
  },
  4: { 
    description: "An emotional response to perceived threats or danger.",
    descriptionZh: "对感知到的威胁或危险的情感反应。"
  },
  5: { 
    description: "A positive emotional state characterized by contentment, joy, and life satisfaction.",
    descriptionZh: "以满足、快乐和生活满意度为特征的积极情感状态。"
  },
  6: { 
    description: "Information, facts, and skills acquired through experience, education, or learning.",
    descriptionZh: "通过经验、教育或学习获得的信息、事实和技能。"
  },
  7: { 
    description: "A strong psychological craving or longing for something, often marked by urgency or emotional intensity.",
    descriptionZh: "对某事物的强烈心理渴望或向往，通常以紧迫感或情感强度为标志。"
  },
  8: { 
    description: "The quality of being in accord with fact or reality.",
    descriptionZh: "与事实或现实一致的特质。"
  },
  9: { 
    description: "The state of being free to act, speak, or think without hindrance.",
    descriptionZh: "自由行动、说话或思考而不受阻碍的状态。"
  },
  10: { 
    description: "A positive response and desire to help with an inner motivation to lessen or prevent suffering of others.",
    descriptionZh: "一种积极的回应和帮助他人的愿望，内在动机是减轻或防止他人的痛苦。"
  },
  11: { 
    description: "Confidence or trust in a person, thing, or concept. In the context of religion, faith is 'belief in God or in the doctrines or teachings of religion'.",
    descriptionZh: "对一个人、事物或概念的信心或信任。在宗教背景下，信仰是'对上帝或宗教教义或教导的信念'。"
  },
  12: { 
    description: "The ability to make sound judgments and decisions based on knowledge and deep understanding.",
    descriptionZh: "基于知识和深刻理解做出明智判断和决策的能力。"
  },
  13: { 
    description: "A feature of objects that makes them pleasurable to perceive. Such objects include landscapes, sunsets, humans, and works of art.",
    descriptionZh: "使物体令人愉悦感知的特征。这些物体包括风景、日落、人类和艺术作品。"
  },
  14: { 
    description: "The quality of being honorable.",
    descriptionZh: "高尚的品质。"
  },
  15: { 
    description: "The act of surviving; to stay living.",
    descriptionZh: "生存的行为；保持生命。"
  },
  16: { 
    description: "An exciting experience that is typically bold, sometimes risky, undertaking.",
    descriptionZh: "通常大胆、有时冒险的令人兴奋的经历。"
  },
  17: { 
    description: "A way to wish good luck for a person. Sometimes, in religious rituals, it is said that God blesses those who are good.",
    descriptionZh: "为某人祈求好运的方式。有时，在宗教仪式中，据说上帝会祝福善良的人。"
  },
  18: { 
    description: "A state of complete physical, mental, and social well-being, and not merely the absence of disease.",
    descriptionZh: "身体、心理和社会完全健康的状态，而不仅仅是无疾病。"
  },
  19: { 
    description: "The state or condition of meeting a defined range of expectations. It may be viewed as the opposite of failure.",
    descriptionZh: "满足既定期望范围的状态或条件。它可以被视为失败的反面。"
  },
  20: { 
    description: "A state of economic or social growth in wealth and well-being.",
    descriptionZh: "财富和福祉方面的经济或社会增长状态。"
  },
  21: { 
    description: "A strong feeling of happiness often resulting from success or good fortune.",
    descriptionZh: "通常由成功或好运产生的强烈幸福感。"
  },
  22: { 
    description: "The quality of being considerate, generous, and caring.",
    descriptionZh: "体贴、慷慨和关爱的品质。"
  },
  23: { 
    description: "A state of balance or agreement among different parts or people.",
    descriptionZh: "不同部分或人之间的平衡或一致状态。"
  },
  24: { 
    description: "A close relationship based on trust and mutual support.",
    descriptionZh: "基于信任和相互支持的亲密关系。"
  },
  25: { 
    description: "The abundance of valuable resources like money or property.",
    descriptionZh: "金钱或财产等宝贵资源的丰富。"
  },
  26: { 
    description: "The ability to remain calm and persistent in the face of delay or difficulty.",
    descriptionZh: "在面对延迟或困难时保持冷静和坚持的能力。"
  },
  27: { 
    description: "Willingness to give money, time, or help selflessly.",
    descriptionZh: "无私地给予金钱、时间或帮助的意愿。"
  },
  28: { 
    description: "A modest view of one's importance.",
    descriptionZh: "对自己重要性的谦虚看法。"
  },
  29: { 
    description: "Thankfulness for kindness received.",
    descriptionZh: "对所受到的善意的感谢。"
  },
  30: { 
    description: "The process of gaining information through senses or instruments.",
    descriptionZh: "通过感官或仪器获取信息的过程。"
  },
  31: { 
    description: "Investigating unknown areas to acquire new knowledge.",
    descriptionZh: "调查未知领域以获取新知识。"
  },
  32: { 
    description: "The ability to interpret and make sense of sensory input.",
    descriptionZh: "解释和理解感官输入的能力。"
  },
  33: { 
    description: "The process of bringing ideas or things into existence.",
    descriptionZh: "将想法或事物带入存在的过程。"
  },
  34: { 
    description: "Applying force to move or initiate change.",
    descriptionZh: "施加力来移动或引发变化。"
  },
  35: { 
    description: "An art form using rhythm and imagery to convey emotion and thought.",
    descriptionZh: "使用节奏和意象来传达情感和思想的艺术形式。"
  },
  36: { 
    description: "Knowledge and skills gained through life and practice.",
    descriptionZh: "通过生活和实践获得的知识和技能。"
  },
  37: { 
    description: "The ability to make wise decisions based on knowledge and experience.",
    descriptionZh: "基于知识和经验做出明智决策的能力。"
  },
  38: { 
    description: "A sequence of mental images during sleep, or a personal aspiration.",
    descriptionZh: "睡眠期间的思维图像序列，或个人抱负。"
  },
  39: { 
    description: "An individual who guides and inspires others.",
    descriptionZh: "指导和激励他人的个人。"
  },
  40: { 
    description: "To impart knowledge or skills to others.",
    descriptionZh: "向他人传授知识或技能。"
  },
  41: { 
    description: "A complete emotional loss of hope.",
    descriptionZh: "完全的情感绝望。"
  },
  42: { 
    description: "Memorable due to uniqueness or significance.",
    descriptionZh: "因独特性或重要性而令人难忘。"
  },
  43: { 
    description: "New, unused, or recently encountered.",
    descriptionZh: "新的、未使用的或最近遇到的。"
  },
  44: { 
    description: "The ability to recover quickly from challenges or setbacks.",
    descriptionZh: "从挑战或挫折中快速恢复的能力。"
  },
  45: { 
    description: "A facial expression that shows joy and friendliness.",
    descriptionZh: "显示快乐和友好的面部表情。"
  },
  46: { 
    description: "Time and events that are yet to happen.",
    descriptionZh: "尚未发生的时间和事件。"
  },
  47: { 
    description: "Exceptionally talented or intelligent.",
    descriptionZh: "特别有才华或聪明。"
  },
  48: { 
    description: "A quiet state with no motion or sound.",
    descriptionZh: "没有运动或声音的安静状态。"
  },
  49: { 
    description: "Grand and awe-inspiring in appearance or manner.",
    descriptionZh: "在外观或举止上宏伟而令人敬畏。"
  }
};

// 中文词汇映射
const chineseWords = [
  '爱', '和平', '勇气', '希望', '恐惧', '幸福', '知识', '渴望', 
  '真理', '自由', '同情', '信仰', '智慧', '美丽', '荣誉', '生存', 
  '冒险', '祝福', '健康', '成功', '繁荣', '快乐', '善良', '和谐',
  '友谊', '财富', '耐心', '慷慨', '谦逊', '感恩', '观察', '探索',
  '感知', '创造', '推动', '诗歌', '经验', '智慧', '梦想', '领袖',
  '教导', '绝望', '难忘', '新鲜', '坚韧', '微笑', '未来', '辉煌',
  '宁静', '庄严'
];

// 使用真实的token数据
const getTokensForSymbol = (symbolIndex) => {
  const symbolNames = [
    'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst', 
    'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival', 
    'adventure', 'blessings', 'good health', 'success', 'prosperity', 'joy', 'kindness', 
    'harmony', 'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude',
    'observation', 'exploration', 'perception', 'creation', 'push', 'poetry', 'experience',
    'wisdom', 'dream', 'leader', 'teach', 'despair', 'unforgettable', 'fresh', 'resilient',
    'smile', 'future', 'brilliant', 'stillness', 'majestic'
  ];

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

const Gallery = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showStructure, setShowStructure] = useState(false);
  const { language } = useLanguage();
  
  // 使用useMemo优化words数组，避免重复渲染
  const words = useMemo(() => [
    'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst',
    'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival',
    'adventure', 'blessings', 'good health', 'success', 'prosperity', 'joy', 'kindness', 'harmony',
    'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude', 'observation', 'exploration',
    'perception', 'creation', 'push', 'poetry', 'experience', 'wisdom', 'dream', 'leader',
    'teach', 'despair', 'unforgettable', 'fresh', 'resilient', 'smile', 'future', 'brilliant',
    'stillness', 'majestic'
  ], []);

  // 符号详情卡片组件
  const SymbolDetailsCard = ({ symbol, open, onClose }) => {
    if (!symbol) return null;
    
    // 符号解释视图
    if (!showStructure) {
      return (
        <Dialog 
          open={open} 
          onClose={onClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '10px'
            }
          }}
        >
          <DialogTitle sx={{ position: 'relative', pr: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {symbol.name}
            </Typography>
            <IconButton 
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              {symbol.description}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
              {t('gallery.source', language)}
            </Typography>
            
            <Button 
              variant="outlined"
              sx={{ textTransform: 'none' }}
              onClick={() => setShowStructure(true)}
            >
              {t('gallery.viewStructure', language)}
            </Button>
          </DialogContent>
        </Dialog>
      );
    }
    
    // 符号结构视图
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '10px'
          }
        }}
      >
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
            {t('gallery.symbolConfig', language)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            {t('gallery.symbolConfigDesc', language)}
          </Typography>
          <IconButton 
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* 使用符号PNG图像 */}
          <Box sx={{ 
            width: '100%', 
            textAlign: 'center', 
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Box 
              component="img"
              src={`${process.env.PUBLIC_URL}/reference/symbols_50/${symbol.key + 1}_${(symbol.english || symbol.name || 'unknown').toLowerCase()}.png`}
              alt={symbol.name}
              onError={(e) => {
                // 如果图像加载失败，显示默认圆形
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
            
            {/* 备用显示 - 当图像加载失败时 */}
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
              {/* 外部点 */}
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
              
              {/* 红色标识 */}
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
              
              {/* 内部矩阵 */}
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
            <Typography variant="subtitle2" gutterBottom>{t('gallery.tokenValues', language)}</Typography>
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
              {t('gallery.backToInterpretation', language)}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  // 处理符号点击 - 使用useCallback避免useEffect依赖问题
  const handleSymbolClick = useCallback((word, index) => {
    const symbolIndex = words.indexOf(word);
    const symbol = {
      key: symbolIndex,
      name: language === 'zh' ? chineseWords[symbolIndex] : (word === 'good health' ? 'Health' : word.charAt(0).toUpperCase() + word.slice(1)),
      english: word,
      description: language === 'zh' ? 
        (symbolDescriptions[symbolIndex]?.descriptionZh || "一个有意义的具有深层含义的概念。") :
        (symbolDescriptions[symbolIndex]?.description || "A meaningful concept with deep significance."),
      tokens: getTokensForSymbol(symbolIndex)
    };
    setSelectedSymbol(symbol);
    setShowStructure(false);
  }, [words, language]);

  return (
    <PageLayout
      title={t('gallery.title', language)}
      subtitle={t('gallery.subtitle', language)}
    >
      <Box sx={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        overflow: 'auto',
        position: 'relative',
        bgcolor: '#fff',
        borderRadius: 5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        p: 3,
        pb: 8,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box sx={{ maxWidth: '1400px', width: '100%' }}>
          <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
            {words.map((word, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} xl={2} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleSymbolClick(word, index)}
                >
                  <CardMedia
                    component="img"
                    height="120"
                    image={`${process.env.PUBLIC_URL}/reference/symbols_50/${index + 1}_${word.toLowerCase()}.png`}
                    alt={word}
                    onError={(e) => {
                      // 图像加载失败时的处理
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23f5f5f5"/><text x="60" y="60" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="12" fill="%23999">${language === 'zh' ? chineseWords[index] : word}</text></svg>`;
                    }}
                    sx={{
                      objectFit: 'contain',
                      backgroundColor: '#fafafa'
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                      {language === 'zh' ? chineseWords[index] : (word === 'good health' ? 'Health' : word)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <SymbolDetailsCard
        symbol={selectedSymbol}
        open={!!selectedSymbol}
        onClose={() => {
          setSelectedSymbol(null);
          setShowStructure(false);
        }}
      />
    </PageLayout>
  );
};

export default Gallery; 