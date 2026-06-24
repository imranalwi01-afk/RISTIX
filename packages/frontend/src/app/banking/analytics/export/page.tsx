'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Construction as ConstructionIcon, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/banking/shared/PageHeader';

export default function AnalyticsExportPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <PageHeader title="Analytics - Export" subtitle="This module is under development. Data export features will be available soon." />
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: 500 }}>
          <AlertTitle>Coming Soon</AlertTitle>
          Export data to Excel, PDF, and other formats.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/banking/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
