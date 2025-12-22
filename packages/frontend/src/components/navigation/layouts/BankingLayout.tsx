// packages/frontend/src/components/navigation/layouts/BankingLayout.tsx
// ✅ CLEAN SINGLE COMPONENT: Banking Layout Only

'use client';

import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

interface BankingLayoutProps {
  children: React.ReactNode;
}

const BankingLayout: React.FC<BankingLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            IFRS 9 Banking Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default BankingLayout;