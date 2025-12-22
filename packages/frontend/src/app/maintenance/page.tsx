// packages/frontend/src/app/maintenance/page.tsx
// ============================================================================
// 🗄️ IAF MAINTENANCE INDEX PAGE
// ============================================================================
// ✅ PURPOSE: Redirect /maintenance to /banking/maintenance
// ✅ IMPLEMENTATION: Seamless redirect to banking maintenance section
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const MaintenanceIndex: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the banking maintenance section
    router.replace('/banking/maintenance');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3
      }}
    >
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          maxWidth: 400
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 600 }}>
          Redirecting to Maintenance Section...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          You are being redirected to the IAF Maintenance interface.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          If you are not redirected automatically,{' '}
          <Box
            component="a"
            href="/banking/maintenance"
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/maintenance');
            }}
          >
            click here
          </Box>
          .
        </Typography>
      </Paper>
    </Box>
  );
};

export default MaintenanceIndex;