import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers from slices
import mealsReducer from './slices/mealsSlice';
import ingredientsReducer from './slices/ingredientsSlice';
// import recipesReducer from './slices/recipesSlice';
// import shoppingReducer from './slices/shoppingSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    meals: mealsReducer,
    ingredients: ingredientsReducer,
    // recipes: recipesReducer,
    // shopping: shoppingReducer,
    user: userReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginWithRedirect'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.notifications'],
      },
    }),
});

// Export types for TypeScript usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
