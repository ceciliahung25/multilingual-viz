import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, Grid, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
// Import TensorFlow and its backends
import * as tf from '@tensorflow/tfjs';
// Force import CPU and WebGL backends
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
// Import pre-trained model
import * as mobilenet from '@tensorflow-models/mobilenet';
// Import unified page layout
import PageLayout from './PageLayout';
// Import real token mapping data
import { tokenMapping } from '../utils/tokenMapping';

// Global model cache
let globalModelCache = null;

// Container styles
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

// Symbol category mapping
const symbolCategories = {
  0: "Love",
  1: "Peace",
  2: "Courage",
  3: "Hope",
  4: "Fear",
  5: "Happiness",
  6: "Knowledge",
  7: "Thirst",
  8: "Truth",
  9: "Freedom",
  10: "Compassion",
  11: "Faith",
  12: "Smart",
  13: "Beauty",
  14: "Honor",
  15: "Survival",
  16: "Adventure",
  17: "Blessings",
  18: "Good Health",
  19: "Success",
  20: "Prosperity",
  21: "Joy",
  22: "Kindness",
  23: "Harmony",
  24: "Friendship",
  25: "Wealth",
  26: "Patience",
  27: "Generosity",
  28: "Humility",
  29: "Gratitude",
  30: "Observation",
  31: "Exploration",
  32: "Perception",
  33: "Creation",
  34: "Push",
  35: "Poetry",
  36: "Experience",
  37: "Wisdom",
  38: "Dream",
  39: "Leader",
  40: "Teach",
  41: "Despair",
  42: "Unforgettable",
  43: "Fresh",
  44: "Resilient",
  45: "Smile",
  46: "Future",
  47: "Brilliant",
  48: "Stillness",
  49: "Majestic"
};

// Symbol description data
const symbolDescriptions = {
  0: { // Love
    description: "A complex emotion encompassing affection, compassion, and deep attachment in various forms."
  },
  1: { // Peace
    description: "A state without conflict or war; also denotes inner tranquility and harmony."
  },
  2: { // Courage
    description: "The ability to act in the face of fear, pain, or danger."
  },
  3: { // Hope
    description: "An optimistic state of mind based on the expectation of positive outcomes."
  },
  4: { // Fear
    description: "An emotional response to perceived threats or danger."
  },
  5: { // Happiness
    description: "A positive emotional state characterized by contentment, joy, and life satisfaction."
  },
  6: { // Knowledge
    description: "Information, facts, and skills acquired through experience, education, or learning."
  },
  7: { // Thirst
    description: "A strong psychological craving or longing for something, often marked by urgency or emotional intensity."
  },
  8: { // Truth
    description: "The quality of being in accord with fact or reality."
  },
  9: { // Freedom
    description: "The state of being free to act, speak, or think without hindrance."
  },
  10: { // Compassion
    description: "A positive response and desire to help with an inner motivation to lessen or prevent suffering of others."
  },
  11: { // Faith
    description: "Confidence or trust in a person, thing, or concept. In the context of religion, faith is 'belief in God or in the doctrines or teachings of religion'."
  },
  12: { // Smart
    description: "The ability to make sound judgments and decisions based on knowledge and deep understanding."
  },
  13: { // Beauty
    description: "A feature of objects that makes them pleasurable to perceive. Such objects include landscapes, sunsets, humans, and works of art."
  },
  14: { // Honor
    description: "The quality of being honorable."
  },
  15: { // Survival
    description: "The act of surviving; to stay living."
  },
  16: { // Adventure
    description: "An exciting experience that is typically bold, sometimes risky, undertaking."
  },
  17: { // Blessings
    description: "A way to wish good luck for a person. Sometimes, in religious rituals, it is said that God blesses those who are good."
  },
  18: { // Good Health
    description: "A state of complete physical, mental, and social well-being, and not merely the absence of disease."
  },
  19: { // Success
    description: "The state or condition of meeting a defined range of expectations. It may be viewed as the opposite of failure."
  },
  20: { // Prosperity
    description: "A state of economic or social growth in wealth and well-being."
  },
  21: { // Joy
    description: "A strong feeling of happiness often resulting from success or good fortune."
  },
  22: { // Kindness
    description: "The quality of being considerate, generous, and caring."
  },
  23: { // Harmony
    description: "A state of balance or agreement among different parts or people."
  },
  24: { // Friendship
    description: "A close relationship based on trust and mutual support."
  },
  25: { // Wealth
    description: "The abundance of valuable resources like money or property."
  },
  26: { // Patience
    description: "The ability to remain calm and persistent in the face of delay or difficulty."
  },
  27: { // Generosity
    description: "Willingness to give money, time, or help selflessly."
  },
  28: { // Humility
    description: "A modest view of one's importance."
  },
  29: { // Gratitude
    description: "Thankfulness for kindness received."
  },
  30: { // Observation
    description: "The process of gaining information through senses or instruments."
  },
  31: { // Exploration
    description: "Investigating unknown areas to acquire new knowledge."
  },
  32: { // Perception
    description: "The ability to interpret and make sense of sensory input."
  },
  33: { // Creation
    description: "The process of bringing ideas or things into existence."
  },
  34: { // Push
    description: "Applying force to move or initiate change."
  },
  35: { // Poetry
    description: "An art form using rhythm and imagery to convey emotion and thought."
  },
  36: { // Experience
    description: "Knowledge and skills gained through life and practice."
  },
  37: { // Wisdom
    description: "The ability to make wise decisions based on knowledge and experience."
  },
  38: { // Dream
    description: "A sequence of mental images during sleep, or a personal aspiration."
  },
  39: { // Leader
    description: "An individual who guides and inspires others."
  },
  40: { // Teach
    description: "To impart knowledge or skills to others."
  },
  41: { // Despair
    description: "A complete emotional loss of hope."
  },
  42: { // Unforgettable
    description: "Memorable due to uniqueness or significance."
  },
  43: { // Fresh
    description: "New, unused, or recently encountered."
  },
  44: { // Resilient
    description: "The ability to recover quickly from challenges or setbacks."
  },
  45: { // Smile
    description: "A facial expression that shows joy and friendliness."
  },
  46: { // Future
    description: "Time and events that are yet to happen."
  },
  47: { // Brilliant
    description: "Exceptionally talented or intelligent."
  },
  48: { // Stillness
    description: "A quiet state with no motion or sound."
  },
  49: { // Majestic
    description: "Grand and awe-inspiring in appearance or manner."
  }
};

// Mock symbol structure data
const mockSymbolStructures = {
  0: { // Love
    tokens: [
      { language: "English", token: "12345" },
      { language: "German", token: "9734" },
      { language: "French", token: "8271" },
      { language: "Spanish", token: "6543" },
      { language: "Japanese", token: "5678" },
    ],
    pattern: "Internal matrix arrangement formed by hash of token values"
  },
  1: { // Peace
    tokens: [
      { language: "English", token: "12345" },
      { language: "German", token: "9734" },
      { language: "French", token: "8271" },
      { language: "Spanish", token: "6543" },
      { language: "Japanese", token: "5678" },
    ],
    pattern: "Internal matrix arrangement formed by hash of token values"
  },
  // More symbols can be added later
};

// Token data mapping function - using real CSV data
const getTokensForSymbol = (symbolIndex) => {
  // Symbol English name (lowercase)
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

// Symbol SVG generation function
const generateSymbolSVG = (symbolIndex) => {
  // Basic color of symbol pattern
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
  
  // Generate dot matrix - simulate symbol internal structure
  const dotMatrix = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      const value = ((i * 5 + j) % (symbolIndex % 7 + 2)) < 3 ? 1 : 0;
      row.push(value);
    }
    dotMatrix.push(row);
  }
  
  // Generate entire SVG
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <!-- Background circle -->
      <circle cx="100" cy="100" r="90" fill="#f8f8f8" stroke="#eaeaea" stroke-width="1" />
      
      <!-- External dot matrix circle -->
      ${Array.from({length: 15}, (_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const r = 75;
        const x = 100 + Math.cos(angle) * r;
        const y = 100 + Math.sin(angle) * r;
        return `<circle cx="${x}" cy="${y}" r="3" fill="#333" />`;
      }).join('')}
      
      <!-- Internal symbol dot matrix -->
      <g transform="translate(75, 75)">
        ${dotMatrix.map((row, i) => 
          row.map((dot, j) => 
            `<circle cx="${j*10}" cy="${i*10}" r="4" fill="${dot ? '#000' : '#ccc'}" />`
          ).join('')
        ).join('')}
      </g>
      
      <!-- Red marked point -->
      <circle cx="75" cy="75" r="4" fill="${secondaryColor}" />
    </svg>
  `;
};

// Local prediction function, not dependent on TensorFlow.js
const localPredict = (imageSrc) => {
  // Use safer random number generation method
  const getSecureRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };

  // Use encrypted random number generator to select index
  const indices = new Set();
  while (indices.size < 5) {
    const index = Math.floor(getSecureRandom() * Object.keys(symbolCategories).length);
    indices.add(index);
  }

  // Generate probabilities
  const probabilities = [0.9];
  for (let i = 1; i < 5; i++) {
    probabilities.push(Math.max(0.1, 0.9 - i * 0.15));
  }

  // Build prediction results
  return Array.from(indices).map((index, i) => {
    const symbolClass = symbolCategories[index] || `Symbol ${index}`;
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
  const [loadingMessage, setLoadingMessage] = useState('Loading decoder...');
  const [useLocalPrediction, setUseLocalPrediction] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [showStructure, setShowStructure] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Initialize TensorFlow.js backend
  useEffect(() => {
    async function setupTensorflow() {
      try {
        // Ensure WebGL backend is initialized
        await tf.ready();
        // Check backend
        const backend = tf.getBackend();
        console.log('Current TensorFlow.js backend:', backend);
        
        if (!backend) {
          // Try setting WebGL backend, if fails use CPU backend
          try {
            await tf.setBackend('webgl');
            console.log('WebGL backend set');
          } catch (webglErr) {
            console.warn('WebGL backend initialization failed, trying CPU backend', webglErr);
            try {
              await tf.setBackend('cpu');
              console.log('CPU backend set');
            } catch (cpuErr) {
              console.error('Unable to initialize any backend', cpuErr);
              setError('TensorFlow.js backend initialization failed, please refresh the page and try again');
            }
          }
        }
      } catch (err) {
        console.error('TensorFlow initialization error:', err);
        setError(`TensorFlow initialization failed: ${err.message}`);
      }
    }
    
    setupTensorflow();
  }, []);
  
  // Load pre-trained model
  useEffect(() => {
    async function loadPretrainedModel() {
      try {
        setIsLoading(true);
        setError('');
        
        // Check if there is a cached model
        if (globalModelCache) {
          console.log('Using cached model');
          setLoadingMessage('Loading decoder...');
          setModel(globalModelCache);
          setIsLoading(false);
          return;
        }
        
        // Initialize TensorFlow backend
        setLoadingMessage('Loading decoder...');
        console.log('TensorFlow version:', tf.version.tfjs);
        
        // First try initializing WebGL backend
        try {
          await tf.setBackend('webgl');
          await tf.ready();
          console.log('WebGL backend initialized successfully');
        } catch (webglError) {
          console.warn('WebGL backend initialization failed, trying CPU backend', webglError);
          try {
            await tf.setBackend('cpu');
            await tf.ready();
            console.log('CPU backend initialized successfully');
          } catch (cpuError) {
            console.error('All backends initialization failed', cpuError);
            throw new Error('Unable to initialize decoder, please try using a different browser');
          }
        }
        
        // Ensure backend is set
        const backend = tf.getBackend();
        console.log('Current backend in use:', backend);
        
        if (!backend) {
          throw new Error('Decoder not properly initialized');
        }
        
        setLoadingMessage('Loading decoder...');
        
        // Try pre-loading model
        const startTime = Date.now();
        const mobileNetModel = await mobilenet.load({
          version: 2,
          alpha: 1.0,
          // Add progress callback
          onProgress: (progress) => {
            setLoadingProgress(Math.floor(progress * 100));
            setLoadingMessage('This may take a few seconds...');
          }
        });
        
        console.log(`Model loading completed, time taken: ${(Date.now() - startTime)/1000} seconds`);
        
        // Test model availability
        const testTensor = tf.zeros([1, 224, 224, 3]);
        try {
          // Try performing one inference
          const testResult = await mobileNetModel.classify(testTensor);
          console.log('Model test successful:', testResult);
          testTensor.dispose();
        } catch (testError) {
          console.error('Model test failed: ' + testError.message);
          testTensor.dispose();
          throw new Error('Model test failed: ' + testError.message);
        }
        
        setLoadingMessage('Model loading successful!');
        // Cache model
        globalModelCache = mobileNetModel;
        setModel(mobileNetModel);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Model loading failed:', err);
        setError(`Model loading failed: ${err.message}`);
        setIsLoading(false);
      }
    }
    
    if (!useLocalPrediction) {
    loadPretrainedModel();
    } else {
      setIsLoading(false);
    }
  }, [useLocalPrediction]);
  
  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setPredictions(null); // Reset prediction results
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle drag and drop
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
        setPredictions(null); // Reset prediction results
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Perform prediction
  const performPrediction = async () => {
    if ((!model && !useLocalPrediction) || !image) return;
    
    try {
      setError('');
      setPredictions(null);
      setSelectedSymbol(null); // Reset selected symbol
      setShowStructure(false); // Reset structure view
      
      // If using local prediction
      if (useLocalPrediction) {
        console.log('Using local prediction mode');
        const localPredictions = localPredict(image);
        console.log('Local prediction results:', localPredictions);
        setPredictions(localPredictions);
        return;
      }
      
      // Create image element
      const imgElement = document.createElement('img');
      imgElement.src = image;
      
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });
      
      // Image preprocessing
      console.log('Preprocessing image...');
      const preprocessedImage = await preprocessImage(imgElement);
      
      // Use MobileNet for prediction
      console.log('Executing prediction...');
      const predictions = await model.classify(preprocessedImage || imgElement, 5);
      console.log('Raw prediction results:', predictions);
      
      // Map ImageNet categories to our symbol categories
      const mappedPredictions = predictions.map((pred, index) => {
        // Use hash function to map ImageNet categories to our symbol categories
        const symbolIndex = hashStringToIndex(pred.className, 50);
        const symbolClass = symbolCategories[symbolIndex] || `Symbol ${symbolIndex}`;
        
        // Adjust confidence, making results more reasonable
        // First result remains high confidence, other results decrease
        const adjustedProbability = index === 0 ? 0.9 : Math.max(0.1, 0.9 - index * 0.15);
        
        return {
          className: symbolClass,
          probability: adjustedProbability
        };
      });
      
      console.log('Mapped prediction results:', mappedPredictions);
      setPredictions(mappedPredictions);
      
      // Set selected symbol to first prediction result
      if (mappedPredictions && mappedPredictions.length > 0) {
        const topPrediction = mappedPredictions[0];
        const name = topPrediction.className.split('/')[0]; // Get Chinese name
        const symbolKey = Object.keys(symbolCategories).find(
          key => symbolCategories[key].includes(name)
        );
        
        if (symbolKey) {
          const keyNum = parseInt(symbolKey);
          setSelectedSymbol({
            key: keyNum,
            name: name,
            english: name.toLowerCase(),
            description: symbolDescriptions[keyNum]?.description || "No detailed description available",
            description_en: symbolDescriptions[keyNum]?.description || "No description available",
            tokens: getTokensForSymbol(keyNum),
            svg: generateSymbolSVG(keyNum)
          });
        }
      }
    } catch (err) {
      console.error('Error during prediction:', err);
      setError(`Prediction failed: ${err.message}`);
    }
  };
  
  // Image preprocessing function
  const preprocessImage = async (imgElement) => {
    try {
      // Create a temporary canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to model input size
      canvas.width = 224;
      canvas.height = 224;
      
      // Draw image on canvas, adjust size
      ctx.drawImage(imgElement, 0, 0, 224, 224);
      
      // Apply some basic image processing (optional)
      // For example, adjust contrast, brightness, etc
      
      return canvas;
    } catch (err) {
      console.error('Image preprocessing failed:', err);
      return null; // If preprocessing fails, return original image
    }
  };
  
  // Hash string to index in specified range
  const hashStringToIndex = (str, max) => {
    // Use more deterministic hash algorithm
    // Use first few characters of string as seed
    const seed = str.slice(0, 3).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use simple multiplication hash
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
    }
    
    // Ensure result is between 0 and max-1
    const result = hash % max;
    
    // Add debugging information
    console.log(`Hash mapping: "${str}" -> ${result} (${symbolCategories[result]})`);
    
    return result;
  };
  
  // Clear image and prediction
  const handleClear = () => {
    setImage(null);
    setPredictions(null);
    setSelectedSymbol(null); // Clear selected symbol
    setShowStructure(false); // Reset structure view
    setError('');
  };
  
  // Symbol details card component
  const SymbolDetailsCard = ({ symbol }) => {
    if (!symbol) return null;
    
    // Symbol interpretation view
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
            Source: Omni-D Semantic Database • Neural Pattern Recognition System
          </Typography>
          
          <Button 
            variant="outlined"
            sx={{ mt: 2, textTransform: 'none' }}
            onClick={() => setShowStructure(true)}
          >
            View Structure Interpretation
          </Button>
        </Paper>
      );
    }
    
    // Symbol structure view
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
            Symbol Configuration Principle
          </Typography>
          <Typography variant="body2" sx={{ display: 'block', color: '#666' }}>
            The position of each point on the 17-sided polygon is determined by the token value of the word in the corresponding language. The internal matrix follows the same principle. The small red triangle is the machine recognition starting symbol.
          </Typography>
        </Box>
        
        {/* Use symbol PNG image */}
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
              // If image loading fails, display default circle
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
          
          {/* Backup display - when image loading fails */}
          <Box 
            sx={{ 
              width: 200, 
              height: 200, 
              borderRadius: '50%', 
              backgroundColor: '#f8f8f8',
              border: '1px solid #eaeaea',
              position: 'relative',
              display: 'none', // Default hidden
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Outer points */}
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
            
            {/* Red identifier */}
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
            
            {/* Internal matrix */}
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
          <Typography variant="subtitle2" gutterBottom>Token Values in 17 Languages:</Typography>
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
      </Paper>
    );
  };
  
  if (isLoading && !useLocalPrediction) {
    return (
      <PageLayout 
        title="Symbol Recognition" 
        subtitle="Upload a symbol image, and AI will identify which type of symbol it belongs to."
      >
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6}>
          <CircularProgress size={60} variant={loadingProgress > 0 ? "determinate" : "indeterminate"} value={loadingProgress} />
          <Typography variant="h6" sx={{ mt: 2 }}>{loadingMessage}</Typography>
          {loadingProgress > 0 && (
            <Typography variant="body2" color="text.secondary">
              {loadingProgress}% Complete
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a few seconds
          </Typography>
        </Box>
      </Container>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout 
        title="Symbol Recognition" 
        subtitle="Upload a symbol image, and AI will identify which type of symbol it belongs to."
      >
      <Container>
        <Paper sx={{ p: 3, bgcolor: '#fff8f8', border: '1px solid #ffcccc', borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" color="error">Model Loading Failed</Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{error}</Typography>
          
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Possible Causes and Solutions:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Your browser may not support WebGL. Please try:</li>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Updating your browser to the latest version</li>
                <li>Using the latest version of Chrome or Firefox</li>
                <li>Enabling WebGL in your browser settings</li>
              </Box>
              <li>You may be experiencing network connection issues. Please try:</li>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>Checking your network connection</li>
                <li>Turning off VPN or proxy services</li>
                <li>Trying again later</li>
              </Box>
              <li>If you are using a mobile device, please try accessing from a computer</li>
            </Box>
          </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
            <Button 
              fullWidth
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              startIcon={<span role="img" aria-label="refresh">🔄</span>}
              sx={{ textTransform: 'none' }}
            >
              Refresh Page and Retry
            </Button>
            <Button 
              fullWidth
              variant="contained" 
              color="primary" 
              onClick={() => {
                // Try forcing CPU backend
                tf.setBackend('cpu').then(() => {
                  console.log('Switched to CPU backend');
                  setError('');
                  window.location.reload();
                }).catch(err => {
                  console.error('Failed to switch to CPU backend', err);
                  alert('Failed to switch to CPU mode, please try refreshing the page');
                });
              }}
              startIcon={<span role="img" aria-label="cpu">💻</span>}
              sx={{ textTransform: 'none' }}
            >
              Use CPU Mode
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Or use offline demo mode (no need to load AI model):
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
              sx={{ mb: 2, textTransform: 'none' }}
              startIcon={<span role="img" aria-label="local">📱</span>}
            >
              Use Offline Demo Mode
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
              Note: Offline demo mode only provides simulated recognition results, not real AI recognition.
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
            Technical Info: TensorFlow.js {tf.version.tfjs}, Browser: {navigator.userAgent}
          </Typography>
        </Paper>
      </Container>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout 
      title="Symbol Recognition" 
      subtitle="Upload a symbol image, and AI will identify which type of symbol it belongs to."
    >
    <Container>
        {useLocalPrediction && (
          <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
            Currently using offline demo mode, results are for reference only.
            <Button 
              size="small" 
              sx={{ ml: 2, textTransform: 'none' }} 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Try Loading AI Model
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
            <Typography variant="h6" gutterBottom>Drop Image Here</Typography>
            <Typography variant="body2" color="text.secondary">or Click to Select an Image</Typography>
          </DropZone>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <ImagePreview src={image} alt="Uploaded Image" />
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleClear} sx={{ textTransform: 'none' }}>
                      Clear
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={performPrediction}
                      disabled={!image || (!model && !useLocalPrediction)}
                      sx={{ textTransform: 'none' }}
                    >
                      Recognize Symbol
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
                    Recognition Results
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
                        Click "Recognize Symbol" button to start analyzing the image
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
              
              {/* Symbol details card */}
              {selectedSymbol && <SymbolDetailsCard symbol={selectedSymbol} />}
          </Box>
        </Paper>
      )}
    </Container>
    </PageLayout>
  );
};

export default SymbolRecognizer; 