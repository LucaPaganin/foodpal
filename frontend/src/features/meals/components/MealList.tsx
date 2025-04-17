import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { fetchMeals, updateMeal, deleteMeal, MealType, MealCategory } from '../../../store/slices/mealsSlice';
import { RootState, AppDispatch } from '../../../store';
import MealRatingDialog from '../components/MealRatingDialog';

const MealList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { meals, loading } = useSelector((state: RootState) => state.meals);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [ratingMeal, setRatingMeal] = useState<any | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<any | null>(null);
  
  useEffect(() => {
    dispatch(fetchMeals());
  }, [dispatch]);

  // Filter and sort meals
  const filteredMeals = meals
    .filter(meal => {
      const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType ? meal.mealType === filterType : true;
      const matchesCategory = filterCategory 
        ? meal.categories.includes(filterCategory as MealCategory)
        : true;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by favorite status first, then by name
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });

  const handleToggleFavorite = (meal: any) => {
    dispatch(updateMeal({
      id: meal.id,
      meal: { isFavorite: !meal.isFavorite }
    }));
  };

  const handleOpenRatingDialog = (meal: any) => {
    setRatingMeal(meal);
  };

  const handleOpenDeleteDialog = (meal: any) => {
    setDeletingMeal(meal);
  };

  const handleConfirmDelete = () => {
    if (deletingMeal) {
      dispatch(deleteMeal(deletingMeal.id));
      setDeletingMeal(null);
    }
  };

  // Available meal categories
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];
  
  const mealCategories: MealCategory[] = [
    'italian', 'american', 'asian', 'mexican', 'mediterranean',
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'quick',
    'meal_prep', 'comfort_food', 'healthy', 'dessert'
  ];

  return (
    <Box>
      {/* Filters and search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Box sx={{ width: '100%', flexBasis: { xs: '100%', sm: '50%', md: '33.333%' } }}>
            <TextField
              fullWidth
              label={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ width: '100%', flexBasis: { xs: '50%', sm: '25%', md: '16.667%' } }}>
            <FormControl fullWidth>
              <InputLabel>{t('meals.filterByType')}</InputLabel>
              <Select
                value={filterType}
                label={t('meals.filterByType')}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`meals.types.${type}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: '100%', flexBasis: { xs: '50%', sm: '25%', md: '16.667%' } }}>
            <FormControl fullWidth>
              <InputLabel>{t('meals.filterByCategory')}</InputLabel>
              <Select
                value={filterCategory}
                label={t('meals.filterByCategory')}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {mealCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`meals.categories.${category}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Box>

      {/* Meals grid */}
      <Grid container spacing={2}>
        {filteredMeals.map((meal) => (
          <Box sx={{ width: '100%', flexBasis: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' }, padding: 1 }} key={meal.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h3">
                    {meal.name}
                  </Typography>
                  <IconButton 
                    onClick={() => handleToggleFavorite(meal)}
                    color={meal.isFavorite ? 'error' : 'default'}
                    aria-label={String(meal.isFavorite ? t('meals.unfavorite') : t('meals.favorite'))}
                  >
                    {meal.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 1 }}>
                  <Chip 
                    size="small" 
                    label={t(`meals.types.${meal.mealType}`)} 
                    sx={{ mr: 1 }}
                  />
                  {meal.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {meal.rating}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {meal.categories.slice(0, 3).map((category) => (
                    <Chip
                      key={category}
                      label={t(`meals.categories.${category}`)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {meal.categories.length > 3 && (
                    <Chip
                      label={`+${meal.categories.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {meal.preparationTimeMinutes && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {t('meals.prepTime', { minutes: meal.preparationTimeMinutes })}
                      </Typography>
                    </Box>
                  )}
                  
                  {meal.servingCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RestaurantIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {t('meals.servings', { count: meal.servingCount })}
                      </Typography>
                    </Box>
                  )}
                  
                  {meal.caloriesPerServing && (
                    <Typography variant="body2" color="text.secondary">
                      {t('meals.calories', { count: meal.caloriesPerServing })}
                    </Typography>
                  )}
                </Box>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => handleOpenRatingDialog(meal)}
                >
                  {t('meals.rate')}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton 
                  size="small" 
                  aria-label={String(t('common.edit'))}
                  onClick={() => {/* TODO: Implement edit */}}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  aria-label={String(t('common.delete'))}
                  onClick={() => handleOpenDeleteDialog(meal)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Box>
        ))}

        {filteredMeals.length === 0 && !loading && (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6" color="text.secondary">
                {t('meals.noMealsFound')}
              </Typography>
            </Box>
          </Box>
        )}
      </Grid>

      {/* Rating Dialog */}
      {ratingMeal && (
        <MealRatingDialog
          open={!!ratingMeal}
          onClose={() => setRatingMeal(null)}
          meal={ratingMeal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingMeal}
        onClose={() => setDeletingMeal(null)}
      >
        <DialogTitle>{t('meals.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deletingMeal && t('meals.deleteConfirmation', { name: deletingMeal.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingMeal(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealList;
