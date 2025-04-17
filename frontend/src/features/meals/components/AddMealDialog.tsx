import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  fetchMeals,
  createMeal, 
  addMealToPlanner,
  MealType,
  MealCategory
} from '../../../store/slices/mealsSlice';
import { AppDispatch, RootState } from '../../../store';

interface AddMealDialogProps {
  open: boolean;
  onClose: () => void;
  date: Date;
  mealType: MealType;
}

const AddMealDialog: React.FC<AddMealDialogProps> = ({ 
  open, 
  onClose,
  date,
  mealType 
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { meals, loading } = useSelector((state: RootState) => state.meals);
  
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [createNewMeal, setCreateNewMeal] = useState(false);
  const [servingCount, setServingCount] = useState(1);

  // New meal form fields
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [preparationTime, setPreparationTime] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');

  // Available meal categories
  const availableCategories: MealCategory[] = [
    'italian', 'american', 'asian', 'mexican', 'mediterranean',
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'quick',
    'meal_prep', 'comfort_food', 'healthy', 'dessert', 'custom'
  ];

  useEffect(() => {
    // Fetch all meals when the dialog opens
    if (open) {
      dispatch(fetchMeals());
    }
  }, [open, dispatch]);

  const handleSubmit = () => {
    if (createNewMeal) {
      // Create new meal and then add to planner
      const newMeal = {
        name,
        mealType,
        categories,
        customCategories,
        notes: notes || undefined,
        servingCount,
        preparationTimeMinutes: preparationTime || undefined,
        caloriesPerServing: calories || undefined,
        isFavorite
      };
      
      dispatch(createMeal(newMeal))
        .unwrap()
        .then((createdMeal) => {
          dispatch(addMealToPlanner({
            mealId: createdMeal.id,
            plannedDate: format(date, 'yyyy-MM-dd'),
            mealType,
            servingCount,
            status: 'planned'
          }));
          onClose();
        })
        .catch((error) => {
          console.error('Failed to create meal:', error);
        });
    } else if (selectedMealId) {
      // Add existing meal to planner
      dispatch(addMealToPlanner({
        mealId: selectedMealId,
        plannedDate: format(date, 'yyyy-MM-dd'),
        mealType,
        servingCount,
        status: 'planned'
      }))
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch((error) => {
          console.error('Failed to add meal to planner:', error);
        });
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedMealId('');
    setCreateNewMeal(false);
    setServingCount(1);
    setName('');
    setCategories([]);
    setCustomCategories([]);
    setNotes('');
    setIsFavorite(false);
    setPreparationTime('');
    setCalories('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('meals.addMealForDate', { 
          date: format(date, 'EEE, MMM d'), 
          mealType: t(`meals.types.${mealType}`)
        })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={createNewMeal}
                onChange={(e) => setCreateNewMeal(e.target.checked)}
              />
            }
            label={t('meals.createNewMeal')}
          />
        </Box>

        {createNewMeal ? (
          // New meal form
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('meals.name')}
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Autocomplete
              multiple
              id="categories"
              options={availableCategories}
              getOptionLabel={(option) => t(`meals.categories.${option}`)}
              value={categories}
              onChange={(_, newValue) => setCategories(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('meals.categories.title')}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    key={option}
                    label={t(`meals.categories.${option}`)} 
                    {...getTagProps({ index })} 
                  />
                ))
              }
            />

            <TextField
              label={t('meals.customCategories')}
              fullWidth
              placeholder={t('meals.customCategoriesPlaceholder')}
              value={customCategories.join(', ')}
              onChange={(e) => setCustomCategories(e.target.value ? e.target.value.split(',').map(s => s.trim()) : [])}
              helperText={t('meals.customCategoriesHelp')}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('meals.preparationTime')}
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value ? parseInt(e.target.value) : '')}
                InputProps={{ endAdornment: t('common.minutes') }}
                fullWidth
              />
              <TextField
                label={t('meals.caloriesPerServing')}
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : '')}
                InputProps={{ endAdornment: t('common.calories') }}
                fullWidth
              />
            </Box>

            <TextField
              label={t('meals.servingCount')}
              type="number"
              value={servingCount}
              onChange={(e) => setServingCount(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1 }}
              fullWidth
            />

            <TextField
              label={t('common.notes')}
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox 
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                />
              }
              label={t('meals.markAsFavorite')}
            />
          </Box>
        ) : (
          // Existing meal selection
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="meal-select-label">{t('meals.selectMeal')}</InputLabel>
              <Select
                labelId="meal-select-label"
                id="meal-select"
                value={selectedMealId}
                onChange={(e) => setSelectedMealId(e.target.value)}
                label={t('meals.selectMeal')}
              >
                {meals.map((meal) => (
                  <MenuItem key={meal.id} value={meal.id}>
                    {meal.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t('meals.servingCount')}
              type="number"
              value={servingCount}
              onChange={(e) => setServingCount(parseInt(e.target.value) || 1)}
              inputProps={{ min: 1 }}
              fullWidth
            />

            <TextField
              label={t('common.notes')}
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={createNewMeal ? !name : !selectedMealId}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealDialog;
