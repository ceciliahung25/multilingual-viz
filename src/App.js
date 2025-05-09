import React from 'react';
import Home from './components/Home';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    primary: {
      main: '#000000',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}

export default App;
