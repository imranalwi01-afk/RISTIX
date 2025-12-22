// ============================================================================
// IFRS9 FRONTEND - LOADING FALLBACK COMPONENT
// ============================================================================
// File Path: packages/frontend/src/components/common/LoadingFallback.tsx
// Purpose: Reusable loading component for suspense boundaries
// ============================================================================

import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface LoadingFallbackProps {
  message?: string;
  size?: number;
  variant?: 'minimal' | 'full' | 'card';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 40,
  variant = 'full',
}) => {
  if (variant === 'minimal') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={size} />
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center', m: 2 }}>
        <CircularProgress size={size} sx={{ mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      </Paper>
    );
  }

  // Full variant (default)
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#fafafa"
    >
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={size} sx={{ mb: 2 }} />
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoadingFallback;