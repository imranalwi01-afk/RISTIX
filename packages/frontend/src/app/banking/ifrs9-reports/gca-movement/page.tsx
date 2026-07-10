'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const GCAMovementReport = dynamic(() => import('@/components/ifrs9/GCAMovementReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function GCAMovementReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.gca_movement.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access GCA Movement Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="GCA Movement Reports"
        description="Gross Carrying Amount movement with stage transfer analysis"
        icon={<PageIcon />}
      >
        <GCAMovementReport />
      </ReportPageLayout>
    </Can>
  );
}
