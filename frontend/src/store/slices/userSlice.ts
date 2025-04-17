import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
  } | null;
  households: string[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  households: [],
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{
      id: string;
      username: string;
      email: string;
      fullName?: string;
    }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.households = [];
    },
    setUserHouseholds: (state, action: PayloadAction<string[]>) => {
      state.households = action.payload;
    },
    checkAuthStatus: (state) => {
      // Check if user has a valid token in storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        state.isAuthenticated = false;
        state.user = null;
        return;
      }
      
      // In a real app, this would verify the token with your backend
      // For now, we'll just assume it's valid
      try {
        // Mock user data - in a real app this would be decoded from the token
        state.isAuthenticated = true;
        if (!state.user) {
          state.user = {
            id: '123',
            username: 'user123',
            email: 'user@example.com',
            fullName: 'Test User'
          };
        }
      } catch (error) {
        // Token invalid
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{
      id: string;
      username: string;
      email: string;
      fullName?: string;
    }>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const {
  setLoading,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUserHouseholds,
  checkAuthStatus,
  registerStart,
  registerSuccess,
  registerFailure
} = userSlice.actions;

export default userSlice.reducer;
