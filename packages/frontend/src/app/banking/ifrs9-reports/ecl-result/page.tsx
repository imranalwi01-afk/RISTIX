// packages/frontend/src/app/banking/ifrs9-reports/ecl-result/page.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ECLResultReport from '../../../../components/ifrs9/ECLResultReport';

const ECLResultReportPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 ECL Result Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Expected Credit Loss results aggregated by segment and stage
      </Typography>
      
      <ECLResultReport />
    </Box>
  );
};

export default ECLResultReportPage;