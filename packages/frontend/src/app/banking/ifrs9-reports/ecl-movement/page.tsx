'use client';

import React from 'react';
import { Box, Typography, Container, Breadcrumbs, Link } from '@mui/material';
import { SwapHoriz as PageIcon, Home as HomeIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ECLMovementReport from '@/components/ifrs9/ECLMovementReport';

export default function ECLMovementReportsPage() {
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
          ECL Movement Reports
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PageIcon sx={{ mr: 2, fontSize: 32, color: 'secondary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            ECL Movement Reports
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          ECL movement analysis with provisions, releases, and transfers
        </Typography>
      </Box>

      {/* Main Content - Using the Premium Component */}
      <ECLMovementReport />
    </Container>
  );
}
