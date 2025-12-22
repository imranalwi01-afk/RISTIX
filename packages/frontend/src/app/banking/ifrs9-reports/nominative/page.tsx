// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import NominativeReport from '../../../../components/ifrs9/NominativeReport';

const NominativeReportPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 Nominative Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Detailed account-level IFRS 9 data with comprehensive account information
      </Typography>
      
      <NominativeReport />
    </Box>
  );
};

export default NominativeReportPage;