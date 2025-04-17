import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Box,
  Typography,
  Grid,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { RootState, AppDispatch } from '../../../store';
import { 
  Meal,
  MealType,
  addMealToPlanner,
  createMeal
} from '../../../store/slices/mealsSlice';

interface MealPlannerDialogProps {
  open: boolean;
  onClose: () => void;
  day: Date;
  mealType: MealType;
}

const MealPlannerDialog: React.FC<MealPlannerDialogProps> = ({
  open,
  onClose,
  day,
  mealType
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { meals, loading } = useSelector((state: RootState) => state.meals);
  
  // Local state
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [createNewMeal, setCreateNewMeal] = useState<boolean>(false);
  const [newMealName, setNewMealName] = useState<string>('');
  const [servingCount, setServingCount] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{
    mealId?: string;
    mealName?: string;
  }>({});
  // Handle selecting an existing meal
  const handleMealSelect = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedMealId(value);
    
    if (value === 'new') {
      setCreateNewMeal(true);
    } else {
      setCreateNewMeal(false);
      setErrors({ ...errors, mealId: undefined });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const newErrors: {
      mealId?: string;
      mealName?: string;
    } = {};
    
    if (!selectedMealId && !createNewMeal) {
      newErrors.mealId = t('Please select a meal') as string;
    }
    
    if (createNewMeal && !newMealName.trim()) {
      newErrors.mealName = t('Please enter a meal name') as string;
    }
    
    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create new meal if needed
    let mealId = selectedMealId;
    
    if (createNewMeal) {
      // Create a new meal first
      const newMeal = {
        name: newMealName,
        mealType,
        categories: [],
        customCategories: [],
        servingCount: 1,
        isFavorite: false
      };
      
      const resultAction = await dispatch(createMeal(newMeal));
      if (createMeal.fulfilled.match(resultAction)) {
        // Get the ID of the newly created meal
        const createdMeal = resultAction.payload as Meal;
        mealId = createdMeal.id;
      } else {
        // Handle error
        return;
      }
    }
    
    // Add meal to planner
    const mealPlanEntry = {
      mealId,
      plannedDate: format(day, 'yyyy-MM-dd'),
      mealType,
      servingCount,
      notes: notes.trim() || undefined,
      status: 'planned' as const
    };
    
    await dispatch(addMealToPlanner(mealPlanEntry));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('Add Meal to Planner')}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" component="div">
            {format(day, 'PPPP')} - {t(mealType)}
          </Typography>
        </Box>
        
        {!createNewMeal ? (
          <FormControl fullWidth error={!!errors.mealId} sx={{ mb: 3 }}>
            <InputLabel id="meal-select-label">{t('Select Meal')}</InputLabel>
            <Select
              labelId="meal-select-label"
              id="meal-select"
              value={selectedMealId}
              onChange={handleMealSelect}
              label={t('Select Meal')}
            >
              <MenuItem value="new">{t('Create New Meal')}</MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                  {t('Existing Meals')}
                </Typography>
              </MenuItem>
              {meals.map((meal) => (
                <MenuItem key={meal.id} value={meal.id}>
                  {meal.name}
                </MenuItem>
              ))}
            </Select>
            {errors.mealId && <FormHelperText>{errors.mealId}</FormHelperText>}
          </FormControl>
        ) : (
          <TextField
            fullWidth
            label={t('New Meal Name')}
            value={newMealName}
            onChange={(e) => setNewMealName(e.target.value)}
            error={!!errors.mealName}
            helperText={errors.mealName}
            sx={{ mb: 2 }}
          />
        )}
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Box>
            <TextField
              fullWidth
              type="number"
              label={t('Servings')}
              value={servingCount}
              onChange={(e) => setServingCount(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
          </Box>
          <Box>
            {createNewMeal && (
              <FormControl fullWidth>
                <InputLabel>{t('Meal Type')}</InputLabel>
                <Select
                  value={mealType}
                  label={t('Meal Type')}
                  disabled
                >
                  <MenuItem value="breakfast">{t('breakfast')}</MenuItem>
                  <MenuItem value="lunch">{t('lunch')}</MenuItem>
                  <MenuItem value="dinner">{t('dinner')}</MenuItem>
                  <MenuItem value="snack">{t('snack')}</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Grid>
        
        <TextField
          fullWidth
          label={t('Notes')}
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {createNewMeal ? t('Create & Add to Plan') : t('Add to Plan')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MealPlannerDialog;
