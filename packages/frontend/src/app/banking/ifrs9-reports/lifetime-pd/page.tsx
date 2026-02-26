'use client';

import React from 'react';
import { Alert, Container } from '@mui/material';
import { Timeline as PageIcon } from '@mui/icons-material';
import LifetimePDReport from '@/components/ifrs9/LifetimePDReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

export default function LifetimePDReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.lifetime_pd.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Lifetime PD Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="Lifetime PD Reports"
        description="Probability of Default with yearly and monthly marginal analysis"
        icon={<PageIcon />}
      >
        <LifetimePDReport />
      </ReportPageLayout>
    </Can>
  );
}
