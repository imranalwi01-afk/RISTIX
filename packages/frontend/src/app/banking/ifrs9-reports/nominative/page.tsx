// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import NominativeReport from '../../../../components/ifrs9/NominativeReport';

export default function NominativeReportPage({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page

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
}
