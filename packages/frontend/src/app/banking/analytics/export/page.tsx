'use client';

import React from 'react';
import { Box, Typography, Paper, Alert, AlertTitle, Button } from '@mui/material';
import { Construction as ConstructionIcon, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AnalyticsExportPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Analytics - Export
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This module is under development. Data export features will be available soon.
        </Typography>
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
