// packages/frontend/src/app/banking/parameters/layout.tsx
// ============================================================================
// IFRS9 FRONTEND - PARAMETERS LAYOUT
// ============================================================================
// Purpose: Layout wrapper for Parameters section with breadcrumb support
// Generated: 2025-07-28T05:12:53Z
// ============================================================================

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ParametersIcon from '@mui/icons-material/Category';

export default function ParametersLayout({
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