// packages/frontend/src/app/banking/ifrs9-reports/ecl-movement/page.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import ECLMovementReport from '../../../../components/ifrs9/ECLMovementReport';

const ECLMovementReportPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 ECL Movement Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        ECL movement analysis with provisions, releases, and transfers
      </Typography>
      
      <ECLMovementReport />
    </Box>
  );
};

export default ECLMovementReportPage;