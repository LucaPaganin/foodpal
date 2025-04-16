import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Link,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/userSlice';

// Ensure this file is treated as a module
export {};

// This would be replaced with an actual API call
const mockSignupApi = async (email: string, password: string, fullName: string) => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation - in real app this would be server-side
  if (email && password && fullName) {
    return {
      id: '456',
      username: email.split('@')[0],
      email,
      fullName
    };
  } else {
    throw new Error('Please fill out all fields');
  }
};

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateForm = () => {
    if (password !== confirmPassword) {
      setPasswordError(String(t('auth.passwordsDoNotMatch') || 'Passwords do not match'));
      return false;
    }
    if (password.length < 8) {
      setPasswordError(String(t('auth.passwordTooShort') || 'Password must be at least 8 characters'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      dispatch(loginStart());
      const user = await mockSignupApi(email, password, fullName);
      dispatch(loginSuccess(user));
      
      // Save token to sessionStorage
      sessionStorage.setItem('authToken', 'mock-jwt-token');
      
      // Redirect to dashboard/home page
      navigate('/');
    } catch (error) {
      dispatch(loginFailure(error instanceof Error ? error.message : 'Signup failed'));
    }
  };
  
  const handleAzureSignup = () => {
    // Will implement Azure AD B2C authentication
    console.log('Azure AD B2C signup clicked');
  };
  
  const handleGoogleSignup = () => {
    // Will implement Google OAuth authentication
    console.log('Google signup clicked');
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('auth.signup')}
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
              id="fullName"
              label={t('auth.fullName') || 'Full Name'}
              name="fullName"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.email') || 'Email'}
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password') || 'Password'}
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              error={!!passwordError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label={t('auth.confirmPassword') || 'Confirm Password'}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={!!passwordError}
            />
            {passwordError && (
              <FormHelperText error>{passwordError}</FormHelperText>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.signup') || 'Sign Up'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {t('auth.alreadyHaveAccount') || 'Already have an account? Sign in'}
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.orContinueWith') || 'Or continue with'}
            </Typography>
          </Divider>
          
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={handleAzureSignup}
              disabled={loading}
            >
              Microsoft
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
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

export default SignupPage;
