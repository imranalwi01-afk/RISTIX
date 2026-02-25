'use client';

import React from 'react';
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import ECLMovementReport from '@/components/ifrs9/ECLMovementReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { useBankingTheme, BankingMode } from '@/providers/BankingThemeProvider';

export default function ECLMovementReportsPage() {
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
    <ReportPageLayout
      title="ECL Movement"
      description="Provision Analysis & Provisioning Tracking"
      icon={<PageIcon />}
    >
      <ECLMovementReport />
    </ReportPageLayout>
  );
}
