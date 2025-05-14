# Multilingual Visualization Platform

A comprehensive interactive platform for visualizing multilingual data representations, token generation, and symbol recognition. The application showcases the relationships between languages, words, and their computational representations through intuitive and visually engaging interfaces.

## Project Overview

This platform integrates multiple visualization tools that demonstrate how language tokens and symbols can be represented across different languages and writing systems. Key features include:

- **Token Generation**: Create visual representations of words across 17 languages
- **Sentence Composition**: Build sentences and visualize their multilingual token patterns
- **Name Visualizer**: Generate personalized symbols from letters
- **Symbol Recognition**: Identify 50 different symbolic representations using TensorFlow.js
- **Space Scene Gallery**: Visual exploration of space-themed symbols and signs

## Technologies Used

- **Frontend**: React 19, Material UI 7
- **Visualization**: D3.js for custom data visualizations
- **Machine Learning**: TensorFlow.js for browser-based symbol recognition
- **Cryptography**: CryptoJS for creating consistent hashing patterns
- **Styling**: CSS with responsive design for various screen sizes

## Project Structure

```
multilingual-viz/
├── public/                       # Static assets
│   ├── images/                   # Image resources for the application
│   ├── reference/                # Reference data files for visualizations
│   │   ├── Final_Multilingual_OneHot_Table.csv    # One-hot encoded language data
│   │   ├── Final_Multilingual_TokenID_Table.csv   # Token ID data for 17 languages
│   │   ├── words_tokens_cleaned.csv               # Word and token mappings
│   │   └── symbols_50/                            # 50 reference symbols for recognition
│   └── web_model/                # TensorFlow.js model for symbol recognition
│       ├── model.json            # Model architecture
│       └── group*-shard*.bin     # Model weights
├── src/
│   ├── components/
│   │   ├── TokenGenerator/       # Word token visualization module
│   │   ├── NameVisualizer.jsx    # Character-based identity visualization
│   │   ├── PuzzleSentence.jsx    # Multilingual sentence visualization
│   │   ├── SentenceComposer.jsx  # Drag-and-drop sentence building
│   │   ├── SpaceGallery.jsx      # Space-themed symbol gallery
│   │   ├── SymbolRecognizer.jsx  # AI-powered symbol recognition
│   │   └── Sidebar.jsx           # Application navigation
│   ├── App.jsx                   # Main application component
│   └── index.js                  # Application entry point
└── package.json                  # Project dependencies
```

## Features

### Token Generator
Visualizes how different words are represented as tokens across 17 languages. The module generates unique visual patterns based on token IDs from multilingual embeddings.

- Select source language and word
- Generate visualization showing token patterns
- Displays 17-sided polygon with unique pattern for each word

### Sentence Composer
An interactive tool for building sentences by dragging subject, verb, and object components. Each sentence creates a composite visualization of the multilingual token patterns.

- Drag-and-drop sentence building
- Real-time visualization updates
- Supports both English and Chinese interfaces

### Name Visualizer
Creates personalized symbols from letters using token IDs associated with each character.

- Interactive letter selection
- Creates layered 17-sided polygons
- Generates unique identity marks from letter combinations

### Symbol Recognition
AI-powered recognition system capable of identifying 50 different symbolic representations.

- Browser-based machine learning using TensorFlow.js
- Upload or drag-and-drop images for recognition
- Real-time prediction with confidence scores
- Displays top 5 most likely matches

### Space Gallery
A visual exploration of space-themed signs and symbols, showcasing different symbolic representations used in space environments.

- Collection of space-themed symbols
- Visual reference for standard space signage
- Interactive gallery layout

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/username/multilingual-viz.git
   cd multilingual-viz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit: `http://localhost:3000`

## Using the Platform

### Token Generator
1. Select a language from the dropdown menu
2. Choose a word from the available options
3. Click "Generate Visualization" to create a unique token pattern

### Sentence Composer
1. Select a language (English or Chinese)
2. Drag subject, verb, and object words to their respective slots
3. Observe the generated visualization change in real-time

### Name Visualizer
1. Drag uppercase or lowercase letters into the four slots
2. See your unique identity symbol generated from the letter combination

### Symbol Recognition
1. Upload an image or drag and drop it onto the designated area
2. The system will process the image and display the top matching symbols
3. Each prediction includes a confidence score

## Development

### Prerequisites
- Node.js 16+
- npm 8+

### Available Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Symbol Recognition Details

The symbol recognition system uses a TensorFlow model converted to TensorFlow.js format for browser-based inference. The model can identify 50 unique symbols with high accuracy.

### Model Architecture
- Input: 224x224 RGB images
- 4 convolutional blocks (each with convolution and pooling layers)
- Fully connected layers with dropout
- 50-class output layer (Softmax activation)

### Image Processing
1. Resize input image to 224x224
2. Normalize pixel values (0-1)
3. Apply TensorFlow.js preprocessing

### Prediction Flow
1. Load the TensorFlow.js model
2. Preprocess the uploaded image
3. Run inference to get prediction scores
4. Display top matches with confidence percentages

## Data Structure

The application uses several data files for visualization:

- `Final_Multilingual_TokenID_Table.csv`: Maps words to token IDs across 17 languages
- `Final_Multilingual_OneHot_Table.csv`: One-hot encoded representations for words
- `words_tokens_cleaned.csv`: Cleaned dataset of words and their tokens

## Browser Compatibility

The application is tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Mobile browsers are supported with responsive design accommodations.

## Credits

- TensorFlow.js - https://www.tensorflow.org/js
- D3.js - https://d3js.org/
- React - https://reactjs.org/
- Material UI - https://mui.com/

## License

This project is licensed under the MIT License - see the LICENSE file for details.
