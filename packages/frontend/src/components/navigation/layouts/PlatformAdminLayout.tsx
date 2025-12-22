// packages/frontend/src/components/navigation/layouts/PlatformAdminLayout.tsx
// ✅ SURGICAL FIX: Platform Admin Layout Component (Separate File)

'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Chip } from '@mui/material';
import { Business } from '@mui/icons-material';

interface PlatformAdminLayoutProps {
  children: React.ReactNode;
}

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Business sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Platform Administration
          </Typography>
          <Chip label="Super Admin" color="secondary" size="small" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PlatformAdminLayout;