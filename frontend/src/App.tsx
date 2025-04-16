import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import './App.css';

// Context for theme mode
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

function App() {
  // State for managing theme mode
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  // Color mode context value
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode]
  );

  // Select theme based on mode
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<div>FoodPal Home Page</div>} />
            <Route path="/meals" element={<div>Meal Planner</div>} />
            <Route path="/recipes" element={<div>Recipe Management</div>} />
            <Route path="/ingredients" element={<div>Ingredient Management</div>} />
            <Route path="/shopping" element={<div>Shopping List</div>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
