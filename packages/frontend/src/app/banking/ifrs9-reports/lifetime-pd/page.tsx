'use client';

import React from 'react';
import { Timeline as PageIcon } from '@mui/icons-material';
import LifetimePDReport from '@/components/ifrs9/LifetimePDReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function LifetimePDReportsPage() {
  return (
    <ReportPageLayout
      title="Lifetime PD Reports"
      description="Probability of Default with yearly and monthly marginal analysis"
      icon={<PageIcon />}
    >
      <LifetimePDReport />
    </ReportPageLayout>
  );
}
