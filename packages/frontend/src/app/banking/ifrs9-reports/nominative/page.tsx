// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
import { Alert, Container } from '@mui/material';
import { Assessment as PageIcon } from '@mui/icons-material';
import NominativeReport from '@/components/ifrs9/NominativeReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

export default function NominativeReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.nominative.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Nominative Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="Nominative Reports"
        description="Detailed ECL calculation results per account"
        icon={<PageIcon />}
      >
        <NominativeReport />
      </ReportPageLayout>
    </Can>
  );
}
