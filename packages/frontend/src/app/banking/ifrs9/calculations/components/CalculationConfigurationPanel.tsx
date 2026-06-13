'use client';

import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { CalculationSummary } from './types';

interface CalculationConfigurationPanelProps {
  selectedProcessDate: string | null;
  calculationSummary: CalculationSummary | null;
  formatCurrency: (amount: number) => string;
}

const CalculationConfigurationPanel = memo(function CalculationConfigurationPanel({
  selectedProcessDate,
  calculationSummary,
  formatCurrency,
}: CalculationConfigurationPanelProps) {
  const coverageRatio = calculationSummary && calculationSummary.total_outstanding > 0
    ? ((calculationSummary.total_ecl / calculationSummary.total_outstanding) * 100).toFixed(2)
    : '0.00';

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Calculation Settings</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Process Date:</strong> {selectedProcessDate || 'Not selected'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Calculation Type:</strong> ECL (Expected Credit Loss)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Currency:</strong> IDR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Total Accounts:</strong> {calculationSummary?.total_accounts?.toLocaleString('id-ID') || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Total ECL:</strong> {calculationSummary ? formatCurrency(calculationSummary.total_ecl) : 'Rp 0'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Model Parameters</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Stage Distribution:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                • Stage 1: {calculationSummary?.stage1_count?.toLocaleString('id-ID') || 0} accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                • Stage 2: {calculationSummary?.stage2_count?.toLocaleString('id-ID') || 0} accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                • Stage 3: {calculationSummary?.stage3_count?.toLocaleString('id-ID') || 0} accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Coverage Ratio:</strong> {coverageRatio}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

export default CalculationConfigurationPanel;
