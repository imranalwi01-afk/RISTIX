// packages/frontend/src/app/banking/setup/layout.tsx
// ============================================================================
// IFRS9 FRONTEND - SETUP LAYOUT
// ============================================================================
// Purpose: Layout wrapper for Setup section with breadcrumb support
// Generated: 2025-07-28T05:12:53Z
// ============================================================================

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SetupIcon from '@mui/icons-material/Settings';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      {/* Optional: Add section-specific header or navigation */}
      {children as any}
    </Box>
  );
}