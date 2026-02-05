// packages/frontend/src/components/navigation/layouts/PlatformAdminLayout.tsx
// ✅ SURGICAL FIX: Platform Admin Layout Component (Separate File)

'use client';

import React from 'react';
// import { Box, AppBar, Toolbar, Typography, Container, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';

interface PlatformAdminLayoutProps {
  children: React.ReactNode;
}

const PlatformAdminLayout: React.FC<PlatformAdminLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Platform Administration
          </Typography>
          <Chip label="Super Admin" color="secondary" size="small" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        {children as any}
      </Container>
    </Box>
  );
};

export default PlatformAdminLayout;