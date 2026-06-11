'use client';

import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Construction as ConstructionIcon, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AnalyticsDashboardPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This module is under development. Analytics dashboard features will be available soon.
        </Typography>
        <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: 500 }}>
          <AlertTitle>Coming Soon</AlertTitle>
          Advanced analytics dashboard with KPIs and metrics.
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
