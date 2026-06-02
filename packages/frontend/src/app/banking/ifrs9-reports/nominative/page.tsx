// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Alert, Box, CircularProgress, Container } from '@mui/material';
import { Assessment as PageIcon } from '@mui/icons-material';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

const NominativeReport = dynamic(() => import('@/components/ifrs9/NominativeReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

export default function NominativeReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.nominative.view', 'banking.reports.ifrs9.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Nominative Report.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="Nominative Report"
        description="Detailed ECL calculation results per account"
        icon={<PageIcon />}
      >
        <NominativeReport />
      </ReportPageLayout>
    </Can>
  );
}
