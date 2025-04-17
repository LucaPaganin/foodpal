import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { CircularProgress, Box } from '@mui/material';
import oidcAuthService from '../../services/oidcAuthService';

/**
 * ProtectedRoute component that checks if the user is authenticated
 * before rendering child components
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAppSelector((state) => state.user);
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Double-check with OIDC service to ensure token is valid
        const isValid = await oidcAuthService.isAuthenticated();
        setIsAuthorized(isValid);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthorized(false);
      } finally {
        setChecking(false);
      }
    };
    
    if (!loading) {
      checkAuth();
    }
  }, [loading]);
  
  // Show loading spinner while checking authentication
  if (loading || checking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If authenticated (from Redux) and authorized (from OIDC), render children
  if (isAuthenticated && isAuthorized) {
    return <>{children}</>;
  }
  
  // Otherwise, redirect to login page, preserving the intended destination
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
