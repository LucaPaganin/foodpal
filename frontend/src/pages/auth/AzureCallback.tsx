import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { loginSuccess } from '../../store/slices/userSlice';
import authService from '../../services/authService';
import { CircularProgress, Box, Typography, Paper } from '@mui/material';

const AzureCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code from URL query parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) {
          throw new Error('No authorization code found in the URL');
        }
        
        // Exchange code for token and get user
        const user = await authService.handleAzureCallback(code);
        
        // Update Redux state
        dispatch(loginSuccess(user));
        
        // Redirect to home page or original destination
        const state = location.state as { from?: Location };
        const from = state?.from?.pathname || '/';
        navigate(from);
      } catch (err) {
        setError('Authentication failed. Please try again.');
        console.error('Azure callback error:', err);
      }
    };
    
    handleCallback();
  }, [location, navigate, dispatch]);
  
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

export default AzureCallback;
