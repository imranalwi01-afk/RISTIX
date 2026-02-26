// packages/frontend/src/app/banking/ifrs9-reports/nominative/page.tsx
'use client';

import React from 'react';
<<<<<<< HEAD
import { Assessment as PageIcon } from '@mui/icons-material';
import NominativeReport from '@/components/ifrs9/NominativeReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
=======
import { Alert, Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { Assessment as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import NominativeReport from '@/components/ifrs9/NominativeReport';
import { Can } from '@/components/rbac/Can';
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740

export default function NominativeReportsPage() {
  return (
<<<<<<< HEAD
    <ReportPageLayout
      title="Nominative Reports"
      description="Detailed ECL calculation results per account"
      icon={<PageIcon />}
    >
      <NominativeReport />
    </ReportPageLayout>
=======
    <Can
      permission={['banking.reports.ifrs9.nominative.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Nominative Reports.</Alert>
        </Container>
      }
    >
      <Container maxWidth="xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Nominative Reports
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Nominative Reports
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Detailed ECL calculation results per account
          </Typography>
        </Box>

        {/* Main Content - Using the Premium Component */}
        <NominativeReport />
      </Container>
    </Can>
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
  );
}
