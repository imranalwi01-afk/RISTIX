'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error boundary:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4,
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
        <AlertTitle>Something went wrong</AlertTitle>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error.message || 'An unexpected error occurred.'}
        </Typography>
        {error.digest && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
            Error ID: {error.digest}
          </Typography>
        )}
      </Alert>
      <Button variant="contained" onClick={reset}>
        Try Again
      </Button>
    </Box>
  );
}
