import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, { loginSuccess } from '../store/slices/userSlice';
import uiReducer from '../store/slices/uiSlice';
import AuthCallback from '../pages/auth/AuthCallback';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import oidcAuthService from '../services/oidcAuthService';

// Mock oidc-client-ts
jest.mock('../services/oidcAuthService', () => ({
  handleLoginCallback: jest.fn(),
  getUser: jest.fn(),
  isAuthenticated: jest.fn(),
  mapOidcUserToAppUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AuthCallback handles successful authentication', async () => {
    // Mock successful auth
    const mockUser = {
      profile: {
        sub: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        preferred_username: 'testuser',
      },
      access_token: 'mock-access-token',
    };
    
    const mockAppUser = {
      id: 'user123',
      email: 'user@example.com',
      username: 'testuser',
      fullName: 'Test User',
    };
    
    oidcAuthService.handleLoginCallback.mockResolvedValue(mockUser);
    oidcAuthService.mapOidcUserToAppUser.mockReturnValue(mockAppUser);
    
    const store = createTestStore();
    
    // Render the auth callback component
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Check loading state
    expect(screen.getByText('Completing authentication...')).toBeInTheDocument();
    
    // Wait for redirect after successful auth
    await waitFor(() => {
      expect(oidcAuthService.handleLoginCallback).toHaveBeenCalled();
      
      // Check that Redux store was updated
      const state = store.getState();
      expect(state.user.isAuthenticated).toBe(true);
      expect(state.user.user).toEqual(mockAppUser);
    });
  });

  test('AuthCallback handles authentication failure', async () => {
    // Mock failed auth
    oidcAuthService.handleLoginCallback.mockRejectedValue(new Error('Auth failed'));
    
    const store = createTestStore();
    
    // Render the auth callback component
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/auth/callback']}>
          <AuthCallback />
        </MemoryRouter>
      </Provider>
    );
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('ProtectedRoute redirects unauthenticated users to login', async () => {
    // Mock unauthenticated state
    oidcAuthService.isAuthenticated.mockResolvedValue(false);
    
    const store = createTestStore({
      user: { isAuthenticated: false, user: null, loading: false, error: null, households: [] }
    });
    
    // Render protected route with unauthenticated user
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  test('ProtectedRoute allows authenticated users', async () => {
    // Mock authenticated state
    oidcAuthService.isAuthenticated.mockResolvedValue(true);
    
    const store = createTestStore({
      user: { 
        isAuthenticated: true, 
        user: { id: 'user123', username: 'testuser', email: 'user@example.com' },
        loading: false, 
        error: null,
        households: [] 
      }
    });
    
    // Render protected route with authenticated user
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    // Should show protected content
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
