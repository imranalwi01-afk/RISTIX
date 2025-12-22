// packages/frontend/src/app/banking/ifrs9-reports/lifetime-pd/page.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import LifetimePDReport from '../../../../components/ifrs9/LifetimePDReport';

const LifetimePDReportPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 Lifetime PD Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Probability of Default with yearly and monthly marginal analysis
      </Typography>
      
      <LifetimePDReport />
    </Box>
  );
};

export default LifetimePDReportPage;