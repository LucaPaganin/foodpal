import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import oidcAuthService from '../../services/oidcAuthService';

// Meal type definitions
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export type MealCategory = 
  | 'italian'
  | 'american'
  | 'asian'
  | 'mexican'
  | 'mediterranean'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'quick'
  | 'meal_prep'
  | 'comfort_food'
  | 'healthy'
  | 'dessert'
  | 'custom';

export type MealRating = 1 | 2 | 3 | 4 | 5;

export type MealPlanStatus = 'planned' | 'prepared' | 'skipped' | 'replaced';

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  categories: MealCategory[];
  customCategories: string[];
  recipeId?: string;
  notes?: string;
  servingCount: number;
  caloriesPerServing?: number;
  preparationTimeMinutes?: number;
  isFavorite: boolean;
  rating?: MealRating;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  householdId: string;
}

export interface MealPlanEntry {
  id: string;
  mealId: string;
  plannedDate: string;
  mealType: MealType;
  notes?: string;
  status: MealPlanStatus;
  servingCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  householdId: string;
  meal?: Meal; // For joined queries
}

export interface MealRatingEntry {
  id: string;
  mealId: string;
  rating: MealRating;
  comments?: string;
  dateConsumed: string;
  userId: string;
  createdAt: string;
}

interface MealsState {
  meals: Meal[];
  mealPlan: MealPlanEntry[];
  ratings: MealRatingEntry[];
  selectedDate: string | null;
  selectedWeek: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: MealsState = {
  meals: [],
  mealPlan: [],
  ratings: [],
  selectedDate: new Date().toISOString().split('T')[0],
  selectedWeek: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchMeals = createAsyncThunk(
  'meals/fetchMeals',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.get('/meals');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMealPlan = createAsyncThunk(
  'meals/fetchMealPlan',
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.get(
        `/meal-plans?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMeal = createAsyncThunk(
  'meals/createMeal',
  async (newMeal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'householdId'>, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.post('/meals', newMeal);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMeal = createAsyncThunk(
  'meals/updateMeal',
  async ({ id, meal }: { id: string; meal: Partial<Meal> }, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.patch(`/meals/${id}`, meal);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (id: string, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      await axiosInstance.delete(`/meals/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addMealToPlanner = createAsyncThunk(
  'meals/addMealToPlanner',
  async (mealPlanEntry: Omit<MealPlanEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'householdId'>, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.post('/meal-plans', mealPlanEntry);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMealPlanEntry = createAsyncThunk(
  'meals/updateMealPlanEntry',
  async ({ id, entry }: { id: string; entry: Partial<MealPlanEntry> }, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.patch(`/meal-plans/${id}`, entry);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMealPlanEntry = createAsyncThunk(
  'meals/deleteMealPlanEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      await axiosInstance.delete(`/meal-plans/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const rateMeal = createAsyncThunk(
  'meals/rateMeal',
  async (rating: Omit<MealRatingEntry, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const axiosInstance = oidcAuthService.getAxiosInstance();
      const response = await axiosInstance.post('/meal-ratings', rating);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setSelectedWeek: (state, action: PayloadAction<string>) => {
      state.selectedWeek = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meals
      .addCase(fetchMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = action.payload as Meal[];
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch meals';
      })
      
      // Fetch Meal Plan
      .addCase(fetchMealPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlan = action.payload as MealPlanEntry[];
      })
      .addCase(fetchMealPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch meal plan';
      })
      
      // Create Meal
      .addCase(createMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.meals = [...state.meals, action.payload as Meal];
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create meal';
      })
      
      // Update Meal
      .addCase(updateMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMeal = action.payload as Meal;
        state.meals = state.meals.map(meal => 
          meal.id === updatedMeal.id ? updatedMeal : meal
        );
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update meal';
      })
      
      // Delete Meal
      .addCase(deleteMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.loading = false;
        const deletedMealId = action.payload as string;
        state.meals = state.meals.filter(meal => meal.id !== deletedMealId);
        // Also remove any meal plan entries with this meal
        state.mealPlan = state.mealPlan.filter(entry => entry.mealId !== deletedMealId);
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete meal';
      })
      
      // Add Meal to Planner
      .addCase(addMealToPlanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMealToPlanner.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlan = [...state.mealPlan, action.payload as MealPlanEntry];
      })
      .addCase(addMealToPlanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add meal to planner';
      })
      
      // Update Meal Plan Entry
      .addCase(updateMealPlanEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMealPlanEntry.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEntry = action.payload as MealPlanEntry;
        state.mealPlan = state.mealPlan.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        );
      })
      .addCase(updateMealPlanEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update meal plan entry';
      })
      
      // Delete Meal Plan Entry
      .addCase(deleteMealPlanEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMealPlanEntry.fulfilled, (state, action) => {
        state.loading = false;
        const deletedEntryId = action.payload as string;
        state.mealPlan = state.mealPlan.filter(entry => entry.id !== deletedEntryId);
      })
      .addCase(deleteMealPlanEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete meal plan entry';
      })
      
      // Rate Meal
      .addCase(rateMeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateMeal.fulfilled, (state, action) => {
        state.loading = false;
        const newRating = action.payload as MealRatingEntry;
        state.ratings = [...state.ratings, newRating];
        // Update the meal's rating in the meals array if it exists
        const mealId = newRating.mealId;
        const meal = state.meals.find(m => m.id === mealId);
        if (meal) {
          meal.rating = newRating.rating;
        }
      })
      .addCase(rateMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to rate meal';
      });
  },
});

export const { setSelectedDate, setSelectedWeek, clearErrors } = mealsSlice.actions;
export default mealsSlice.reducer;
