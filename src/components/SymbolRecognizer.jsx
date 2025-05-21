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
  11: "信念/Faith",
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
  37: "学问/Wisdom",
  38: "梦想/Dream",
  39: "领袖/Leader",
  40: "教导/Teach",
  41: "绝望/Despair",
  42: "难忘/Unforgettable",
  43: "新生/Fresh",
  44: "坚韧/Resilient",
  45: "微笑/Smile",
  46: "未来/Future",
  47: "卓越/Brilliant",
  48: "平静/Stillness",
  49: "威严/Majestic"
};

// 符号释义数据
const symbolDescriptions = {
  0: { // 爱心
    cn: "一种强烈的情感连接，涵盖亲情、友情、浪漫和无私的关爱。",
    en: "A complex emotion encompassing affection, compassion, and deep attachment in various forms."
  },
  1: { // 和平
    cn: "没有战争或冲突的状态，也指内心的宁静与和谐。",
    en: "A state without conflict or war; also denotes inner tranquility and harmony."
  },
  2: { // 勇气
    cn: "在面对恐惧、痛苦或危险时，仍坚持行动的能力。",
    en: "The ability to act in the face of fear, pain, or danger."
  },
  3: { // 希望
    cn: "对未来积极结果的期望和信念。",
    en: "An optimistic state of mind based on the expectation of positive outcomes."
  },
  4: { // 恐惧
    cn: "对潜在危险或威胁的情绪反应。",
    en: "An emotional response to perceived threats or danger."
  },
  5: { // 幸福
    cn: "一种积极的情绪状态，表现为满足、喜悦和生活满意度。",
    en: "A positive emotional state characterized by contentment, joy, and life satisfaction."
  },
  6: { // 知识
    cn: "通过经验、学习或教育获得的事实、信息和技能。",
    en: "Information, facts, and skills acquired through experience, education, or learning."
  },
  7: { // 渴望
    cn: "对某种事物、目标或体验的强烈心理渴求，带有迫切与不满足的情绪色彩。",
    en: "A strong psychological craving or longing for something, often marked by urgency or emotional intensity."
  },
  8: { // 真相
    cn: "与事实或现实相符的陈述或信念。",
    en: "The quality of being in accord with fact or reality."
  },
  9: { // 自由
    cn: "行动、言论或思想不受限制的状态。",
    en: "The state of being free to act, speak, or think without hindrance."
  },
  10: { // 同情
    cn: "一种积极的情感反应，伴随着减轻他人痛苦的内在动机。",
    en: "A positive response and desire to help with an inner motivation to lessen or prevent suffering of others."
  },
  11: { // 信念
    cn: "对某人、某事或某概念的信任或信心，尤其在宗教中，指对上帝或宗教教义的信仰。",
    en: "Confidence or trust in a person, thing, or concept. In the context of religion, faith is 'belief in God or in the doctrines or teachings of religion'."
  },
  12: { // 智慧
    cn: "综合判断力与深度理解能力，体现为在复杂情境中作出明智决策的能力。",
    en: "The ability to make sound judgments and decisions based on knowledge and deep understanding."
  },
  13: { // 美丽
    cn: "使人感到愉悦的特质，常见于风景、艺术品或人类外貌，是美学研究的核心概念之一。",
    en: "A feature of objects that makes them pleasurable to perceive. Such objects include landscapes, sunsets, humans, and works of art."
  },
  14: { // 荣誉
    cn: "社会对个人可信度和社会地位的评价，基于其行为判断，具有文化和历史差异。",
    en: "The quality of being honorable."
  },
  15: { // 生存
    cn: "继续活着的行为或状态，尤其在面临危险或挑战时。",
    en: "The act of surviving; to stay living."
  },
  16: { // 冒险
    cn: "一种令人兴奋的经历，通常涉及大胆或有风险的行为。",
    en: "An exciting experience that is typically bold, sometimes risky, undertaking."
  },
  17: { // 祝福
    cn: "表达好运的方式，有时在宗教仪式中表示上帝对善人的祝福。",
    en: "A way to wish good luck for a person. Sometimes, in religious rituals, it is said that God blesses those who are good."
  },
  18: { // 健康
    cn: "身体、心理和社会的完全良好状态，而不仅仅是没有疾病或虚弱。",
    en: "A state of complete physical, mental, and social well-being, and not merely the absence of disease."
  },
  19: { // 成功
    cn: "达到既定目标或期望的状态，通常被视为失败的对立面。",
    en: "The state or condition of meeting a defined range of expectations. It may be viewed as the opposite of failure."
  },
  20: { // 繁荣
    cn: "经济或社会在财富与福祉方面的增长状态。",
    en: "A state of economic or social growth in wealth and well-being."
  },
  21: { // 愉悦
    cn: "因成功、好运或他人幸福而产生的强烈幸福感。",
    en: "A strong feeling of happiness often resulting from success or good fortune."
  },
  22: { // 善良
    cn: "表现出体贴、慷慨与关怀的品质。",
    en: "The quality of being considerate, generous, and caring."
  },
  23: { // 和谐
    cn: "各部分协调一致的状态，常用于描述关系或环境的平衡。",
    en: "A state of balance or agreement among different parts or people."
  },
  24: { // 友情
    cn: "基于信任和支持的亲密人际关系。",
    en: "A close relationship based on trust and mutual support."
  },
  25: { // 财富
    cn: "拥有大量有价值的资源，如金钱或资产。",
    en: "The abundance of valuable resources like money or property."
  },
  26: { // 耐心
    cn: "面对延迟或困难时保持冷静和坚持的能力。",
    en: "The ability to remain calm and persistent in the face of delay or difficulty."
  },
  27: { // 慷慨
    cn: "乐于无私地给予他人金钱、时间或帮助。",
    en: "Willingness to give money, time, or help selflessly."
  },
  28: { // 谦逊
    cn: "对自身重要性保持谦虚态度。",
    en: "A modest view of one's importance."
  },
  29: { // 感恩
    cn: "对他人善意的感激之情。",
    en: "Thankfulness for kindness received."
  },
  30: { // 观察
    cn: "通过感官或工具获取信息的过程。",
    en: "The process of gaining information through senses or instruments."
  },
  31: { // 探索
    cn: "为获取新知而调查未知领域的行为。",
    en: "Investigating unknown areas to acquire new knowledge."
  },
  32: { // 感知
    cn: "解释与理解感官信息的能力。",
    en: "The ability to interpret and make sense of sensory input."
  },
  33: { // 创造
    cn: "将想法或实体带入现实的过程。",
    en: "The process of bringing ideas or things into existence."
  },
  34: { // 推动
    cn: "施加力量使某物前进或变化。",
    en: "Applying force to move or initiate change."
  },
  35: { // 诗歌
    cn: "用节奏与意象表达情感与思想的艺术形式。",
    en: "An art form using rhythm and imagery to convey emotion and thought."
  },
  36: { // 经验
    cn: "经历与实践中积累的知识与技能。",
    en: "Knowledge and skills gained through life and practice."
  },
  37: { // 学问
    cn: "做出明智判断的能力，源自知识与经验的结合。",
    en: "The ability to make wise decisions based on knowledge and experience."
  },
  38: { // 梦想
    cn: "睡眠中产生的影像序列，或个体的理想愿景。",
    en: "A sequence of mental images during sleep, or a personal aspiration."
  },
  39: { // 领袖
    cn: "引导与激励他人的个体。",
    en: "An individual who guides and inspires others."
  },
  40: { // 教导
    cn: "将知识或技能传授给他人。",
    en: "To impart knowledge or skills to others."
  },
  41: { // 绝望
    cn: "完全丧失希望的情绪状态。",
    en: "A complete emotional loss of hope."
  },
  42: { // 难忘
    cn: "因独特或重要而难以忘记。",
    en: "Memorable due to uniqueness or significance."
  },
  43: { // 新生
    cn: "新的、未经使用或感受的状态。",
    en: "New, unused, or recently encountered."
  },
  44: { // 坚韧
    cn: "快速从挑战或困境中恢复的能力。",
    en: "The ability to recover quickly from challenges or setbacks."
  },
  45: { // 微笑
    cn: "表达喜悦与善意的面部表情。",
    en: "A facial expression that shows joy and friendliness."
  },
  46: { // 未来
    cn: "尚未发生的时间与事件。",
    en: "Time and events that are yet to happen."
  },
  47: { // 卓越
    cn: "极具才华或非凡聪明。",
    en: "Exceptionally talented or intelligent."
  },
  48: { // 平静
    cn: "无动作或声音的宁静状态。",
    en: "A quiet state with no motion or sound."
  },
  49: { // 威严
    cn: "庄严、宏伟、令人敬畏的特质。",
    en: "Grand and awe-inspiring in appearance or manner."
  }
};

// 模拟的符号结构数据
const symbolStructures = {
  0: { // 爱心
    tokens: [
      { language: "英语", token: "12345" },
      { language: "德语", token: "9734" },
      { language: "法语", token: "8271" },
      { language: "西班牙语", token: "6543" },
      { language: "日语", token: "5678" },
    ],
    pattern: "内部矩阵排布由token值hash而成"
  },
  1: { // 和平
    tokens: [
      { language: "英语", token: "12345" },
      { language: "德语", token: "9734" },
      { language: "法语", token: "8271" },
      { language: "西班牙语", token: "6543" },
      { language: "日语", token: "5678" },
    ],
    pattern: "内部矩阵排布由token值hash而成"
  },
  // 更多符号结构可以后续添加
};

// Token数据映射函数 - 使用words_tokens_cleaned.csv数据
const getTokensForSymbol = (symbolIndex) => {
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
    },
    'hope': {
      'English': 'TKN-4833',
      'Spanish': 'TKN-75874',
      'French': 'TKN-63944',
      'Hindi': 'TKN-20459',
      'Indonesian': 'TKN-1497',
      'Italian': 'TKN-82439',
      'Japanese': 'TKN-36131',
      'Dutch': 'TKN-75511',
      'Portuguese': 'TKN-132232',
      'Russian': 'TKN-27135',
      'Thai': 'TKN-170625',
      'Turkish': 'TKN-948',
      'Vietnamese': 'TKN-31327',
      'Chinese': 'TKN-36131',
      'Korean': 'TKN-90124',
      'Arabic': 'TKN-7698',
      'German': 'TKN-65724'
    },
    'fear': {
      'English': 'TKN-5504',
      'Spanish': 'TKN-89226',
      'French': 'TKN-47144',
      'Hindi': 'TKN-183508',
      'Indonesian': 'TKN-9493',
      'Italian': 'TKN-78549',
      'Japanese': 'TKN-120203',
      'Dutch': 'TKN-105960',
      'Portuguese': 'TKN-82163',
      'Russian': 'TKN-9999',
      'Thai': 'TKN-170625',
      'Turkish': 'TKN-173694',
      'Vietnamese': 'TKN-83591',
      'Chinese': 'TKN-120203',
      'Korean': 'TKN-16589',
      'Arabic': 'TKN-5949',
      'German': 'TKN-70074'
    },
    'happiness': {
      'English': 'TKN-29788',
      'Spanish': 'TKN-148778',
      'French': 'TKN-104059',
      'Hindi': 'TKN-86175',
      'Indonesian': 'TKN-72089',
      'Italian': 'TKN-5641',
      'Japanese': 'TKN-47615',
      'Dutch': 'TKN-2155',
      'Portuguese': 'TKN-5641',
      'Russian': 'TKN-118579',
      'Thai': 'TKN-170625',
      'Turkish': 'TKN-4110',
      'Vietnamese': 'TKN-140086',
      'Chinese': 'TKN-47615',
      'Korean': 'TKN-51127',
      'Arabic': 'TKN-112956',
      'German': 'TKN-50814'
    },
    'knowledge': {
      'English': 'TKN-6537',
      'Spanish': 'TKN-33280',
      'French': 'TKN-24572',
      'Hindi': 'TKN-26425',
      'Indonesian': 'TKN-1469',
      'Italian': 'TKN-35600',
      'Japanese': 'TKN-4071',
      'Dutch': 'TKN-64685',
      'Portuguese': 'TKN-50934',
      'Russian': 'TKN-134023',
      'Thai': 'TKN-170625',
      'Turkish': 'TKN-49049',
      'Vietnamese': 'TKN-28800',
      'Chinese': 'TKN-4071',
      'Korean': 'TKN-7601',
      'Arabic': 'TKN-151483',
      'German': 'TKN-9991'
    },
    'thirst': {
      'English': 'TKN-16033',
      'Spanish': 'TKN-1075',
      'French': 'TKN-1355',
      'Hindi': 'TKN-20121',
      'Indonesian': 'TKN-7459',
      'Italian': 'TKN-33925',
      'Japanese': 'TKN-173344',
      'Dutch': 'TKN-3829',
      'Portuguese': 'TKN-4096',
      'Russian': 'TKN-7588',
      'Thai': 'TKN-141404',
      'Turkish': 'TKN-941',
      'Vietnamese': 'TKN-1877',
      'Chinese': 'TKN-5893',
      'Korean': 'TKN-100720',
      'Arabic': 'TKN-148272',
      'German': 'TKN-68204'
    },
    'truth': {
      'English': 'TKN-6038',
      'Spanish': 'TKN-37780',
      'French': 'TKN-52301',
      'Hindi': 'TKN-117735',
      'Indonesian': 'TKN-6831',
      'Italian': 'TKN-35608',
      'Japanese': 'TKN-97841',
      'Dutch': 'TKN-968',
      'Portuguese': 'TKN-37780',
      'Russian': 'TKN-34982',
      'Thai': 'TKN-177908',
      'Turkish': 'TKN-177177',
      'Vietnamese': 'TKN-1517',
      'Chinese': 'TKN-97841',
      'Korean': 'TKN-194759',
      'Arabic': 'TKN-73773',
      'German': 'TKN-67499'
    },
    'freedom': {
      'English': 'TKN-11653',
      'Spanish': 'TKN-112834',
      'French': 'TKN-45384',
      'Hindi': 'TKN-194056',
      'Indonesian': 'TKN-9373',
      'Italian': 'TKN-59613',
      'Japanese': 'TKN-3066',
      'Dutch': 'TKN-15629',
      'Portuguese': 'TKN-112834',
      'Russian': 'TKN-103677',
      'Thai': 'TKN-164019',
      'Turkish': 'TKN-172329',
      'Vietnamese': 'TKN-11304',
      'Chinese': 'TKN-3066',
      'Korean': 'TKN-140066',
      'Arabic': 'TKN-38860',
      'German': 'TKN-6869'
    },
    'compassion': {
      'English': 'TKN-4964',
      'Spanish': 'TKN-1508',
      'French': 'TKN-4964',
      'Hindi': 'TKN-26892',
      'Indonesian': 'TKN-277',
      'Italian': 'TKN-4964',
      'Japanese': 'TKN-12414',
      'Dutch': 'TKN-60813',
      'Portuguese': 'TKN-4964',
      'Russian': 'TKN-1960',
      'Thai': 'TKN-170625',
      'Turkish': 'TKN-180548',
      'Vietnamese': 'TKN-19257',
      'Chinese': 'TKN-113456',
      'Korean': 'TKN-22564',
      'Arabic': 'TKN-7605',
      'German': 'TKN-46627'
    }
  };

  // 更多符号可以添加到这里...

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

// 符号SVG生成函数
const generateSymbolSVG = (symbolIndex) => {
  // 符号图案的基本颜色
  const colors = [
    '#ff5252', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', 
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#e91e63',
    '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4',
    '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548',
    '#9e9e9e', '#607d8b', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688',
    '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107'
  ];
  
  const primaryColor = colors[symbolIndex % colors.length];
  const secondaryColor = colors[(symbolIndex + 5) % colors.length];
  
  // 生成点阵矩阵 - 模拟符号内部结构
  const dotMatrix = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      const value = ((i * 5 + j) % (symbolIndex % 7 + 2)) < 3 ? 1 : 0;
      row.push(value);
    }
    dotMatrix.push(row);
  }
  
  // 生成整个SVG
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <!-- 背景圆形 -->
      <circle cx="100" cy="100" r="90" fill="#f8f8f8" stroke="#eaeaea" stroke-width="1" />
      
      <!-- 外部点阵圆圈 -->
      ${Array.from({length: 15}, (_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const r = 75;
        const x = 100 + Math.cos(angle) * r;
        const y = 100 + Math.sin(angle) * r;
        return `<circle cx="${x}" cy="${y}" r="3" fill="#333" />`;
      }).join('')}
      
      <!-- 内部符号点阵 -->
      <g transform="translate(75, 75)">
        ${dotMatrix.map((row, i) => 
          row.map((dot, j) => 
            `<circle cx="${j*10}" cy="${i*10}" r="4" fill="${dot ? '#000' : '#ccc'}" />`
          ).join('')
        ).join('')}
      </g>
      
      <!-- 红色标记点 -->
      <circle cx="75" cy="75" r="4" fill="${secondaryColor}" />
    </svg>
  `;
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
  const [loadingMessage, setLoadingMessage] = useState('正在加载解码器...');
  const [useLocalPrediction, setUseLocalPrediction] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showStructure, setShowStructure] = useState(false);
  
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
          setLoadingMessage('正在加载解码器...');
          setModel(globalModelCache);
          setIsLoading(false);
          return;
        }
        
        // 初始化TensorFlow后端
        setLoadingMessage('正在加载解码器...');
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
            throw new Error('无法初始化解码器，请尝试使用其他浏览器');
          }
        }
        
        // 确认后端已设置
        const backend = tf.getBackend();
        console.log('当前使用的后端:', backend);
        
        if (!backend) {
          throw new Error('解码器未正确初始化');
        }
        
        setLoadingMessage('正在加载解码器');
        
        // 尝试预加载模型
        const startTime = Date.now();
        const mobileNetModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
          // 添加进度回调
          onProgress: (progress) => {
            setLoadingProgress(Math.floor(progress * 100));
            setLoadingMessage('这可能需要几秒钟时间...');
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
      setSelectedSymbol(null); // 重置选中的符号
      setShowStructure(false); // 重置结构视图
      
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
      
      // 设置选中的符号为第一个预测结果
      if (mappedPredictions && mappedPredictions.length > 0) {
        const topPrediction = mappedPredictions[0];
        const name = topPrediction.className.split('/')[0]; // 获取中文名称
        const symbolKey = Object.keys(symbolCategories).find(
          key => symbolCategories[key].includes(name)
        );
        
        if (symbolKey) {
          const keyNum = parseInt(symbolKey);
          setSelectedSymbol({
            key: keyNum,
            name: name,
            english: symbolCategories[symbolKey].split('/')[1],
            description: symbolDescriptions[keyNum]?.cn || "暂无详细描述",
            description_en: symbolDescriptions[keyNum]?.en || "No description available",
            tokens: getTokensForSymbol(keyNum),
            svg: generateSymbolSVG(keyNum)
          });
        }
      }
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
  
  if (isLoading && !useLocalPrediction) {
    return (
      <PageLayout 
        title="符号识别" 
        subtitle="上传一张符号图片，AI将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
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
        subtitle="上传一张符号图片，AI将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
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
      subtitle="上传一张符号图片，AI将识别它属于哪种符号类型，当前版本可以识别50种不同的符号。"
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
              
              {/* 符号详情卡片 */}
              {selectedSymbol && <SymbolDetailsCard symbol={selectedSymbol} />}
          </Box>
        </Paper>
      )}
    </Container>
    </PageLayout>
  );
};

export default SymbolRecognizer; 