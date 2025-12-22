// packages/frontend/src/app/maintenance/menu-management/page.tsx
// ============================================================================
// 🗄️ IAF MAINTENANCE MENU MANAGEMENT REDIRECT PAGE
// ============================================================================
// ✅ PURPOSE: Redirect /maintenance/menu-management to /banking/maintenance/menus
// ✅ IMPLEMENTATION: Seamless redirect to existing menu management functionality
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const MenuManagementRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual menu management page
    router.replace('/banking/maintenance/menus');
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
          Redirecting to Menu Management...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          You are being redirected to the IAF Menu Management interface.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          If you are not redirected automatically,{' '}
          <Box
            component="a"
            href="/banking/maintenance/menus"
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/maintenance/menus');
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

export default MenuManagementRedirect;