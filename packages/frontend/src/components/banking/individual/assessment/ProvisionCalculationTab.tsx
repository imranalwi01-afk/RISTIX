// @ts-nocheck
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
  TableRow,
  Stack,
  Chip
} from '@mui/material';
import { MonetizationOn as MoneyIcon, Send as SendIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon, History as HistoryIcon } from '@mui/icons-material';
import {
  type IndividualImpairmentWatchlistItem,
  type IndividualImpairmentAssessment
} from '@/services/api.individual-impairment';
import LoadingButton from '@mui/lab/LoadingButton';

interface ProvisionCalculationTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  calculation: any;
  loading: boolean;
  isStagedOverrideReady?: boolean;
  isStagedDCFReady?: boolean;
  onFinalSubmit?: () => Promise<void>;
  submitting?: boolean;
}

export function ProvisionCalculationTab({
    account,
    assessment,
    calculation,
    loading,
    isStagedOverrideReady,
    isStagedDCFReady,
    onFinalSubmit,
    submitting
}: ProvisionCalculationTabProps) {
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

  const isReadyToSubmit = isStagedOverrideReady && isStagedDCFReady;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
            <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
            Provision Calculation - {account?.account_number}
        </Typography>

        {calculation && (
            <Stack direction="row" spacing={1}>
                <Chip
                    icon={isStagedOverrideReady ? <CheckCircleIcon /> : <WarningIcon />}
                    label="Adjustment Staged"
                    color={isStagedOverrideReady ? "success" : "default"}
                    variant="outlined"
                    size="small"
                />
                <Chip
                    icon={isStagedDCFReady ? <CheckCircleIcon /> : <WarningIcon />}
                    label="DCF Staged"
                    color={isStagedDCFReady ? "success" : "default"}
                    variant="outlined"
                    size="small"
                />
            </Stack>
        )}
      </Box>

      {calculation ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#f0f7ff', border: '1px solid', borderColor: 'primary.light', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="primary.dark" fontWeight={600}>Present Value (DCF)</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                  {formatCurrency(calculation.presentValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#fff5f5', border: '1px solid', borderColor: 'error.light', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="error.dark" fontWeight={600}>Loss Given Default (LGD)</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main" sx={{ mt: 1 }}>
                  {formatCurrency(calculation.lgd || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
             <Card sx={{ height: '100%', bgcolor: '#f6ffed', border: '1px solid', borderColor: 'success.light', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="success.dark" fontWeight={600}>Final Provision (ECL)</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                  {formatCurrency(calculation.recommendedProvision || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Calculation Table */}
          <Grid size={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Calculation Components</Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount / Rate</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow hover>
                                <TableCell>Outstanding Balance</TableCell>
                                <TableCell align="right">{formatCurrency(account?.outstanding_balance || 0)}</TableCell>
                                <TableCell color="text.secondary">Total exposure at default</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Discount Rate (EIR)</TableCell>
                                <TableCell align="right">{(calculation.assumptions?.discountRate || calculation.assumptions?.effectiveInterestRate || 0).toFixed(2)}%</TableCell>
                                <TableCell color="text.secondary">Effective Interest Rate used for discounting</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Scenario Method</TableCell>
                                <TableCell align="right">{calculation.scenario || 'Multi-Scenario Weighted'}</TableCell>
                                <TableCell color="text.secondary">Economic scenario probability model applied</TableCell>
                            </TableRow>
                             <TableRow sx={{ bgcolor: 'primary.50' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Calculated PV</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(calculation.presentValue || 0)}</TableCell>
                                <TableCell sx={{ fontSize: '0.75rem' }}>Sum of all discounted recovery cash flows</TableCell>
                            </TableRow>
                             <TableRow sx={{ bgcolor: 'error.50' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Impairment Loss (LGD)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(calculation.lgd || 0)}</TableCell>
                                <TableCell sx={{ fontSize: '0.75rem' }}>Exposure - Recoverable Amount</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
          </Grid>

           {/* Detailed Amortization Table */}
           <Grid size={12}>
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Amortization & Unwinding Schedule
                </Typography>
                <Chip label={`${calculation.details?.length || 0} Periods`} size="small" variant="outlined" />
              </Box>
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ maxHeight: 350 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Beginning Balance</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Interest Accrual</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Expected Recovery</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Ending Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculation.details?.map((row: any, idx: number) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{row.period}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{formatCurrency(row.beginningBalance)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'success.main' }}>+{formatCurrency(row.interestAccrual)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'error.main' }}>-{formatCurrency(row.weightedFlow || row.cashflow)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{formatCurrency(row.endingBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

           <Grid size={12}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: isReadyToSubmit ? 'success.50' : 'grey.50', border: '1px dashed', borderColor: isReadyToSubmit ? 'success.main' : 'divider' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="subtitle1" fontWeight={700} color={isReadyToSubmit ? 'success.main' : 'text.primary'}>
                            {isReadyToSubmit ? 'Ready for Final Submission' : 'Incomplete Assessment Package'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isReadyToSubmit
                                ? 'Seluruh tahap (Adjustment & DCF) telah selesai divalidasi. Klik tombol di samping untuk mengirimkan paket assessment ini ke antrian approval Checker.'
                                : 'Anda harus menyelesaikan tahap Adjustment (Details) dan DCF Analysis terlebih dahulu sebelum dapat mengirimkan paket ini ke Checker.'}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                        <LoadingButton
                            variant="contained"
                            color="success"
                            size="large"
                            disabled={!isReadyToSubmit}
                            loading={submitting}
                            startIcon={<SendIcon />}
                            onClick={onFinalSubmit}
                            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                        >
                            Submit Assessment Package
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Silakan lakukan analisis DCF terlebih dahulu untuk menghitung nilai pencadangan (Provision).
        </Alert>
      )}
    </Box>
  );
}
