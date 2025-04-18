import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Button,
  IconButton,
  Tooltip 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { enUS, it } from 'date-fns/locale';

import { RootState, AppDispatch } from '../../../store';
import { 
  fetchMealPlan,
  fetchMeals,
  setSelectedDate, 
  setSelectedWeek,
  MealType,
  MealPlanEntry
} from '../../../store/slices/mealsSlice';
import MealPlanCard from './MealPlanCard';
import MealPlannerDialog from './MealPlannerDialog';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const WeeklyMealPlanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const locale = i18n.language === 'it' ? it : enUS;
  
  const { selectedWeek, mealPlan, meals, loading } = useSelector((state: RootState) => state.meals);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    selectedWeek ? parseISO(selectedWeek) : startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [openPlannerDialog, setOpenPlannerDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

  // Load initial data
  useEffect(() => {
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    
    dispatch(fetchMealPlan({ startDate, endDate }));
    dispatch(fetchMeals());
    
    // Update Redux state with selected week
    dispatch(setSelectedWeek(format(currentWeekStart, 'yyyy-MM-dd')));
  }, [dispatch, currentWeekStart]);

  // Generate array of days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentWeekStart(prevWeek => subWeeks(prevWeek, 1));
  };

  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentWeekStart(prevWeek => addWeeks(prevWeek, 1));
  };

  // Reset to current week
  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Open dialog to add a meal to the planner
  const handleAddMeal = (day: Date, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setOpenPlannerDialog(true);
  };

  // Filter meal plans for a specific day and meal type
  const getMealsForDayAndType = (day: Date, mealType: MealType): MealPlanEntry[] => {
    const dateString = format(day, 'yyyy-MM-dd');
    return mealPlan.filter(entry => 
      entry.plannedDate.startsWith(dateString) && 
      entry.mealType === mealType
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {t('Weekly Meal Planner')}
          </Typography>
          <Box>
            <Tooltip title={t('Previous Week')}>
              <IconButton onClick={handlePrevWeek} disabled={loading}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Current Week')}>
              <IconButton onClick={handleCurrentWeek} disabled={loading}>
                <TodayIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Next Week')}>
              <IconButton onClick={handleNextWeek} disabled={loading}>
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={1} columns={8}>
          {/* Header row with days */}
          <Grid size={{ xs: 1 }}>
            <Paper
              sx={{
                height: '60px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="subtitle1">{t('Meal Type')}</Typography>
            </Paper>
          </Grid>
          {weekDays.map((day) => (
            <Grid size={{ xs: 1 }} key={day.toISOString()}>
              <Paper
                elevation={isSameDay(day, new Date()) ? 8 : 1}
                sx={{
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: isSameDay(day, new Date()) ? 'secondary.light' : 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="body2">
                  {format(day, 'EEE', { locale })}
                </Typography>
                <Typography variant="subtitle2">
                  {format(day, 'd MMM', { locale })}
                </Typography>
              </Paper>
            </Grid>
          ))}

          {/* Meal type rows */}
          {MEAL_TYPES.map((mealType) => (
            <React.Fragment key={mealType}>
              <Grid size={{ xs: 1 }}>
                <Paper
                  sx={{
                    height: '150px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  <Typography variant="subtitle1">{t(mealType)}</Typography>
                </Paper>
              </Grid>
              {weekDays.map((day) => (
                <Grid size={{ xs: 1 }} key={`${mealType}-${day.toISOString()}`}>
                  <Paper 
                    sx={{ 
                      height: '150px', 
                      p: 1, 
                      overflow: 'auto',
                      border: isSameDay(day, new Date()) ? '1px solid' : 'none',
                      borderColor: 'secondary.main',
                    }}
                  >
                    {getMealsForDayAndType(day, mealType).map((entry) => (
                      <MealPlanCard 
                        key={entry.id} 
                        mealPlanEntry={entry}
                      />
                    ))}
                    <Button 
                      size="small" 
                      startIcon={<AddIcon />}
                      onClick={() => handleAddMeal(day, mealType)}
                      sx={{ mt: 1, width: '100%' }}
                    >
                      {t('Add Meal')}
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      {/* Dialog for adding meals to planner */}
      {openPlannerDialog && selectedDay && selectedMealType && (
        <MealPlannerDialog
          open={openPlannerDialog}
          onClose={() => setOpenPlannerDialog(false)}
          day={selectedDay}
          mealType={selectedMealType}
        />
      )}
    </Box>
  );
};

export default WeeklyMealPlanner;
