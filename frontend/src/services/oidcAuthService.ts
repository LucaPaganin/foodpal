// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import axios from 'axios';
import { authConfig } from './authConfig';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add an interceptor to automatically add auth token to requests
// @ts-ignore - Suppressing TypeScript errors with async functions in axios interceptors
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = await oidcAuthService.getUser();
    if (user?.access_token && config.headers) {
      config.headers['Authorization'] = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add an interceptor to handle expired tokens
// @ts-ignore - Suppressing TypeScript errors with async functions in axios interceptors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to renew the token silently
        await oidcAuthService.renewToken();
        // Get the new token
        const user = await oidcAuthService.getUser();
        // Update the authorization header
        if (user?.access_token) {
          originalRequest.headers['Authorization'] = `Bearer ${user.access_token}`;
        }
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (renewError) {
        // If renewal fails, redirect to login
        oidcAuthService.login();
        return Promise.reject(renewError);
      }
    }
    return Promise.reject(error);
  }
);

// Interface for our app's user model
export interface AppUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
}

// Class to handle OIDC authentication
class OidcAuthService {
  private userManager: UserManager;
  
  constructor() {
    // Initialize UserManager with configuration
    this.userManager = new UserManager({
      ...authConfig,
      userStore: new WebStorageStateStore({ store: localStorage })
    });
    
    // Set up event listeners
    this.userManager.events.addUserLoaded((user) => {
      console.log('User loaded', user);
    });
    
    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error', error);
    });
    
    this.userManager.events.addUserSignedOut(() => {
      console.log('User signed out');
      this.userManager.removeUser();
    });
  }
  
  /**
   * Initiate the login process
   * @param provider Optional provider name ('google' or 'microsoft') for specific SSO flows
   */
  public login(provider?: 'google' | 'microsoft'): Promise<void> {
    // Add provider-specific extra parameters if provider is specified
    const extraQueryParams = provider ? { 
      ...authConfig.extraQueryParams,
      identity_provider: provider 
    } : authConfig.extraQueryParams;
    
    return this.userManager.signinRedirect({ extraQueryParams });
  }
  
  /**
   * Handle the login callback
   */
  public async handleLoginCallback(): Promise<User | null> {
    try {
      const user = await this.userManager.signinRedirectCallback();
      return user;
    } catch (error) {
      console.error('Error handling login callback:', error);
      return null;
    }
  }
  
  /**
   * Get the current authenticated user
   */
  public getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }
  
  /**
   * Convert OIDC user to app user
   */
  public mapOidcUserToAppUser(oidcUser: User): AppUser {
    return {
      id: oidcUser.profile.sub || '',
      username: oidcUser.profile.preferred_username || oidcUser.profile.email || '',
      email: oidcUser.profile.email || '',
      fullName: oidcUser.profile.name
    };
  }
  
  /**
   * Get current user profile converted to AppUser
   */
  public async getCurrentUser(): Promise<AppUser | null> {
    const oidcUser = await this.getUser();
    if (!oidcUser) return null;
    
    return this.mapOidcUserToAppUser(oidcUser);
  }
  
  /**
   * Renew the token silently
   */
  public renewToken(): Promise<User | null> {
    return this.userManager.signinSilent();
  }
  
  /**
   * Log out the current user
   */
  public logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }
  
  /**
   * Check if the user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user && !user.expired;
  }
  
  /**
   * Get the axios instance with auth interceptor
   */
  public getAxiosInstance() {
    return axiosInstance;
  }
}

// Create singleton instance
const oidcAuthService = new OidcAuthService();

export default oidcAuthService;
