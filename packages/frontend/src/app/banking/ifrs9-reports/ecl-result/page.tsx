'use client';

import React from 'react';
import { BarChart as PageIcon } from '@mui/icons-material';
import ECLResultReport from '@/components/ifrs9/ECLResultReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function ECLResultReportsPage() {
  return (
    <ReportPageLayout
      title="ECL Result Reports"
      description="Expected Credit Loss results aggregated by segment and stage"
      icon={<PageIcon />}
    >
      <ECLResultReport />
    </ReportPageLayout>
  );
}
