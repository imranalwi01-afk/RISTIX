// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
import { Assessment as PageIcon } from '@mui/icons-material';
import NominativeReport from '@/components/ifrs9/NominativeReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';

export default function NominativeReportsPage() {
  return (
    <ReportPageLayout
      title="Nominative Reports"
      description="Detailed ECL calculation results per account"
      icon={<PageIcon />}
    >
      <NominativeReport />
    </ReportPageLayout>
  );
}
