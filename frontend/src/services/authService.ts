import axios from 'axios';

// Type definitions for external libraries
// Using the google property type from the global types file
// No need to redeclare the Window interface here since it's already defined in google.d.ts

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
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for consistency
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

// Main auth service
const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/token', {
        username: credentials.email, // FastAPI OAuth expects 'username'
        password: credentials.password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const { access_token } = response.data;
      
      // Store token
      localStorage.removeItem('authToken');
      sessionStorage.setItem('authToken', access_token);
      
      // Get user profile
      return await this.getCurrentUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axiosInstance.post<User>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        full_name: credentials.fullName
      });
      
      // Login after successful registration
      return await this.login({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    // No need to call the backend for logout as we're using stateless JWT
  },
  
  /**
   * Get the current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  },
  
  /**
   * Azure AD B2C login
   */
  initiateAzureLogin() {
    // Azure AD B2C configuration
    const tenantName = process.env.REACT_APP_AZURE_B2C_TENANT || 'foodpalauth';
    const clientId = process.env.REACT_APP_AZURE_B2C_CLIENT_ID || '11111111-1111-1111-1111-111111111111';
    const signInPolicy = process.env.REACT_APP_AZURE_B2C_SIGNIN_POLICY || 'B2C_1_signupsignin';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/azure/callback');
    const scopes = encodeURIComponent('openid profile email'); // Add additional scopes as needed
    
    // Construct authorization URL
    const authUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${signInPolicy}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&response_mode=query&state=${this.generateRandomState()}&nonce=${this.generateRandomNonce()}`;
    
    // Redirect to Azure AD B2C login page
    window.location.href = authUrl;
  },
  
  /**
   * Handle Azure AD B2C callback
   */
  async handleAzureCallback(code: string): Promise<User> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/azure/callback', { code });
      
      const { access_token } = response.data;
      
      // Store token
      localStorage.removeItem('authToken');
      sessionStorage.setItem('authToken', access_token);
      
      // Get user profile
      return await this.getCurrentUser();
    } catch (error) {
      console.error('Azure B2C callback error:', error);
      throw error;
    }
  },
  
  /**
   * Initialize Google OAuth client
   */
  async initGoogleAuth(): Promise<any> {

    // Check if Google OAuth script is already loaded
    if (window.google?.accounts?.id) {
      return window.google.accounts.id;
    }
    
    // Return Promise that resolves when Google OAuth script is loaded
    return new Promise((resolve, reject) => {
      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;
      googleScript.onload = () => {
        if (window.google?.accounts?.id) {
          resolve(window.google.accounts.id);
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      };
      googleScript.onerror = (error) => reject(error);
      document.body.appendChild(googleScript);
    });
  },
  
  /**
   * Initialize Google OAuth
   */
  async setupGoogleLogin(callback: (user: User) => void): Promise<void> {
    try {
      const googleAuth = await this.initGoogleAuth();
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '222222222222-22222222222222222222222222222222.apps.googleusercontent.com';
      
      googleAuth.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            // The response contains the ID token
            const idToken = response.credential;
            
            // Send the token to your backend
            const apiResponse = await axiosInstance.post<AuthResponse>('/auth/google/callback', { id_token: idToken });
            
            const { access_token } = apiResponse.data;
            
            // Store token
            localStorage.removeItem('authToken');
            sessionStorage.setItem('authToken', access_token);
            
            // Get user profile and trigger callback
            const user = await this.getCurrentUser();
            callback(user);
          } catch (error) {
            console.error('Google authentication error:', error);
          }
        },
        auto_select: false
      });
    } catch (error) {
      console.error('Error setting up Google login:', error);
    }
  },
  
  /**
   * Display Google Sign-In button
   */
  renderGoogleButton(buttonId: string): void {
    this.initGoogleAuth().then((googleAuth) => {
      googleAuth.renderButton(
        document.getElementById(buttonId)!,
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }).catch((error) => {
      console.error('Error rendering Google button:', error);
    });
  },
  
  /**
   * Programmatically initiate Google login
   */
  initiateGoogleLogin(): void {
    // Find the Google Sign-In button that was rendered on the page
    const googleButtons = document.querySelectorAll('[id^="google-signin-"] div[role="button"]');
    
    if (googleButtons && googleButtons.length > 0) {
      // Click the button to trigger Google's OAuth flow
      (googleButtons[0] as HTMLElement).click();
    } else {
      // If no button is found, try to initialize and prompt the login
      this.initGoogleAuth().then((googleAuth) => {
        googleAuth.prompt();
      }).catch((error) => {
        console.error('Error initiating Google login:', error);
        throw new Error('Failed to initiate Google login');
      });
    }
  },
  
  /**
   * Generate random state for OAuth security
   */
  generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  /**
   * Generate random nonce for OAuth security
   */
  generateRandomNonce(): string {
    return Math.random().toString(36).substring(2, 10);
  }
};

export default authService;
