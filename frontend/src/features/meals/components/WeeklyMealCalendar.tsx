import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { RootState } from '../../../store';
import { 
  fetchMealPlan, 
  setSelectedDate,
  setSelectedWeek,
  MealType,
  MealPlanStatus
} from '../../../store/slices/mealsSlice';
import { AppDispatch } from '../../../store';
import MealPlanItem from './MealPlanItem';
import AddMealDialog from './AddMealDialog';

// Helper function to create array of days for a week
const getDaysOfWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Start on Monday
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const WeeklyMealCalendar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for the current week's start date
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [addMealOpen, setAddMealOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<{date: Date, mealType: MealType} | null>(null);

  // Get meal plan data from Redux store
  const { mealPlan, loading, error, selectedDate } = useSelector((state: RootState) => state.meals);
  
  // Compute the days of the current week
  const daysOfWeek = getDaysOfWeek(currentWeekStart);
  
  // Fetch meal plan data when week changes
  useEffect(() => {
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    dispatch(fetchMealPlan({ startDate, endDate }));
    dispatch(setSelectedWeek(startDate));
  }, [currentWeekStart, dispatch]);

  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Navigate to current week
  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Handle selecting a day
  const handleSelectDate = (date: Date) => {
    dispatch(setSelectedDate(format(date, 'yyyy-MM-dd')));
  };

  // Handle opening the add meal dialog
  const handleAddMeal = (date: Date, mealType: MealType) => {
    setSelectedSlot({ date, mealType });
    setAddMealOpen(true);
  };

  // Get meals for a specific date and meal type
  const getMealsForSlot = (date: Date, mealType: MealType) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlan.filter(
      entry => entry.plannedDate === dateStr && entry.mealType === mealType
    );
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h5" component="h2">
          {t('meals.weeklyPlan')}
        </Typography>
        <Box>
          <IconButton onClick={handlePrevWeek} aria-label={t('common.previousWeek')}>
            <ChevronLeftIcon />
          </IconButton>
          <Button 
            startIcon={<TodayIcon />} 
            onClick={handleCurrentWeek}
            sx={{ mx: 1 }}
          >
            {t('common.today')}
          </Button>
          <IconButton onClick={handleNextWeek} aria-label={t('common.nextWeek')}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Grid container spacing={1}>
          {/* Header row with day names */}
          <Grid item xs={2}>
            <Box sx={{ height: 50, display: 'flex', alignItems: 'center', pl: 1 }}>
              <Typography variant="subtitle2" color="textSecondary">
                {t('meals.mealTypes')}
              </Typography>
            </Box>
          </Grid>
          {daysOfWeek.map((day, index) => (
            <Grid item xs key={index}>
              <Box 
                sx={{ 
                  height: 50, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: isSameDay(day, new Date()) ? 'primary.light' : 'transparent',
                  borderRadius: 1,
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectDate(day)}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  {format(day, 'EEE')}
                </Typography>
                <Typography variant="body2" fontWeight={selectedDate === format(day, 'yyyy-MM-dd') ? 'bold' : 'normal'}>
                  {format(day, 'd MMM')}
                </Typography>
              </Box>
            </Grid>
          ))}

          {/* Meal type rows */}
          {mealTypes.map((mealType) => (
            <React.Fragment key={mealType}>
              <Grid item xs={2}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1,
                  bgcolor: 'background.paper'
                }}>
                  <Typography variant="subtitle1">
                    {t(`meals.types.${mealType}`)}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Day cells for this meal type */}
              {daysOfWeek.map((day, dayIndex) => {
                const mealsForSlot = getMealsForSlot(day, mealType);
                
                return (
                  <Grid item xs key={`${mealType}-${dayIndex}`}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 1, 
                        height: '100%',
                        minHeight: 120,
                        bgcolor: 'background.default',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      {mealsForSlot.length > 0 ? (
                        <Stack spacing={1}>
                          {mealsForSlot.map(entry => (
                            <MealPlanItem 
                              key={entry.id} 
                              mealPlanEntry={entry} 
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Box 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleAddMeal(day, mealType)}
                        >
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{ 
                              fontSize: '0.75rem',
                              textAlign: 'center'
                            }}
                          >
                            {t('meals.addMeal')}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      {/* Add Meal Dialog */}
      {selectedSlot && (
        <AddMealDialog 
          open={addMealOpen}
          onClose={() => setAddMealOpen(false)}
          date={selectedSlot.date}
          mealType={selectedSlot.mealType}
        />
      )}
    </Box>
  );
};

export default WeeklyMealCalendar;
