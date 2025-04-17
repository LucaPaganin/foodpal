import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Chip, 
  IconButton, 
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Star as StarIcon, 
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  SwapHoriz as ReplaceIcon
} from '@mui/icons-material';
import { 
  MealPlanEntry, 
  updateMealPlanEntry, 
  deleteMealPlanEntry,
  MealPlanStatus 
} from '../../../store/slices/mealsSlice';
import { AppDispatch } from '../../../store';
import EditMealDialog from './EditMealDialog';

interface MealPlanItemProps {
  mealPlanEntry: MealPlanEntry;
}

const MealPlanItem: React.FC<MealPlanItemProps> = ({ mealPlanEntry }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    dispatch(deleteMealPlanEntry(mealPlanEntry.id));
    handleMenuClose();
  };

  const handleStatusChange = (status: MealPlanStatus) => {
    dispatch(updateMealPlanEntry({
      id: mealPlanEntry.id,
      entry: { status }
    }));
    handleMenuClose();
  };

  // Determine the color based on meal status
  const getStatusColor = (status: MealPlanStatus) => {
    switch (status) {
      case 'prepared':
        return 'success';
      case 'skipped':
        return 'error';
      case 'replaced':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get the meal name from the meal plan entry
  const getMealName = () => {
    if (mealPlanEntry.meal) {
      return mealPlanEntry.meal.name;
    }
    return t('meals.unknownMeal');
  };

  // Get the status label
  const getStatusLabel = (status: MealPlanStatus) => {
    return t(`meals.status.${status}`);
  };

  return (
    <>
      <Card 
        variant="outlined" 
        sx={{ 
          width: '100%',
          borderLeft: 3,
          borderColor: `${getStatusColor(mealPlanEntry.status)}.main`,
        }}
      >
        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" noWrap title={getMealName()}>
              {getMealName()}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          {mealPlanEntry.status !== 'planned' && (
            <Chip 
              size="small" 
              label={getStatusLabel(mealPlanEntry.status)} 
              color={getStatusColor(mealPlanEntry.status) as any}
              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Status/Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 200 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.delete')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('prepared')}>
          <ListItemIcon>
            <CheckIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>{t('meals.status.prepared')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('skipped')}>
          <ListItemIcon>
            <CloseIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('meals.status.skipped')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('replaced')}>
          <ListItemIcon>
            <ReplaceIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>{t('meals.status.replaced')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Meal Dialog */}
      <EditMealDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        mealPlanEntry={mealPlanEntry}
      />
    </>
  );
};

export default MealPlanItem;
