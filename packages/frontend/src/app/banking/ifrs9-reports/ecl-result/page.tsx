'use client';

import React from 'react';
import { Alert, Container } from '@mui/material';
import { BarChart as PageIcon } from '@mui/icons-material';
import ECLResultReport from '@/components/ifrs9/ECLResultReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

export default function ECLResultReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.ecl_result.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access ECL Result Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="ECL Result Reports"
        description="Expected Credit Loss results aggregated by segment and stage"
        icon={<PageIcon />}
      >
        <ECLResultReport />
      </ReportPageLayout>
    </Can>
  );
}
