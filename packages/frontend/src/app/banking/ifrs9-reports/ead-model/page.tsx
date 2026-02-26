'use client';

import React from 'react';
import { Alert, Container } from '@mui/material';
import { AccountBalance as PageIcon } from '@mui/icons-material';
import EADModelReport from '@/components/ifrs9/EADModelReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

export default function EADModelReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.ead_model.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access EAD Model Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="EAD Model Reports"
        description="Exposure at Default with payment averages and utilization rates"
        icon={<PageIcon />}
      >
        <EADModelReport />
      </ReportPageLayout>
    </Can>
  );
}
