import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  autoHideDuration?: number;
}

interface UiState {
  darkMode: boolean;
  language: 'en' | 'it';
  notifications: Notification[];
  isOnline: boolean;
  isAppLoading: boolean;
}

const initialState: UiState = {
  darkMode: false,
  language: 'en',
  notifications: [],
  isOnline: navigator.onLine,
  isAppLoading: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'it'>) => {
      state.language = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      state.isAppLoading = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  setLanguage,
  addNotification,
  removeNotification,
  clearAllNotifications,
  setOnlineStatus,
  setAppLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
