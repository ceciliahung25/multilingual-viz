/**
 * tokenMapping.js
 * 符号的Token值映射工具函数
 */

// 获取符号的Token映射
export const getTokensForSymbol = (symbolIndex) => {
  // 符号英文名称（小写）
  const symbolNames = [
    'love', 'peace', 'courage', 'hope', 'fear', 'happiness', 'knowledge', 'thirst', 
    'truth', 'freedom', 'compassion', 'faith', 'smart', 'beauty', 'honor', 'survival', 
    'adventure', 'blessings', 'good health', 'success', 'prosperity', 'joy', 'kindness', 
    'harmony', 'friendship', 'wealth', 'patience', 'generosity', 'humility', 'gratitude',
    'observation', 'exploration', 'perception', 'creation', 'push', 'poetry', 'experience',
    'wisdom', 'dream', 'leader', 'teach', 'despair', 'unforgettable', 'fresh', 'resilient',
    'smile', 'future', 'brilliant', 'stillness', 'majestic'
  ];
  
  // 根据CSV数据创建的完整token映射
  const allTokens = {
    'love': {
      'English': 'TKN-1300',
      'Spanish': 'TKN-15633',
      'French': 'TKN-24855',
      'Hindi': 'TKN-20121',
      'Indonesian': 'TKN-46654',
      'Italian': 'TKN-18815',
      'Japanese': 'TKN-14232',
      'Dutch': 'TKN-87363',
      'Portuguese': 'TKN-15633',
      'Russian': 'TKN-69649',
      'Thai': 'TKN-86592',
      'Turkish': 'TKN-171063',
      'Vietnamese': 'TKN-19257',
      'Chinese': 'TKN-62885',
      'Korean': 'TKN-9919',
      'Arabic': 'TKN-78459',
      'German': 'TKN-41010'
    },
    'peace': {
      'English': 'TKN-8043',
      'Spanish': 'TKN-24566',
      'French': 'TKN-27346',
      'Hindi': 'TKN-173653',
      'Indonesian': 'TKN-3879',
      'Italian': 'TKN-12170',
      'Japanese': 'TKN-8523',
      'Dutch': 'TKN-97571',
      'Portuguese': 'TKN-24566',
      'Russian': 'TKN-20932',
      'Thai': 'TKN-142074',
      'Turkish': 'TKN-156211',
      'Vietnamese': 'TKN-19206',
      'Chinese': 'TKN-576',
      'Korean': 'TKN-136628',
      'Arabic': 'TKN-5522',
      'German': 'TKN-122323'
    },
    'courage': {
      'English': 'TKN-27244',
      'Spanish': 'TKN-1168',
      'French': 'TKN-27244',
      'Hindi': 'TKN-33154',
      'Indonesian': 'TKN-3246',
      'Italian': 'TKN-99259',
      'Japanese': 'TKN-49830',
      'Dutch': 'TKN-972',
      'Portuguese': 'TKN-1168',
      'Russian': 'TKN-71689',
      'Thai': 'TKN-141404',
      'Turkish': 'TKN-10002',
      'Vietnamese': 'TKN-225',
      'Chinese': 'TKN-49830',
      'Korean': 'TKN-32158',
      'Arabic': 'TKN-159006',
      'German': 'TKN-69835'
    }
    // 更多符号可以添加到这里...
  };

  // 如果有实际数据使用实际数据，否则使用标准化的编号格式
  if (allTokens[symbolNames[symbolIndex]]) {
    return allTokens[symbolNames[symbolIndex]];
  }
  
  // 否则使用标准化的编号格式
  const symbolNumber = symbolIndex + 1; // 1-50 号
  return {
    'English': `TKN-${symbolNumber}001`,
    'Spanish': `TKN-${symbolNumber}002`,
    'French': `TKN-${symbolNumber}003`,
    'Hindi': `TKN-${symbolNumber}004`,
    'Indonesian': `TKN-${symbolNumber}005`,
    'Italian': `TKN-${symbolNumber}006`,
    'Japanese': `TKN-${symbolNumber}007`,
    'Dutch': `TKN-${symbolNumber}008`,
    'Portuguese': `TKN-${symbolNumber}009`,
    'Russian': `TKN-${symbolNumber}010`,
    'Thai': `TKN-${symbolNumber}011`,
    'Turkish': `TKN-${symbolNumber}012`,
    'Vietnamese': `TKN-${symbolNumber}013`,
    'Chinese': `TKN-${symbolNumber}014`,
    'Korean': `TKN-${symbolNumber}015`,
    'Arabic': `TKN-${symbolNumber}016`,
    'German': `TKN-${symbolNumber}017`
  };
}; 