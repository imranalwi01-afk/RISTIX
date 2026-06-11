'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { useBankingTheme, BankingMode } from '@/providers/BankingThemeProvider';
import { Can } from '@/components/rbac/Can';

const ECLMovementReport = dynamic(() => import('@/components/ifrs9/ECLMovementReport'), {
  ssr: false,
  loading: () => (
    <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  ),
});

function ECLMovementReportsPage() {
  const searchParams = useSearchParams();
  const { bankingMode: currentMode, setBankingMode } = useBankingTheme();

  // Sync banking mode from URL if provided
  React.useEffect(() => {
    const modeFromUrl = searchParams.get('mode') as BankingMode;
    if (modeFromUrl && (modeFromUrl === 'conventional' || modeFromUrl === 'syariah') && modeFromUrl !== currentMode) {
      setBankingMode(modeFromUrl);
    }
  }, [searchParams, currentMode, setBankingMode]);

  return (
    <Can
      permission={['banking.reports.ifrs9.ecl_movement.view', 'banking.reports.ifrs9.view']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access ECL Movement Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="ECL Movement"
        description="Provision Analysis & Provisioning Tracking"
        icon={<PageIcon />}
      >
        <ECLMovementReport />
      </ReportPageLayout>
    </Can>
  );
}

export default function ECLMovementReportsPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ECLMovementReportsPage />
    </Suspense>
  );
}
