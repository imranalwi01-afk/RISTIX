// packages/frontend/src/app/banking/ifrs9-reports/ead-model/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import EADModelReport from '../../../../components/ifrs9/EADModelReport';

export default function EADModelReportPage({ params }: { params: Promise<{}> }) {
  // params are unused but required by Next.js typed routes signature
  void params;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 EAD Model Report
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Exposure at Default with payment averages and utilization rates
      </Typography>
      
      <EADModelReport />
    </Box>
  );
}
