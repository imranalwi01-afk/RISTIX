'use client';

import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { Timeline as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import LifetimePDReport from '@/components/ifrs9/LifetimePDReport';

export default function LifetimePDReportsPage() {
  const router = useRouter();

  return (
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
          Lifetime PD Reports
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PageIcon sx={{ mr: 2, fontSize: 32, color: 'warning.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Lifetime PD Reports
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Probability of Default with yearly and monthly marginal analysis
        </Typography>
      </Box>

      {/* Main Content - Using the Premium Component */}
      <LifetimePDReport />
    </Container>
  );
}
