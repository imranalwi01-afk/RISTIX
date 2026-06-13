'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { TrendingDown as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const LifetimeLGDReport = dynamic(() => import('@/components/ifrs9/LifetimeLGDReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function LifetimeLGDReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.lifetime_lgd.view', 'banking.reports.ifrs9.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Lifetime LGD Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="Lifetime LGD Reports"
        description="Loss Given Default with recovery information and risk analysis"
        icon={<PageIcon />}
      >
        <LifetimeLGDReport />
      </ReportPageLayout>
    </Can>
  );
}
