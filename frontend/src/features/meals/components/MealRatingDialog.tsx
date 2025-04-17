import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';

import { AppDispatch } from '../../../store';
import { rateMeal } from '../../../store/slices/mealsSlice';

interface MealRatingDialogProps {
  open: boolean;
  onClose: () => void;
  mealId: string;
  mealName: string;
}

const labels: { [index: string]: string } = {
  1: 'Terrible',
  2: 'Poor',
  3: 'Ok',
  4: 'Good',
  5: 'Excellent',
};

const MealRatingDialog: React.FC<MealRatingDialogProps> = ({
  open,
  onClose,
  mealId,
  mealName
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number>(-1);
  const [comments, setComments] = useState<string>('');
  
  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    
    await dispatch(rateMeal({
      mealId,
      rating: rating as 1 | 2 | 3 | 4 | 5,
      comments: comments.trim() || undefined,
      dateConsumed: new Date().toISOString(),
      userId: ''  // This will be set on the server side
    }));
    
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {t('Rate Meal')}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="subtitle1" component="div" sx={{ mb: 2 }}>
          {mealName}
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Rating
            name="meal-rating"
            value={rating}
            size="large"
            onChange={handleRatingChange}
            onChangeActive={(event, newHover) => {
              setHover(newHover);
            }}
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
          />
          {rating !== null && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="body2">
                {t(labels[hover !== -1 ? hover : rating])}
              </Typography>
            </Box>
          )}
        </Box>
        
        <TextField
          fullWidth
          label={t('Comments (Optional)')}
          multiline
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!rating}
        >
          {t('Submit Rating')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MealRatingDialog;
