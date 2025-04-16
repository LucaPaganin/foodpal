import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  Link,
  TextField,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/userSlice';
import authService from '../../services/authService';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      dispatch(loginStart());
      
      const user = await authService.login({
        email: email,
        password: password
      });
      
      dispatch(loginSuccess(user));
      
      // The token is automatically saved by authService
      // If rememberMe is checked, we should store that preference
      if (rememberMe) {
        // Move token from sessionStorage to localStorage for persistence
        const token = sessionStorage.getItem('authToken');
        if (token) {
          localStorage.setItem('authToken', token);
          sessionStorage.removeItem('authToken');
        }
      }
      
      // Redirect to dashboard/home page
      navigate('/');
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Login failed'));
    }
  };
  
  const handleAzureLogin = () => {
    // Initiate Azure AD B2C authentication flow
    authService.initiateAzureLogin();
  };
  
  // Setup Google OAuth
  const [googleButtonId] = useState(`google-signin-${Math.random().toString(36).substring(2, 15)}`);
  
  React.useEffect(() => {
    // Setup Google OAuth login
    authService.setupGoogleLogin((user) => {
      dispatch(loginSuccess(user));
      navigate('/');
    });
    
    // Render the Google sign-in button
    setTimeout(() => {
      const buttonContainer = document.getElementById(googleButtonId);
      if (buttonContainer) {
        authService.renderGoogleButton(googleButtonId);
      }
    }, 1000);
  }, [dispatch, navigate, googleButtonId]);

    const handleGoogleLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the default button behavior
        event.preventDefault();
        
        // Disable the default button click and use the authService to trigger Google login
        // The Google login success callback is already set up in the useEffect hook
        try {
            // We can initiate Google login using the existing authService
            authService.initiateGoogleLogin();
        } catch (error) {
            dispatch(loginFailure(error instanceof Error ? error.message : 'Google login failed'));
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
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label={t('auth.rememberMe')}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                {t('auth.forgotPassword') || "Forgot password?"}
              </Link>
              <Link component={RouterLink} to="/signup" variant="body2">
                {t('auth.dontHaveAccount') || "Don't have an account? Sign up"}
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.orContinueWith') || "Or continue with"}
            </Typography>
          </Divider>
          
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={handleAzureLogin}
              disabled={loading}
            >
              Microsoft
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Google
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
