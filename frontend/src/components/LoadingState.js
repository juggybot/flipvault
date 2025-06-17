import React from 'react';
import { CircularProgress, Skeleton, Box, Typography } from '@mui/material';

const LoadingState = ({ variant = 'circular', text, width, height }) => {
  switch (variant) {
    case 'skeleton':
      return <Skeleton variant="rectangular" width={width || '100%'} height={height || 118} />;
    case 'inline':
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {text && <Typography variant="body2">{text}</Typography>}
        </Box>
      );
    default:
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <CircularProgress />
          {text && <Typography sx={{ ml: 2 }}>{text}</Typography>}
        </Box>
      );
  }
};

export default LoadingState;
