// packages/frontend/src/app/banking/ifrs9/calculations/page-test.tsx
// ============================================================================
// IFRS9 CALCULATION DASHBOARD - SIMPLIFIED TEST VERSION
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Home as HomeIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api, { handleAPIError } from '../../../../services/api';

export default function IFRS9CalculationTestDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {

      // Test API connection with simple call
      const response = await api.ifrs9.getCalculationsSummary();
      setData(response);

    } catch (error: any) {
      console.error('❌ Failed to load data:', error);
      setError(`Failed to load calculation data: ${handleAPIError(error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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
          <CalculateIcon sx={{ mr: 0.5, fontSize: 16 }} />
          IFRS9 Calculations (Test)
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalculateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                IFRS9 Calculation Dashboard (Test Version)
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Simplified test version to isolate component errors
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {/* Success Data Display */}
        {data && (
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="h6" color="success.dark">
              ✅ API Connection Successful!
            </Typography>
            <pre style={{ fontSize: '12px', marginTop: '8px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </Box>
        )}

        {/* Test Content */}
        <Box sx={{ p: 3, border: '2px dashed grey', borderRadius: 1 }}>
          <Typography variant="body1" gutterBottom>
            🧪 Test Version - This simplified page is working correctly.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you can see this page, the basic component structure is fine.
            The issue is likely in the complex DataGrid components or charts.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}