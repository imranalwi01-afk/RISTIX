'use client';

import React from 'react';
<<<<<<< HEAD
import { SwapHoriz as PageIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
=======
import { Alert, Box, Typography, Container, Breadcrumbs, Link, alpha, Chip } from '@mui/material';
import { SwapHoriz as PageIcon, Home as HomeIcon, Timeline as TimelineIcon } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
import ECLMovementReport from '@/components/ifrs9/ECLMovementReport';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import { useBankingTheme, BankingMode } from '@/providers/BankingThemeProvider';
import { Can } from '@/components/rbac/Can';

export default function ECLMovementReportsPage() {
  const searchParams = useSearchParams();
  const { bankingMode: currentMode, setBankingMode } = useBankingTheme();

  // Sync banking mode from URL if provided
  React.useEffect(() => {
    const modeFromUrl = searchParams.get('mode') as BankingMode;
    if (modeFromUrl && (modeFromUrl === 'conventional' || modeFromUrl === 'syariah') && modeFromUrl !== currentMode) {
      setBankingMode(modeFromUrl);
    }
  }, [searchParams, currentMode, setBankingMode]);

  return (
<<<<<<< HEAD
    <ReportPageLayout
      title="ECL Movement"
      description="Provision Analysis & Provisioning Tracking"
      icon={<PageIcon />}
    >
      <ECLMovementReport />
    </ReportPageLayout>
=======
    <Can
      permission={['banking.reports.ifrs9.ecl_movement.view', 'banking.reports.ifrs9.view', 'admin.super_admin']}
      fallback={
        <Container maxWidth="xl">
          <Alert severity="error">You do not have permission to access ECL Movement Reports.</Alert>
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
            ECL Movement Reports
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{
          mb: 6,
          p: 4,
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha('#6366f1', 0.1),
                color: '#6366f1',
                mr: 2,
                display: 'flex'
              }}>
                <PageIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 900, letterSpacing: -1, color: '#1e293b' }}>
                  ECL Movement
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Provision Analysis & Provisioning Tracking
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Chip icon={<TimelineIcon />} label="Real-time" size="small" sx={{ fontWeight: 700, bgcolor: 'white' }} />
            <Chip label="IFRS 9 Standard" size="small" color="primary" sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        {/* Main Content - Using the Premium Component */}
        <ECLMovementReport />
      </Container>
    </Can>
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
  );
}
