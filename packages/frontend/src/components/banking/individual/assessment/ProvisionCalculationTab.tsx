import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import { MonetizationOn as MoneyIcon } from '@mui/icons-material';
import { 
  type IndividualImpairmentWatchlistItem, 
  type IndividualImpairmentAssessment 
} from '@/services/api.individual-impairment';

interface ProvisionCalculationTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  calculation: any;
  loading: boolean;
}

export function ProvisionCalculationTab({ account, assessment, calculation, loading }: ProvisionCalculationTabProps) {
  // Local helper function for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MoneyIcon sx={{ mr: 1 }} />
        Provision Calculation - {account?.account_number} - {account?.cif_name}
      </Typography>

      {calculation ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>DCF Results</Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Present Value of Cash Flows:</Typography>
                    <Typography variant="h6">
                      {formatCurrency(calculation.presentValue || 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Outstanding Balance:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(account?.outstanding_balance || 0)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Loss Given Default:</Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(calculation.lgd || 0)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Provision Recommendation</Typography>
                <Divider sx={{ mb: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  Based on DCF analysis, the recommended provision amount is calculated.
                </Alert>

                <Typography variant="h4" color="primary.main" sx={{ textAlign: 'center', my: 2 }}>
                  {formatCurrency(calculation.recommendedProvision || 0)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Recommended Provision Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">
          Please perform DCF analysis first to calculate provision amounts.
        </Alert>
      )}
    </Box>
  );
}
