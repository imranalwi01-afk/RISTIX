'use client';

// packages/frontend/src/components/banking/shared/EmptyState.tsx
// ============================================================================
// 🧹 CLEANUP: Shared Empty State Component
// ============================================================================
// Purpose: Eliminates duplicate empty state components across banking setup pages
// Replaces: 4 separate empty state implementations
// ============================================================================

import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  loading?: boolean;
  error?: boolean;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  loading = false,
  error = false,
  title,
  description,
  onRetry,
  retryText = 'Retry',
  icon
}) => {
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }} color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  const defaultIcon = error ? <ErrorIcon sx={{ fontSize: 48, color: 'text.secondary' }} /> : icon;
  const defaultTitle = error ? 'No Data Available' : (title || 'No Records Found');
  const defaultDescription = error
    ? 'An error occurred while loading data. Please try again.'
    : (description || 'There are no records to display.');

  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      {defaultIcon && (
        <Box sx={{ mb: 2, color: 'text.secondary' }}>
          {defaultIcon as any}
        </Box>
      )}
      <Typography variant="h6" color="text.secondary">
        {defaultTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
        {defaultDescription}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 3 }}
        >
          {retryText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;