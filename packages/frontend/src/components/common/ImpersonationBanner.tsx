'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Warning from '@mui/icons-material/Warning';
import Cookies from 'js-cookie';

export default function ImpersonationBanner() {
  const [impersonating, setImpersonating] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const original = localStorage.getItem('auth_token_original');
    const name = localStorage.getItem('impersonated_user_name') || '';
    const email = localStorage.getItem('impersonated_user_email') || '';
    setImpersonating(!!original);
    setUserName(name);
    setUserEmail(email);
  }, []);

  if (!impersonating) return null;

  const stopImpersonating = () => {
    const original = localStorage.getItem('auth_token_original');
    if (original) {
      localStorage.setItem('auth_token', original);
      Cookies.set('auth_token', original, { path: '/', secure: true, sameSite: 'lax' });
    }
    localStorage.removeItem('auth_token_original');
    localStorage.removeItem('impersonated_user_name');
    localStorage.removeItem('impersonated_user_id');
    localStorage.removeItem('impersonated_user_email');
    window.location.replace(`/banking/dashboard?t=${Date.now()}`);
  };

  return (
    <Box
      sx={{
        bgcolor: '#e65100',
        color: '#fff',
        px: 3,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        fontSize: '0.85rem',
      }}
    >
      <Warning fontSize="small" sx={{ color: '#fff' }} />
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Impersonating: {userName || userEmail || 'another user'}
      </Typography>
      <Chip
        label="RETURN TO ADMIN"
        size="small"
        onClick={stopImpersonating}
        sx={{
          fontWeight: 700,
          cursor: 'pointer',
          bgcolor: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.5)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
        }}
      />
    </Box>
  );
}
