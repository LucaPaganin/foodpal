import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  Box,
  Typography,
  FormControlLabel,
  Switch
} from '@mui/material';
import { 
  updateMealPlanEntry,
  updateMeal,
  MealPlanEntry,
  MealPlanStatus
} from '../../../store/slices/mealsSlice';
import { AppDispatch } from '../../../store';

interface EditMealDialogProps {
  open: boolean;
  onClose: () => void;
  mealPlanEntry: MealPlanEntry;
}

const EditMealDialog: React.FC<EditMealDialogProps> = ({ 
  open, 
  onClose,
  mealPlanEntry
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [servingCount, setServingCount] = useState(mealPlanEntry.servingCount);
  const [notes, setNotes] = useState(mealPlanEntry.notes || '');
  const [status, setStatus] = useState<MealPlanStatus>(mealPlanEntry.status);
  const [editMeal, setEditMeal] = useState(false);
  
  // Edit meal fields (if editing the actual meal)
  const [mealName, setMealName] = useState(mealPlanEntry.meal?.name || '');
  const [isFavorite, setIsFavorite] = useState(mealPlanEntry.meal?.isFavorite || false);

  // Reset form state when dialog opens with new entry
  React.useEffect(() => {
    if (open) {
      setServingCount(mealPlanEntry.servingCount);
      setNotes(mealPlanEntry.notes || '');
      setStatus(mealPlanEntry.status);
      setMealName(mealPlanEntry.meal?.name || '');
      setIsFavorite(mealPlanEntry.meal?.isFavorite || false);
      setEditMeal(false);
    }
  }, [open, mealPlanEntry]);

  const handleSubmit = () => {
    // Update the meal plan entry
    dispatch(updateMealPlanEntry({
      id: mealPlanEntry.id,
      entry: {
        servingCount,
        notes: notes || undefined,
        status
      }
    }))
      .unwrap()
      .then(() => {
        // If editing the meal itself, update that too
        if (editMeal && mealPlanEntry.meal) {
          dispatch(updateMeal({
            id: mealPlanEntry.meal.id,
            meal: {
              name: mealName,
              isFavorite
            }
          }));
        }
        onClose();
      })
      .catch((error) => {
        console.error('Failed to update meal plan:', error);
      });
  };

  const statusOptions: MealPlanStatus[] = ['planned', 'prepared', 'skipped', 'replaced'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('meals.editMealPlan')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {mealPlanEntry.meal && (
            <Typography variant="subtitle1">
              {mealPlanEntry.meal.name}
            </Typography>
          )}

          <FormControl fullWidth>
            <InputLabel id="status-select-label">{t('meals.status.label')}</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as MealPlanStatus)}
              label={t('meals.status.label')}
            >
              {statusOptions.map((statusOption) => (
                <MenuItem key={statusOption} value={statusOption}>
                  {t(`meals.status.${statusOption}`)}
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

          {mealPlanEntry.meal && (
            <FormControlLabel
              control={
                <Switch
                  checked={editMeal}
                  onChange={(e) => setEditMeal(e.target.checked)}
                />
              }
              label={t('meals.editMealDetails')}
            />
          )}

          {editMeal && mealPlanEntry.meal && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {t('meals.mealDetails')}
              </Typography>
              
              <TextField
                label={t('meals.name')}
                fullWidth
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                  />
                }
                label={t('meals.markAsFavorite')}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMealDialog;
