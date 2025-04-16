import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Ensure this file is treated as a module
export {};

export interface Meal {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  recipeId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  rating?: number;
  notes?: string;
}

interface MealsState {
  meals: Meal[];
  loading: boolean;
  error: string | null;
}

const initialState: MealsState = {
  meals: [],
  loading: false,
  error: null,
};

export const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    setMeals: (state, action: PayloadAction<Meal[]>) => {
      state.meals = action.payload;
    },
    addMeal: (state, action: PayloadAction<Meal>) => {
      state.meals.push(action.payload);
    },
    updateMeal: (state, action: PayloadAction<Meal>) => {
      const index = state.meals.findIndex(meal => meal.id === action.payload.id);
      if (index !== -1) {
        state.meals[index] = action.payload;
      }
    },
    deleteMeal: (state, action: PayloadAction<string>) => {
      state.meals = state.meals.filter(meal => meal.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setMeals, 
  addMeal, 
  updateMeal, 
  deleteMeal, 
  setLoading, 
  setError 
} = mealsSlice.actions;

export default mealsSlice.reducer;
