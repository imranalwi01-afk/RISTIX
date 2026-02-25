'use client';

import React from 'react';
import { TrendingDown as PageIcon } from '@mui/icons-material';
import LifetimeLGDReport from '@/components/ifrs9/LifetimeLGDReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function LifetimeLGDReportsPage() {
  return (
    <ReportPageLayout
      title="Lifetime LGD Reports"
      description="Loss Given Default with recovery information and risk analysis"
      icon={<PageIcon />}
    >
      <LifetimeLGDReport />
    </ReportPageLayout>
  );
}
