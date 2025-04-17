import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, parse, addMonths, subMonths } from 'date-fns';
import {
  Box,
  Grid,
  Paper,
  Typography,
  ButtonGroup,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as AchievementIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { 
  fetchMealStatistics,
  fetchMealPlanForPeriod
} from '../../../store/slices/mealsSlice';
import { AppDispatch, RootState } from '../../../store';

// Mock chart components - in a real app, use a charting library like recharts or chart.js
const PieChart: React.FC<{ data: any }> = ({ data }) => (
  <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      [Pie Chart Visualization]
    </Typography>
    <Box sx={{ mt: 2 }}>
      {data.map((item: any, index: number) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{item.name}</Typography>
          <Typography variant="body2">{item.value} ({item.percentage}%)</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const BarChart: React.FC<{ data: any }> = ({ data }) => (
  <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      [Bar Chart Visualization]
    </Typography>
    <Box sx={{ mt: 2 }}>
      {data.map((item: any, index: number) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{item.name}</Typography>
          <Typography variant="body2">{item.value}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const LineChart: React.FC<{ data: any }> = ({ data }) => (
  <Box sx={{ height: 200, bgcolor: 'background.paper', p: 2, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      [Line Chart Visualization]
    </Typography>
    <Box sx={{ mt: 2 }}>
      {data.map((item: any, index: number) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{item.date}</Typography>
          <Typography variant="body2">{item.value}</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const MealStatistics: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { statistics, loading } = useSelector((state: RootState) => state.meals);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [viewType, setViewType] = useState<'summary' | 'trends' | 'achievements'>('summary');
  
  useEffect(() => {
    // Get start and end date based on period
    let startDate, endDate;
    if (period === 'month') {
      startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    } else if (period === 'week') {
      // TODO: Implement week calculation
      startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
      endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
    } else {
      // Year
      startDate = format(new Date(currentDate.getFullYear(), 0, 1), 'yyyy-MM-dd');
      endDate = format(new Date(currentDate.getFullYear(), 11, 31), 'yyyy-MM-dd');
    }
    
    // Fetch statistics for this period
    dispatch(fetchMealStatistics({ startDate, endDate }));
    dispatch(fetchMealPlanForPeriod({ startDate, endDate }));
  }, [currentDate, period, dispatch]);

  // Mock data for charts - these would come from the API in a real app
  const mealTypeDistribution = [
    { name: t('meals.types.breakfast'), value: 20, percentage: 25 },
    { name: t('meals.types.lunch'), value: 25, percentage: 31 },
    { name: t('meals.types.dinner'), value: 28, percentage: 35 },
    { name: t('meals.types.snack'), value: 7, percentage: 9 }
  ];
  
  const mealStatusDistribution = [
    { name: t('meals.status.prepared'), value: 45, percentage: 56 },
    { name: t('meals.status.planned'), value: 22, percentage: 28 },
    { name: t('meals.status.skipped'), value: 8, percentage: 10 },
    { name: t('meals.status.replaced'), value: 5, percentage: 6 }
  ];
  
  const categoryDistribution = [
    { name: t('meals.categories.italian'), value: 15 },
    { name: t('meals.categories.american'), value: 8 },
    { name: t('meals.categories.asian'), value: 12 },
    { name: t('meals.categories.vegetarian'), value: 18 },
    { name: t('meals.categories.quick'), value: 10 }
  ];
  
  const ratingTrend = [
    { date: '01/04', value: 4.2 },
    { date: '02/04', value: 4.5 },
    { date: '03/04', value: 3.8 },
    { date: '04/04', value: 4.0 },
    { date: '05/04', value: 4.7 }
  ];
  
  const adherenceTrend = [
    { date: 'Week 1', value: '85%' },
    { date: 'Week 2', value: '90%' },
    { date: 'Week 3', value: '75%' },
    { date: 'Week 4', value: '92%' }
  ];

  // Handlers for navigation
  const handlePrevPeriod = () => {
    if (period === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (period === 'week') {
      // TODO: Implement week calculation
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      // Year
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
    }
  };
  
  const handleNextPeriod = () => {
    if (period === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (period === 'week') {
      // TODO: Implement week calculation
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      // Year
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
    }
  };
  
  const getPeriodLabel = () => {
    if (period === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (period === 'week') {
      // TODO: Implement proper week formatting
      return format(currentDate, 'MMMM yyyy');
    } else {
      return format(currentDate, 'yyyy');
    }
  };

  return (
    <Box>
      {/* Header with period selection and navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setPeriod('week')} 
              variant={period === 'week' ? 'contained' : 'outlined'}
            >
              {t('common.week')}
            </Button>
            <Button 
              onClick={() => setPeriod('month')} 
              variant={period === 'month' ? 'contained' : 'outlined'}
            >
              {t('common.month')}
            </Button>
            <Button 
              onClick={() => setPeriod('year')} 
              variant={period === 'year' ? 'contained' : 'outlined'}
            >
              {t('common.year')}
            </Button>
          </ButtonGroup>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevPeriod}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {getPeriodLabel()}
          </Typography>
          <IconButton onClick={handleNextPeriod}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <Box>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              onClick={() => setViewType('summary')} 
              variant={viewType === 'summary' ? 'contained' : 'outlined'}
            >
              {t('meals.statistics.summary')}
            </Button>
            <Button 
              onClick={() => setViewType('trends')} 
              variant={viewType === 'trends' ? 'contained' : 'outlined'}
            >
              {t('meals.statistics.trends')}
            </Button>
            <Button 
              onClick={() => setViewType('achievements')} 
              variant={viewType === 'achievements' ? 'contained' : 'outlined'}
            >
              {t('meals.statistics.achievements')}
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Summary View */}
      {viewType === 'summary' && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {t('meals.statistics.totalMealsPlanned')}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics?.totalMealsPlanned || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('meals.statistics.adherenceRate')}: {statistics?.adherenceRate || '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {t('meals.statistics.averageMealRating')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                        {statistics?.averageMealRating?.toFixed(1) || '0.0'}
                      </Typography>
                      <StarIcon color="warning" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('meals.statistics.totalRatings')}: {statistics?.totalRatings || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {t('meals.statistics.topCategory')}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {statistics?.topCategory ? t(`meals.categories.${statistics.topCategory}`) : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {statistics?.topCategoryCount || 0} {t('meals.statistics.meals').toLowerCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {t('meals.statistics.favoriteCount')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                        {statistics?.favoriteCount || 0}
                      </Typography>
                      <FavoriteIcon color="error" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('meals.statistics.topFavorite')}: {statistics?.topFavoriteMeal || '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('meals.statistics.mealTypeDistribution')}
              </Typography>
              <PieChart data={mealTypeDistribution} />
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('meals.statistics.planStatus')}
              </Typography>
              <PieChart data={mealStatusDistribution} />
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('meals.statistics.categoryDistribution')}
              </Typography>
              <BarChart data={categoryDistribution} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Trends View */}
      {viewType === 'trends' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('meals.statistics.ratingTrend')}
              </Typography>
              <LineChart data={ratingTrend} />
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('meals.statistics.adherenceTrend')}
              </Typography>
              <LineChart data={adherenceTrend} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Achievements View */}
      {viewType === 'achievements' && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AchievementIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {t('meals.statistics.achievements')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {t('meals.achievements.planner')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('meals.achievements.plannerDesc')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                          10
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 30
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {t('meals.achievements.gourmet')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('meals.achievements.gourmetDesc')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                          5
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 10
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {t('meals.achievements.consistent')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('meals.achievements.consistentDesc')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" color="primary" sx={{ mr: 1 }}>
                          14
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 21
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MealStatistics;
