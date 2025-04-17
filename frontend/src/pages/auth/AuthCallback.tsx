import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { loginSuccess } from '../../store/slices/userSlice';
import oidcAuthService, { AppUser } from '../../services/oidcAuthService';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Complete the authentication process
        const user = await oidcAuthService.handleLoginCallback();
        
        if (user) {
          // Convert OIDC user to app user
          const appUser: AppUser = oidcAuthService.mapOidcUserToAppUser(user);
          
          // Update Redux state
          dispatch(loginSuccess(appUser));
          
          // Redirect to home page or original destination
          navigate('/');
        } else {
          throw new Error('Authentication failed: No user returned');
        }
      } catch (err) {
        setError('Authentication failed. Please try again.');
        console.error('Auth callback error:', err);
      }
    };
    
    handleCallback();
  }, [navigate, dispatch]);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400 }}>
        {error ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please try logging in again or contact support if the problem persists.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Completing authentication...</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AuthCallback;
