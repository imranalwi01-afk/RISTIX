'use client';

import React from 'react';
import { Alert, Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { BarChart as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ECLResultReport from '@/components/ifrs9/ECLResultReport';
import { Can } from '@/components/rbac/Can';

export default function ECLResultReportsPage() {
  const router = useRouter();

  return (
    <Can
      permission={['banking.reports.ifrs9.ecl_result.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access ECL Result Reports.</Alert>
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
            ECL Result Reports
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'success.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              ECL Result Reports
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Expected Credit Loss results aggregated by segment and stage
          </Typography>
        </Box>

        {/* Main Content - Using the Premium Component */}
        <ECLResultReport />
      </Container>
    </Can>
  );
}
