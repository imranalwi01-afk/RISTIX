// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
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
import { useTheme, alpha } from '@mui/material/styles';
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
  const theme = useTheme();
  const toFiniteNumber = (value: unknown, fallback = 0) => {
    const normalized = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(toFiniteNumber(amount));
  };

  // IMPORTANT:
  // Do not lock maker submission using legacy numeric assessment.status,
  // because many in-progress assessments keep status=0 (PENDING) before first approval submit.
  // We only lock when approval state itself is already pending/approved.
  const approvalState = String(
    assessment?.approval_status ||
    assessment?.assessment_status ||
    account?.assessment_status ||
    ''
  ).toUpperCase();

  const isPending = approvalState === 'PENDING';
  const isApproved = approvalState === 'APPROVED' || approvalState === 'COMPLETED';

  const canSubmit = !isPending && !isApproved;
  const isReadyToSubmit = isStagedOverrideReady && isStagedDCFReady && canSubmit;
  const normalizedCalculation = useMemo(() => {
    if (!calculation) return null;

    const outstanding =
      calculation.outstandingBalance ??
      calculation.outstanding ??
      account?.outstanding_balance ??
      account?.outstanding ??
      0;
    
    const details = Array.isArray(calculation.details) ? calculation.details : [];

    return {
      ...calculation,
      presentValue: toFiniteNumber(calculation.presentValue ?? calculation.totalNpv ?? calculation.pvDcfAmt),
      outstanding: toFiniteNumber(outstanding),
      iaProvision: toFiniteNumber(calculation.eclIaAmt ?? calculation.recommendedProvision ?? calculation.lgd ?? calculation.impairmentLoss),
      lgd: toFiniteNumber(calculation.lgd ?? calculation.eclIaAmt ?? calculation.impairmentLoss),
      recommendedProvision: toFiniteNumber(calculation.recommendedProvision ?? calculation.eclIaAmt),
      assumptions: calculation.assumptions || {},
      details: details.map((row: any) => ({
        ...row,
        period: row.period || row.periode,
        mob: toFiniteNumber(row.mob),
        principal: toFiniteNumber(row.principal),
        interest: toFiniteNumber(row.interest),
        installment: toFiniteNumber(row.installment ?? (toFiniteNumber(row.principal) + toFiniteNumber(row.interest))),
        collateral: toFiniteNumber(row.collateral),
        poRate1: toFiniteNumber(row.poRate1),
        rrRate1: toFiniteNumber(row.rrRate1),
        default1: toFiniteNumber(row.default1),
        poRate2: toFiniteNumber(row.poRate2),
        rrRate2: toFiniteNumber(row.rrRate2),
        default2: toFiniteNumber(row.default2),
        poRate3: toFiniteNumber(row.poRate3),
        rrRate3: toFiniteNumber(row.rrRate3),
        default3: toFiniteNumber(row.default3),
        discountFactor: toFiniteNumber(row.discountFactor),
        pvAmt: toFiniteNumber(row.pvAmt),
        beginningBalance: toFiniteNumber(row.beginningBalance),
        interestAccrual: toFiniteNumber(row.interestAccrual ?? row.eirAmt),
        weightedFlow: toFiniteNumber(row.weightedFlow ?? row.pwAmt ?? row.cashflow),
        endingBalance: toFiniteNumber(row.endingBalance),
      })),
    };
  }, [account, calculation]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark', letterSpacing: '-0.5px' }}>
                Assessment Results Summary
            </Typography>
            <Chip 
                label="PROCESSED" 
                color="success" 
                size="small" 
                sx={{ fontWeight: 900, borderRadius: '8px', px: 1 }} 
            />
        </Stack>

        {normalizedCalculation && (
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

      {normalizedCalculation ? (
        <Grid container spacing={3}>
          {/* Summary Cards - Exactly matching reference */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#eef6ff', border: 'none', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    PV Cashflow
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
                  {formatCurrency(normalizedCalculation.presentValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#f5f5f5', border: 'none', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Outstanding Balance
                </Typography>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mt: 1 }}>
                  {formatCurrency(normalizedCalculation.outstanding)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%', bgcolor: '#fff1f0', border: 'none', borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    IA Provision
                </Typography>
                <Typography variant="h5" fontWeight={800} color="#f5222d" sx={{ mt: 1 }}>
                  {formatCurrency(normalizedCalculation.iaProvision)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Table 1: DCF Cashflow Details (Source Data) */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={800}>
                    DCF Cashflow Details (Source Data)
                </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>PERIOD</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }} align="right">PRINCIPAL</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }} align="right">INTEREST</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }} align="right">INSTALLMENT</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }} align="right">COLLATERAL</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {normalizedCalculation.details.length > 0 ? normalizedCalculation.details.map((row: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.period || row.periode || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.principal)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.interest)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(toFiniteNumber(row.principal) + toFiniteNumber(row.interest))}</TableCell>
                      <TableCell align="right" color="text.secondary">{formatCurrency(row.collateral)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                         <Typography variant="body2" color="text.secondary">No source cashflow data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Table 2: Amortization & Unwinding Schedule (Calculation Result) - Exactly matching screenshot */}
          <Grid size={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 3 }}>
                <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={800}>
                    Amortization & Unwinding Schedule
                </Typography>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                maxHeight: 440,
                overflowX: 'auto',
                overflowY: 'auto',
              }}
            >
              <Table stickyHeader size="small" sx={{ minWidth: 2800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>MOB</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>PERIOD</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">PRINCIPAL</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">INTEREST</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">INSTALLMENT</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">COLLATERAL</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">PO RATE 1</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">RR RATE 1</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">DEFAULT 1</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">PO RATE 2</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">RR RATE 2</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">DEFAULT 2</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">PO RATE 3</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">RR RATE 3</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">DEFAULT 3</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">WEIGHTED FLOW</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">DISCOUNT FACTOR</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">PV AMOUNT</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">BEGINNING BALANCE</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">INTEREST (EIR)</TableCell>
                    <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', whiteSpace: 'nowrap' }} align="right">ENDING BALANCE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {normalizedCalculation.details.length > 0 ? normalizedCalculation.details.map((row: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{row.mob || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>{row.period || row.periode || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.principal)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.interest)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.installment)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.collateral)}</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.poRate1).toFixed(2)}%</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.rrRate1).toFixed(2)}%</TableCell>
                      <TableCell align="right">{formatCurrency(row.default1)}</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.poRate2).toFixed(2)}%</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.rrRate2).toFixed(2)}%</TableCell>
                      <TableCell align="right">{formatCurrency(row.default2)}</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.poRate3).toFixed(2)}%</TableCell>
                      <TableCell align="right">{toFiniteNumber(row.rrRate3).toFixed(2)}%</TableCell>
                      <TableCell align="right">{formatCurrency(row.default3)}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                        -{formatCurrency(row.weightedFlow)}
                      </TableCell>
                      <TableCell align="right">{toFiniteNumber(row.discountFactor).toFixed(6)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.pvAmt)}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{formatCurrency(row.beginningBalance)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                        +{formatCurrency(row.interestAccrual)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(row.endingBalance)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={21} align="center" sx={{ py: 6 }}>
                         <Typography variant="body2" color="text.secondary">Waiting for calculation results...</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

           <Grid size={12} sx={{ mt: 2 }}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isReadyToSubmit ? alpha(theme.palette.success.main, 0.05) : (canSubmit ? '#fafafa' : alpha(theme.palette.warning.main, 0.05)), border: '2px dashed', borderColor: isReadyToSubmit ? 'success.main' : (canSubmit ? 'divider' : 'warning.main') }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="subtitle1" fontWeight={800} color={isReadyToSubmit ? 'success.main' : (canSubmit ? 'text.primary' : 'warning.dark')}>
                            {!canSubmit 
                                ? (isApproved ? 'Assessment Already Approved' : 'Assessment Pending Approval')
                                : (isReadyToSubmit ? 'Assessment Package Complete' : 'Pending Verification')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {!canSubmit 
                                ? 'Package assessment ini sedang dalam antrian atau telah disetujui. Tombol submit dinonaktifkan untuk mencegah duplikasi.'
                                : (isReadyToSubmit
                                    ? 'Seluruh kalkulasi DCF dan adjustment telah divalidasi. Anda dapat mengirimkan hasil ini ke Checker untuk proses persetujuan akhir.'
                                    : 'Lengkapi data DCF dan Analysis Scenario untuk mengaktifkan tombol submit.')}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                        <LoadingButton
                            variant="contained"
                            color="success"
                            size="large"
                            disabled={!isReadyToSubmit || !canSubmit}
                            loading={submitting}
                            startIcon={<SendIcon />}
                            onClick={onFinalSubmit}
                            sx={{ px: 5, py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', boxShadow: isReadyToSubmit ? '0 8px 16px rgba(46, 125, 50, 0.24)' : 'none' }}
                        >
                            Submit to Approval
                        </LoadingButton>
                    </Grid>
                </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: '#fcfcfc', border: '1px dashed #ddd' }}>
          <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>No Calculation Results Yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mx: 'auto', mt: 1 }}>
            Lakukan upload DCF dan jalankan kalkulasi di tab sebelumnya untuk melihat hasil perhitungan Provisioning di sini.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
