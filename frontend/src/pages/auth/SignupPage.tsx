import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Link,
  CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { loginStart, loginFailure } from '../../store/slices/userSlice';
import oidcAuthService from '../../services/oidcAuthService';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  
  const handleSignup = async () => {
    try {
      dispatch(loginStart());
      
      // In OIDC flow with Azure B2C, signup and signin use the same flow
      // The B2C policy determines whether to show signup or signin UI
      await oidcAuthService.login();
      
      // Success handling is done in the callback
    } catch (error) {
      console.error('Signup error:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : 'Signup failed'));
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
          
          <Box sx={{ mt: 3, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSignup}
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.signup')}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 1 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {t('auth.alreadyHaveAccount') || 'Already have an account? Sign in'}
              </Link>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            {t('auth.ssoExplanation') || "Create an account with Microsoft or Google through our secure sign-up page."}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
