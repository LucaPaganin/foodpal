import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers from slices
// We'll add these as we build out features
// import mealsReducer from './slices/mealsSlice';
// import ingredientsReducer from './slices/ingredientsSlice';
// import recipesReducer from './slices/recipesSlice';
// import shoppingReducer from './slices/shoppingSlice';
// import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    // We'll add reducers as we build features
    // meals: mealsReducer,
    // ingredients: ingredientsReducer,
    // recipes: recipesReducer,
    // shopping: shoppingReducer,
    // user: userReducer,
  },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
