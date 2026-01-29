// packages/frontend/src/app/banking/ifrs9-reports/gca-movement/page.tsx
'use client';

import { Box, Typography } from '@mui/material';
import GCAMovementReport from '../../../../components/ifrs9/GCAMovementReport';

export default function GCAMovementReportPage({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IFRS 9 GCA Movement Report  
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Gross Carrying Amount movement with stage transfer analysis
      </Typography>
      
      <GCAMovementReport />
    </Box>
  );
}
