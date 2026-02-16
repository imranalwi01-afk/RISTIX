"use client";

import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const nextQuery = new URLSearchParams(searchParams.toString());
    nextQuery.set('tab', 'users');
    router.replace(`/banking/maintenance/roles?${nextQuery.toString()}`);
  }, [router, searchParams]);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box
        sx={{
          minHeight: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary">
          Redirecting to consolidated user workspace...
        </Typography>
      </Box>
    </Box>
  );
}
