'use client';

import React from 'react';
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import GCAMovementReport from '@/components/ifrs9/GCAMovementReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function GCAMovementReportsPage() {
  return (
    <ReportPageLayout
      title="GCA Movement Reports"
      description="Gross Carrying Amount movement with stage transfer analysis"
      icon={<PageIcon />}
    >
      <GCAMovementReport />
    </ReportPageLayout>
  );
}
