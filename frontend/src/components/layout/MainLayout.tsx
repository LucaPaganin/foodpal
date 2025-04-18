import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, useTheme } from '@mui/material';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import UserDisplay from '../auth/UserDisplay';
import { useTranslation } from 'react-i18next';

export interface MainLayoutProps {
  children?: React.ReactNode; // Make children optional
}

const MainLayout = (props: MainLayoutProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FoodPal
          </Typography>
          <LanguageSwitcher />
          <ThemeToggle />
          <UserDisplay />
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ 
        flexGrow: 1, 
        py: 3,
        bgcolor: theme.palette.background.default
      }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ 
        py: 2, 
        textAlign: 'center',
        bgcolor: theme.palette.background.paper
      }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} FoodPal
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
