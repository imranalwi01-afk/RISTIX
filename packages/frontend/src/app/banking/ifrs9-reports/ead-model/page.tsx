'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { AccountBalance as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const EADModelReport = dynamic(() => import('@/components/ifrs9/EADModelReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function EADModelReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.ead_model.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access EAD Model Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="EAD Model Reports"
        description="Exposure at Default with payment averages and utilization rates"
        icon={<PageIcon />}
      >
        <EADModelReport />
      </ReportPageLayout>
    </Can>
  );
}
