import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define light theme options
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#4caf50', // Green for food-related app
      light: '#80e27e',
      dark: '#087f23',
    },
    secondary: {
      main: '#ff9800', // Orange
      light: '#ffc947',
      dark: '#c66900',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
};

// Define dark theme options
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50', // Keep the same primary color for consistency
      light: '#80e27e',
      dark: '#087f23',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
};

// Create and export both themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
