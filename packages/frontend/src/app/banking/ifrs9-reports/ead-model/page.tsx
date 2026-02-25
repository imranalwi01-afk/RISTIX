'use client';

import React from 'react';
import { AccountBalance as PageIcon } from '@mui/icons-material';
import EADModelReport from '@/components/ifrs9/EADModelReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function EADModelReportsPage() {
  return (
    <ReportPageLayout
      title="EAD Model Reports"
      description="Exposure at Default with payment averages and utilization rates"
      icon={<PageIcon />}
    >
      <EADModelReport />
    </ReportPageLayout>
  );
}
