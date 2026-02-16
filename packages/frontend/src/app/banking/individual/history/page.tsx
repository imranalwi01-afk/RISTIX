// packages/frontend/src/app/banking/individual/history/page.tsx
// ============================================================================
// IFRS9 FRONTEND - OVERRIDE HISTORY PAGE
// ============================================================================
// Purpose: Individual assessment override history and audit trail
// Generated: 2025-07-28T05:12:54Z
// Stakeholder: Banking Institution
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  History as PageIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  Assignment as TotalIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { Can } from '@/components/rbac/Can';

export default function OverrideHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Initialize page data
    const initializePage = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setData({
          total: 156,
          approved: 89,
          rejected: 12,
          pending: 55
        });
      } catch (error) {
        console.error('Error loading Override History data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  return (
    <Container maxWidth="xl">
      <ModernLoader
        open={loading}
        message="Loading History"
        subMessage="Fetching override audit trail..."
      />
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Override History
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Override History
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Individual assessment override history and audit trail
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Records"
            value={data?.total || 0}
            icon={<TotalIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle="All History Entries"

          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Review"
            value={data?.pending || 0}
            icon={<PendingIcon sx={{ fontSize: 40 }} />}
            color="#ff9800"
            subtitle="Awaiting Approval"

          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Approved"
            value={data?.approved || 0}
            icon={<ApprovedIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle="Overridden Successfully"

          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Rejected"
            value={data?.rejected || 0}
            icon={<RejectedIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
            subtitle="Denied Requests"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                History Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This page provides individual assessment override history and audit trail.
              </Typography>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Development Note:</strong> Detailed history table integration with backend API
                  (/banking/individual/impairment/assessment/history) is pending.
                </Typography>
              </Alert>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Can permission={['banking.individual.export', 'banking.individual.manage', 'admin.super_admin']}>
                  <Button
                    variant="contained"
                    startIcon={<PageIcon />}
                    disabled
                  >
                    Export Log
                  </Button>
                </Can>
                <Button
                  variant="outlined"
                  startIcon={<BackIcon />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
