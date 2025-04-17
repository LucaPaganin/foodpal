import React from 'react';
import { useDispatch } from 'react-redux';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Box, 
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useTranslation } from 'react-i18next';

import { MealPlanEntry, deleteMealPlanEntry, updateMealPlanEntry } from '../../../store/slices/mealsSlice';
import { AppDispatch } from '../../../store';
import MealRatingDialog from './MealRatingDialog';

interface MealPlanCardProps {
  mealPlanEntry: MealPlanEntry;
}

const MealPlanCard: React.FC<MealPlanCardProps> = ({ mealPlanEntry }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [ratingDialogOpen, setRatingDialogOpen] = React.useState(false);
  
  const { meal, status } = mealPlanEntry;
  const mealName = meal ? meal.name : t('Unknown Meal');
  
  // Status handlers
  const handleStatusChange = (newStatus: 'planned' | 'prepared' | 'skipped') => {
    dispatch(updateMealPlanEntry({ 
      id: mealPlanEntry.id, 
      entry: { status: newStatus } 
    }));
    handleCloseMenu();
  };
  
  // Delete meal plan entry
  const handleDelete = () => {
    dispatch(deleteMealPlanEntry(mealPlanEntry.id));
    handleCloseMenu();
  };

  // Menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Rating handlers
  const handleOpenRatingDialog = () => {
    setRatingDialogOpen(true);
    handleCloseMenu();
  };

  // Determine card color based on status
  const getCardColor = () => {
    switch (status) {
      case 'prepared':
        return 'success.light';
      case 'skipped':
        return 'error.light';
      default:
        return 'background.paper';
    }
  };

  // Render status icon
  const renderStatusIcon = () => {
    switch (status) {
      case 'prepared':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'skipped':
        return <CancelIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 1, 
          bgcolor: getCardColor(),
          opacity: status === 'skipped' ? 0.7 : 1
        }}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {renderStatusIcon()}
              <Typography variant="body2" sx={{ fontWeight: 'medium', ml: 0.5 }} noWrap>
                {mealName}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              edge="end" 
              onClick={handleOpenMenu}
              aria-label="meal options"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {meal && meal.rating && (
            <Box sx={{ display: 'flex', mt: 0.5 }}>
              {[...Array(meal.rating)].map((_, i) => (
                <StarIcon key={i} fontSize="small" color="warning" sx={{ width: 16, height: 16 }} />
              ))}
              {[...Array(5 - meal.rating)].map((_, i) => (
                <StarBorderIcon key={i} fontSize="small" color="warning" sx={{ width: 16, height: 16 }} />
              ))}
            </Box>
          )}
          
          {meal && meal.categories && meal.categories.length > 0 && (
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={t(meal.categories[0])}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menu for meal options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleStatusChange('planned')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Mark as Planned')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('prepared')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>{t('Mark as Prepared')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('skipped')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('Mark as Skipped')}</ListItemText>
        </MenuItem>
        
        {status === 'prepared' && (
          <MenuItem onClick={handleOpenRatingDialog}>
            <ListItemIcon>
              <StarIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>{t('Rate Meal')}</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('Remove')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Rating Dialog */}
      {meal && (
        <MealRatingDialog
          open={ratingDialogOpen}
          onClose={() => setRatingDialogOpen(false)}
          meal={meal}
        />
      )}
    </>
  );
};

export default MealPlanCard;
