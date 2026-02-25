import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  // Local helper function for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const calculateProvision = (amount: number, stage: number) => {
    // Basic example logic - in real app this comes from backend or complex rules
    const rate = stage === 1 ? 0.01 : stage === 2 ? 0.15 : 1.0; 
    return amount * rate;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MoneyIcon sx={{ mr: 1 }} />
        Provision Calculation - {account?.account_number} - {account?.cif_name}
      </Typography>

      {calculation ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Present Value (DCF)</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {formatCurrency(calculation.presentValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Loss Given Default (LGD)</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(calculation.lgd || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
             <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Final Provision (ECL)</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(calculation.recommendedProvision || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Calculation Table */}
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Calculation Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Component</TableCell>
                                <TableCell align="right">Amount / Rate</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Outstanding Balance</TableCell>
                                <TableCell align="right">{formatCurrency(account?.outstanding_balance || 0)}</TableCell>
                                <TableCell>Total exposure at default</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Discount Rate</TableCell>
                                <TableCell align="right">{calculation.assumptions?.discountRate || 0}%</TableCell>
                                <TableCell>Effective Interest Rate used for discounting</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Scenario</TableCell>
                                <TableCell align="right">{calculation.scenario || 'Base'}</TableCell>
                                <TableCell>Economic scenario applied</TableCell>
                            </TableRow>
                             <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Calculated PV</strong></TableCell>
                                <TableCell align="right"><strong>{formatCurrency(calculation.presentValue || 0)}</strong></TableCell>
                                <TableCell>Sum of discounted cash flows</TableCell>
                            </TableRow>
                             <TableRow sx={{ bgcolor: '#ffebee' }}>
                                <TableCell><strong>Impairment Loss (LGD)</strong></TableCell>
                                <TableCell align="right"><strong>{formatCurrency(calculation.lgd || 0)}</strong></TableCell>
                                <TableCell>Outstanding - PV</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
          </Grid>

           <Grid size={12}>
            <Alert severity="success">
              Provision calculation has been saved successfully. You can now proceed to upload supporting documents or submit for approval.
            </Alert>
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
