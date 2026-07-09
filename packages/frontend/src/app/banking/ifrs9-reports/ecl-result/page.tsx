'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { BarChart as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const ECLResultReport = dynamic(() => import('@/components/ifrs9/ECLResultReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function ECLResultReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.ecl_result.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access ECL Result Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="ECL Result Reports"
        description="Expected Credit Loss results aggregated by segment and stage"
        icon={<PageIcon />}
      >
        <ECLResultReport />
      </ReportPageLayout>
    </Can>
  );
}
