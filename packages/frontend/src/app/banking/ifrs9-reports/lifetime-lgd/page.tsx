'use client';

import React from 'react';
import { Alert, Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { TrendingDown as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import LifetimeLGDReport from '@/components/ifrs9/LifetimeLGDReport';
import { Can } from '@/components/rbac/Can';

export default function LifetimeLGDReportsPage() {
  const router = useRouter();

  return (
    <Can
      permission={['banking.reports.ifrs9.lifetime_lgd.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access Lifetime LGD Reports.</Alert>
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
            Lifetime LGD Reports
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'error.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Lifetime LGD Reports
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Loss Given Default with recovery information and risk analysis
          </Typography>
        </Box>

        {/* Main Content - Using the Premium Component */}
        <LifetimeLGDReport />
      </Container>
    </Can>
  );
}
