'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import LifetimeLGDReport from '../../ifrs9/LifetimeLGDReport';

export const LifetimeLgd = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 Lifetime LGD Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Loss Given Default with recovery information and risk analysis
      </Typography>
      
      <LifetimeLGDReport />
    </Box>
  );
};
