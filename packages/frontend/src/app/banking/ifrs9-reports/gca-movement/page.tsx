'use client';

import React from 'react';
import { Alert, Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { SwapHoriz as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import GCAMovementReport from '@/components/ifrs9/GCAMovementReport';
import { Can } from '@/components/rbac/Can';

export default function GCAMovementReportsPage() {
  const router = useRouter();

  return (
    <Can
      permission={['banking.reports.ifrs9.gca_movement.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access GCA Movement Reports.</Alert>
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
            GCA Movement Reports
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              GCA Movement Reports
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Gross Carrying Amount movement with stage transfer analysis
          </Typography>
        </Box>

        {/* Main Content - Using the Premium Component */}
        <GCAMovementReport />
      </Container>
    </Can>
  );
}
