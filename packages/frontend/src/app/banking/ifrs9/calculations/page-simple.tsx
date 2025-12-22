// packages/frontend/src/app/banking/ifrs9/calculations/page-simple.tsx
// ============================================================================
// IFRS9 CALCULATION DASHBOARD - MINIMAL TEST VERSION (NO API CALLS)
// ============================================================================

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Home as HomeIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function IFRS9CalculationSimpleDashboard() {
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
          <CalculateIcon sx={{ mr: 0.5, fontSize: 16 }} />
          IFRS9 Calculations (Simple Test)
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalculateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              IFRS9 Calculation Dashboard - Simple Test
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Minimal test version with no API calls
            </Typography>
          </Box>
        </Box>

        {/* Test Content */}
        <Box sx={{ p: 3, border: '2px solid green', borderRadius: 1, bgcolor: 'lightgreen' }}>
          <Typography variant="h6" color="darkgreen" gutterBottom>
            ✅ SUCCESS: Simple Component Working!
          </Typography>
          <Typography variant="body1" gutterBottom>
            This minimal test page loads successfully without any errors.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you can see this page, the basic React component structure is working.
            The issue is likely in the API calls or complex components like DataGrid.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => router.push('/banking/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
}