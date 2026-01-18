// packages/frontend/src/app/banking/setup/layout.tsx
// ============================================================================
// IFRS9 FRONTEND - SETUP LAYOUT
// ============================================================================
// Purpose: Layout wrapper for Setup section with breadcrumb support
// Generated: 2025-07-28T05:12:53Z
// ============================================================================

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import SetupIcon from '@mui/icons-material/Settings';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {/* Optional: Add section-specific header or navigation */}
      {children}
    </Box>
  );
}