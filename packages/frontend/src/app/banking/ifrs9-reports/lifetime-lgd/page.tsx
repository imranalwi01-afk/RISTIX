// packages/frontend/src/app/banking/ifrs9-reports/lifetime-lgd/page.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import LifetimeLGDReport from '../../../../components/ifrs9/LifetimeLGDReport';

const LifetimeLGDReportPage: React.FC = () => {
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

export default LifetimeLGDReportPage;