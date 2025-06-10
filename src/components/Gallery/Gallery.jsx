import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Dialog, DialogContent, DialogTitle, Grid, Card, CardMedia, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PageLayout from '../PageLayout';
// 导入真实的token映射数据
import { tokenMapping } from '../../utils/tokenMapping';

// 复用SymbolRecognizer中的符号数据
const symbolDescriptions = {
  0: { description: "A complex emotion encompassing affection, compassion, and deep attachment in various forms." },
  1: { description: "A state without conflict or war; also denotes inner tranquility and harmony." },
  2: { description: "The ability to act in the face of fear, pain, or danger." },
  3: { description: "An optimistic state of mind based on the expectation of positive outcomes." },
  4: { description: "An emotional response to perceived threats or danger." },
  5: { description: "A positive emotional state characterized by contentment, joy, and life satisfaction." },
  6: { description: "Information, facts, and skills acquired through experience, education, or learning." },
  7: { description: "A strong psychological craving or longing for something, often marked by urgency or emotional intensity." },
  8: { description: "The quality of being in accord with fact or reality." },
  9: { description: "The state of being free to act, speak, or think without hindrance." },
  10: { description: "A positive response and desire to help with an inner motivation to lessen or prevent suffering of others." },
  11: { description: "Confidence or trust in a person, thing, or concept. In the context of religion, faith is 'belief in God or in the doctrines or teachings of religion'." },
  12: { description: "The ability to make sound judgments and decisions based on knowledge and deep understanding." },
  13: { description: "A feature of objects that makes them pleasurable to perceive. Such objects include landscapes, sunsets, humans, and works of art." },
  14: { description: "The quality of being honorable." },
  15: { description: "The act of surviving; to stay living." },
  16: { description: "An exciting experience that is typically bold, sometimes risky, undertaking." },
  17: { description: "A way to wish good luck for a person. Sometimes, in religious rituals, it is said that God blesses those who are good." },
  18: { description: "A state of complete physical, mental, and social well-being, and not merely the absence of disease." },
  19: { description: "The state or condition of meeting a defined range of expectations. It may be viewed as the opposite of failure." },
  20: { description: "A state of economic or social growth in wealth and well-being." },
  21: { description: "A strong feeling of happiness often resulting from success or good fortune." },
  22: { description: "The quality of being considerate, generous, and caring." },
  23: { description: "A state of balance or agreement among different parts or people." },
  24: { description: "A close relationship based on trust and mutual support." },
  25: { description: "The abundance of valuable resources like money or property." },
  26: { description: "The ability to remain calm and persistent in the face of delay or difficulty." },
  27: { description: "Willingness to give money, time, or help selflessly." },
  28: { description: "A modest view of one's importance." },
  29: { description: "Thankfulness for kindness received." },
  30: { description: "The process of gaining information through senses or instruments." },
  31: { description: "Investigating unknown areas to acquire new knowledge." },
  32: { description: "The ability to interpret and make sense of sensory input." },
  33: { description: "The process of bringing ideas or things into existence." },
  34: { description: "Applying force to move or initiate change." },
  35: { description: "An art form using rhythm and imagery to convey emotion and thought." },
  36: { description: "Knowledge and skills gained through life and practice." },
  37: { description: "The ability to make wise decisions based on knowledge and experience." },
  38: { description: "A sequence of mental images during sleep, or a personal aspiration." },
  39: { description: "An individual who guides and inspires others." },
  40: { description: "To impart knowledge or skills to others." },
  41: { description: "A complete emotional loss of hope." },
  42: { description: "Memorable due to uniqueness or significance." },
  43: { description: "New, unused, or recently encountered." },
  44: { description: "The ability to recover quickly from challenges or setbacks." },
  45: { description: "A facial expression that shows joy and friendliness." },
  46: { description: "Time and events that are yet to happen." },
  47: { description: "Exceptionally talented or intelligent." },
  48: { description: "A quiet state with no motion or sound." },
  49: { description: "Grand and awe-inspiring in appearance or manner." }
};

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
              Source: Omni-D Semantic Database • Neural Pattern Recognition System
            </Typography>
            
            <Button 
              variant="outlined"
              sx={{ textTransform: 'none' }}
              onClick={() => setShowStructure(true)}
            >
              View Structure Interpretation
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
            Symbol Configuration Principle
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            The position of each point on the 17-sided polygon is determined by the token value of the word in the corresponding language. The internal matrix follows the same principle. The small red triangle is the machine recognition starting symbol.
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
            <Typography variant="subtitle2" gutterBottom>Token Values in Different Languages:</Typography>
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
              Back to Interpretation
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
      name: word === 'good health' ? 'Health' : word.charAt(0).toUpperCase() + word.slice(1),
      english: word,
      description: symbolDescriptions[symbolIndex]?.description || "A meaningful concept with deep significance.",
      tokens: getTokensForSymbol(symbolIndex)
    };
    setSelectedSymbol(symbol);
    setShowStructure(false);
  }, [words]);

  return (
    <PageLayout
      title="Visualization Gallery"
      subtitle="Browse visual symbol representations of different words. Click on any symbol for detailed information"
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
                      e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%23f5f5f5"/><text x="60" y="60" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="12" fill="%23999">${word}</text></svg>`;
                    }}
                    sx={{
                      objectFit: 'contain',
                      backgroundColor: '#fafafa'
                    }}
                  />
                  <CardContent sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                      {word === 'good health' ? 'Health' : word}
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