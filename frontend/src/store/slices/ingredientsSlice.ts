import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Ensure this file is treated as a module
export {};

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  inStock: boolean;
  quantity?: number;
  unit?: string;
  expiryDate?: string;
}

interface IngredientsState {
  ingredients: Ingredient[];
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: IngredientsState = {
  ingredients: [],
  categories: ['Dairy', 'Meat', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Other'],
  loading: false,
  error: null,
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.ingredients = action.payload;
    },
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      state.ingredients.push(action.payload);
    },
    updateIngredient: (state, action: PayloadAction<Ingredient>) => {
      const index = state.ingredients.findIndex(ingredient => ingredient.id === action.payload.id);
      if (index !== -1) {
        state.ingredients[index] = action.payload;
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(ingredient => ingredient.id !== action.payload);
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
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
  setIngredients, 
  addIngredient, 
  updateIngredient, 
  deleteIngredient, 
  addCategory,
  setLoading, 
  setError 
} = ingredientsSlice.actions;

export default ingredientsSlice.reducer;
