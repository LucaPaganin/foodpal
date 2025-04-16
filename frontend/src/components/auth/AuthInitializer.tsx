import * as React from 'react';
import { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { checkAuthStatus } from '../../store/slices/userSlice';

// Ensure file is treated as module
export {};

/**
 * Component that initializes authentication state from localStorage/sessionStorage on app load
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for auth tokens in storage and validate
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
