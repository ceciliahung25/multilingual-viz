import SymbolRecognizer from './components/SymbolRecognizer';
import CVSymbolRecognizer from './components/CVSymbolRecognizer';

function App() {
  return (
    <div className={classes.root}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/token-generator" element={<TokenGeneratorPage />} />
          <Route path="/name-visualizer" element={<NameVisualizer />} />
          <Route path="/space-gallery" element={<SpaceGallery />} />
          <Route path="/sentence-composer" element={<SentenceComposer />} />
          <Route path="/symbol-recognizer" element={<SymbolRecognizer />} />
          <Route path="/cv-symbol-recognizer" element={<CVSymbolRecognizer />} />
          <Route path="/puzzle-sentence" element={<PuzzleSentence />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App; 