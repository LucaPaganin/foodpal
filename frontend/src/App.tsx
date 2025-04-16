import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { lightTheme, darkTheme } from './theme/theme';
import { store, useAppDispatch, useAppSelector } from './store';
import { toggleDarkMode, setOnlineStatus } from './store/slices/uiSlice';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AzureCallback from './pages/auth/AzureCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthInitializer from './components/auth/AuthInitializer';
import './App.css';

// App wrapped with Redux Provider
const AppWithProviders = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

// Context for theme mode
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

function AppContent() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.ui.darkMode);
  
  // State for managing theme mode
  const [mode, setMode] = useState<'light' | 'dark'>(isDarkMode ? 'dark' : 'light');

  // Color mode context value
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        dispatch(toggleDarkMode());
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode, dispatch]
  );

  // Select theme based on mode
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthInitializer>
            <Routes>
              {/* Auth pages without MainLayout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth/azure/callback" element={<AzureCallback />} />
              
              {/* All other pages with MainLayout and protection */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<div>FoodPal Home Page</div>} />
                      <Route path="/meals" element={<div>Meal Planner</div>} />
                      <Route path="/recipes" element={<div>Recipe Management</div>} />
                      <Route path="/ingredients" element={<div>Ingredient Management</div>} />
                      <Route path="/shopping" element={<div>Shopping List</div>} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </AuthInitializer>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default AppWithProviders;
