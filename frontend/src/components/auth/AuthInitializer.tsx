import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../store';
import { loginSuccess, loginFailure, setLoading } from '../../store/slices/userSlice';
import oidcAuthService from '../../services/oidcAuthService';

/**
 * Component that initializes authentication state from OIDC user manager on app load
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setLoading(true));
      try {
        // Check if there's a valid user session
        const user = await oidcAuthService.getUser();
        
        if (user && !user.expired) {
          // User is authenticated, update Redux state
          const appUser = oidcAuthService.mapOidcUserToAppUser(user);
          dispatch(loginSuccess(appUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch(loginFailure('Error initializing authentication'));
      } finally {
        dispatch(setLoading(false));
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Show nothing until auth is initialized
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthInitializer;
