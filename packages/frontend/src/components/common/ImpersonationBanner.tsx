'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

export default function ImpersonationBanner() {
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    const original = localStorage.getItem('auth_token_original');
    setImpersonating(!!original);
  }, []);

  if (!impersonating) return null;

  const stopImpersonating = () => {
    const original = localStorage.getItem('auth_token_original');
    if (original) {
      localStorage.setItem('auth_token', original);
    }
    localStorage.removeItem('auth_token_original');
    window.location.href = '/platform/users';
  };

  return (
    <Box
      sx={{
        bgcolor: '#ff9800',
        color: '#000',
        px: 3,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        fontSize: '0.9rem',
      }}
    >
      <WarningIcon fontSize="small" />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        You are impersonating another user
      </Typography>
      <Chip
        label="STOP IMPERSONATING"
        size="small"
        onClick={stopImpersonating}
        sx={{
          fontWeight: 700,
          cursor: 'pointer',
          bgcolor: '#000',
          color: '#fff',
          '&:hover': { bgcolor: '#333' },
        }}
      />
    </Box>
  );
}
