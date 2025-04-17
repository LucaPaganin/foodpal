import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
  Link,
  CircularProgress,
  Stack
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { loginStart, loginFailure } from '../../store/slices/userSlice';
import oidcAuthService from '../../services/oidcAuthService';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  
  const handleLogin = async () => {
    try {
      dispatch(loginStart());
      await oidcAuthService.login();
      // No need for loginSuccess here as it will be handled in the callback
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      dispatch(loginStart());
      await oidcAuthService.login('google');
    } catch (error) {
      console.error('Google login error:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : 'Google login failed'));
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      dispatch(loginStart());
      await oidcAuthService.login('microsoft');
    } catch (error) {
      console.error('Microsoft login error:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : 'Microsoft login failed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('auth.login')}
          </Typography>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          
          <Box sx={{ mt: 3, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.orContinueWith')}
              </Typography>
            </Divider>
            
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MicrosoftIcon />}
                onClick={handleMicrosoftLogin}
                disabled={loading}
              >
                Microsoft
              </Button>
            </Stack>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
              <Link component={RouterLink} to="/signup" variant="body2">
                {t('auth.dontHaveAccount') || "Don't have an account? Sign up"}
              </Link>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {t('auth.ssoExplanation') || "Sign in with your Microsoft or Google account through our secure sign-in page."}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
