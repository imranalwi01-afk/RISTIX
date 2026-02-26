'use client';

import React from 'react';
import { Alert, Container } from '@mui/material';
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import GCAMovementReport from '@/components/ifrs9/GCAMovementReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { Can } from '@/components/rbac/Can';

export default function GCAMovementReportsPage() {
  return (
    <Can
      permission={['banking.reports.ifrs9.gca_movement.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access GCA Movement Reports.</Alert>
        </Container>
      }
    >
      <ReportPageLayout
        title="GCA Movement Reports"
        description="Gross Carrying Amount movement with stage transfer analysis"
        icon={<PageIcon />}
      >
        <GCAMovementReport />
      </ReportPageLayout>
    </Can>
  );
}
