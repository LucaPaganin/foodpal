import React from 'react';
import { Grid, GridProps } from '@mui/material';

// Create a wrapper component for Grid that explicitly includes the 'item' prop
interface GridWrapperProps extends GridProps {
  item?: boolean;
}

export const GridWrapper: React.FC<GridWrapperProps> = (props) => {
  return <Grid {...props} />;
};
