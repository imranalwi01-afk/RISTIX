'use client';

import React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface TableCardProps {
  children: React.ReactNode;
  fillAvailableHeight?: boolean;
  sx?: SxProps<Theme>;
}

export function TableCard({ children, fillAvailableHeight = true, sx }: TableCardProps) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        minHeight: fillAvailableHeight ? 0 : undefined,
        overflow: 'hidden',
        display: fillAvailableHeight ? 'flex' : undefined,
        flexDirection: fillAvailableHeight ? 'column' : undefined,
        flex: fillAvailableHeight ? '1 1 auto' : undefined,
        borderRadius: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
