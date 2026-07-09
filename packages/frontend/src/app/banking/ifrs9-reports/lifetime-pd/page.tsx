'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { Timeline as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const LifetimePDReport = dynamic(() => import('@/components/ifrs9/LifetimePDReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function LifetimePDReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.lifetime_pd.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Lifetime PD Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="Lifetime PD Reports"
        description="Probability of Default with yearly and monthly marginal analysis"
        icon={<PageIcon />}
      >
        <LifetimePDReport />
      </ReportPageLayout>
    </Can>
  );
}
