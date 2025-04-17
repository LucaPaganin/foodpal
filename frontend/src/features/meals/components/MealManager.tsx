import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Grid as MuiGrid, 
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { GridWrapper as Grid } from '../../../components/ui/GridWrapper';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { RootState, AppDispatch } from '../../../store';
import { 
  fetchMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  Meal,
  MealType,
  MealCategory
} from '../../../store/slices/mealsSlice';

const MealManager: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { meals, loading } = useSelector((state: RootState) => state.meals);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [openMealDialog, setOpenMealDialog] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  // Local state for meal form
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<MealType>('dinner');
  const [mealCategories, setMealCategories] = useState<MealCategory[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [servingCount, setServingCount] = useState(4);
  const [preparationTime, setPreparationTime] = useState<number | null>(null);
  const [calories, setCalories] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch meals on component mount
  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);
  
  // Reset form when dialog closes
  const resetForm = () => {
    setMealName('');
    setMealType('dinner');
    setMealCategories([]);
    setCustomCategories([]);
    setServingCount(4);
    setPreparationTime(null);
    setCalories(null);
    setNotes('');
    setIsFavorite(false);
  };
  
  // Handle opening the meal dialog for creating a new meal
  const handleOpenCreateDialog = () => {
    resetForm();
    setEditingMeal(null);
    setOpenMealDialog(true);
  };
  
  // Handle opening the meal dialog for editing an existing meal
  const handleOpenEditDialog = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.name);
    setMealType(meal.mealType);
    setMealCategories(meal.categories || []);
    setCustomCategories(meal.customCategories || []);
    setServingCount(meal.servingCount);
    setPreparationTime(meal.preparationTimeMinutes || null);
    setCalories(meal.caloriesPerServing || null);
    setNotes(meal.notes || '');
    setIsFavorite(meal.isFavorite);
    setOpenMealDialog(true);
  };
  
  // Handle deleting a meal
  const handleDeleteMeal = (mealId: string) => {
    if (window.confirm(String(t('Are you sure you want to delete this meal?')))) {
      dispatch(deleteMeal(mealId));
    }
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (meal: Meal) => {
    dispatch(updateMeal({
      id: meal.id,
      meal: {
        isFavorite: !meal.isFavorite
      }
    }));
  };
  
  // Handle saving the meal (create or update)
  const handleSaveMeal = () => {
    const mealData = {
      name: mealName,
      mealType,
      categories: mealCategories,
      customCategories,
      servingCount,
      preparationTimeMinutes: preparationTime || undefined,
      caloriesPerServing: calories || undefined,
      notes: notes || undefined,
      isFavorite
    };
    
    if (editingMeal) {
      dispatch(updateMeal({
        id: editingMeal.id,
        meal: mealData
      }));
    } else {
      dispatch(createMeal(mealData));
    }
    
    setOpenMealDialog(false);
  };
  
  // Filter meals based on search term, type, and category
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || meal.mealType === filterType;
    const matchesCategory = !filterCategory || (meal.categories && meal.categories.includes(filterCategory as MealCategory));
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {t('Meal Library')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            {t('Add New Meal')}
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              label={t('Search Meals')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel>{t('Filter by Type')}</InputLabel>
              <Select
                value={filterType}
                label={t('Filter by Type')}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">{t('All Types')}</MenuItem>
                <MenuItem value="breakfast">{t('breakfast')}</MenuItem>
                <MenuItem value="lunch">{t('lunch')}</MenuItem>
                <MenuItem value="dinner">{t('dinner')}</MenuItem>
                <MenuItem value="snack">{t('snack')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel>{t('Filter by Category')}</InputLabel>
              <Select
                value={filterCategory}
                label={t('Filter by Category')}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">{t('All Categories')}</MenuItem>
                <MenuItem value="italian">{t('italian')}</MenuItem>
                <MenuItem value="american">{t('american')}</MenuItem>
                <MenuItem value="asian">{t('asian')}</MenuItem>
                <MenuItem value="mexican">{t('mexican')}</MenuItem>
                <MenuItem value="mediterranean">{t('mediterranean')}</MenuItem>
                <MenuItem value="vegetarian">{t('vegetarian')}</MenuItem>
                <MenuItem value="vegan">{t('vegan')}</MenuItem>
                <MenuItem value="gluten_free">{t('gluten_free')}</MenuItem>
                <MenuItem value="dairy_free">{t('dairy_free')}</MenuItem>
                <MenuItem value="quick">{t('quick')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredMeals.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            {t('No meals found matching your criteria.')}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredMeals.map((meal) => (
              <Box>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {meal.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(meal)}
                        sx={{ ml: 1 }}
                      >
                        {meal.isFavorite ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t(meal.mealType)} • {t('Serves')} {meal.servingCount}
                    </Typography>
                    
                    {meal.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={meal.rating}
                          readOnly
                          size="small"
                          emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.55 }} />}
                        />
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 1 }}>
                      {meal.categories && meal.categories.map((category) => (
                        <Chip
                          key={category}
                          label={t(category)}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    
                    {meal.preparationTimeMinutes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('Prep Time')}: {meal.preparationTimeMinutes} {t('min')}
                      </Typography>
                    )}
                    
                    {meal.caloriesPerServing && (
                      <Typography variant="body2" color="text.secondary">
                        {meal.caloriesPerServing} {t('calories per serving')}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Tooltip title={t('Edit Meal')}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEditDialog(meal)}
                        aria-label={String(t('Edit Meal'))}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('Delete Meal')}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteMeal(meal.id)}
                        aria-label={String(t('Delete Meal'))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Meal Dialog (Create/Edit) */}
      <Dialog
        open={openMealDialog}
        onClose={() => setOpenMealDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingMeal ? t('Edit Meal') : t('Create New Meal')}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Box>
              <TextField
                fullWidth
                label={t('Meal Name')}
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
              />
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>{t('Meal Type')}</InputLabel>
                <Select
                  value={mealType}
                  label={t('Meal Type')}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  required
                >
                  <MenuItem value="breakfast">{t('breakfast')}</MenuItem>
                  <MenuItem value="lunch">{t('lunch')}</MenuItem>
                  <MenuItem value="dinner">{t('dinner')}</MenuItem>
                  <MenuItem value="snack">{t('snack')}</MenuItem>
                  <MenuItem value="other">{t('other')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <FormControl fullWidth>
                <InputLabel>{t('Categories')}</InputLabel>
                <Select
                  multiple
                  value={mealCategories}
                  label={t('Categories')}
                  onChange={(e) => setMealCategories(e.target.value as MealCategory[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={t(value)} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="italian">{t('italian')}</MenuItem>
                  <MenuItem value="american">{t('american')}</MenuItem>
                  <MenuItem value="asian">{t('asian')}</MenuItem>
                  <MenuItem value="mexican">{t('mexican')}</MenuItem>
                  <MenuItem value="mediterranean">{t('mediterranean')}</MenuItem>
                  <MenuItem value="vegetarian">{t('vegetarian')}</MenuItem>
                  <MenuItem value="vegan">{t('vegan')}</MenuItem>
                  <MenuItem value="gluten_free">{t('gluten_free')}</MenuItem>
                  <MenuItem value="dairy_free">{t('dairy_free')}</MenuItem>
                  <MenuItem value="quick">{t('quick')}</MenuItem>
                  <MenuItem value="meal_prep">{t('meal_prep')}</MenuItem>
                  <MenuItem value="comfort_food">{t('comfort_food')}</MenuItem>
                  <MenuItem value="healthy">{t('healthy')}</MenuItem>
                  <MenuItem value="dessert">{t('dessert')}</MenuItem>
                  <MenuItem value="custom">{t('custom')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
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
              <TextField
                fullWidth
                type="number"
                label={t('Preparation Time (minutes)')}
                value={preparationTime || ''}
                onChange={(e) => setPreparationTime(e.target.value ? parseInt(e.target.value) : null)}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                type="number"
                label={t('Calories Per Serving')}
                value={calories || ''}
                onChange={(e) => setCalories(e.target.value ? parseInt(e.target.value) : null)}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>
            
            <Box>
              <Typography component="legend" sx={{ mr: 2 }}>
                {t('Favorite')}
              </Typography>
              <IconButton onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label={t('Notes')}
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenMealDialog(false)}>{t('Cancel')}</Button>
          <Button 
            variant="contained"
            onClick={handleSaveMeal}
            disabled={!mealName.trim()}
          >
            {editingMeal ? t('Update Meal') : t('Create Meal')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealManager;
