// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ShowChart as ShowChartIcon,
  PlayArrow as RunIcon,
  Clear as ClearIcon,
  Addchart as AddChartIcon,
  AccountBalance as AccountBalanceIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import dayjs from 'dayjs';
import {
  type IndividualImpairmentWatchlistItem,
  type IndividualImpairmentAssessment,
  individualImpairmentAPI
} from '@/services/api.individual-impairment';
import { DCFUploadTab } from './DCFUploadTab';

interface DCFAnalysisTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  onCalculate: (parameters: any) => void;
  loading: boolean;
  calculationResults?: any;
  onClearResults?: () => void;
  onStagedDCF?: (data: any) => void;
  stagedDCF?: any;
}

function toFiniteNumber(value: unknown, fallback = 0) {
  const normalized = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function formatCurrency(amount: unknown) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toFiniteNumber(amount));
}

export function DCFAnalysisTab({
  account,
  assessment,
  onCalculate,
  loading,
  calculationResults,
  onClearResults,
  stagedDCF,
  onStagedDCF,
}: DCFAnalysisTabProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [assumptions, setAssumptions] = useState({
    poRate1: 50, rrRate1: 100,
    poRate2: 30, rrRate2: 80,
    poRate3: 20, rrRate3: 50,
    timeHorizon: 60
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const normalizedResults = useMemo(() => {
    if (!calculationResults) return null;

    const rawDetails = Array.isArray(calculationResults.details) ? calculationResults.details : [];
    const outstanding =
      calculationResults.outstandingBalance ??
      calculationResults.outstanding ??
      account?.outstanding_balance ??
      account?.outstanding ??
      0;

    return {
      ...calculationResults,
      presentValue: toFiniteNumber(calculationResults.presentValue ?? calculationResults.totalNpv ?? calculationResults.pvDcfAmt),
      outstanding: toFiniteNumber(outstanding),
      iaProvision: toFiniteNumber(calculationResults.eclIaAmt ?? calculationResults.recommendedProvision ?? calculationResults.lgd ?? calculationResults.impairmentLoss),
      lgd: toFiniteNumber(calculationResults.lgd ?? calculationResults.eclIaAmt ?? calculationResults.impairmentLoss),
      recommendedProvision: toFiniteNumber(calculationResults.recommendedProvision ?? calculationResults.eclIaAmt),
      details: rawDetails.map((row: any) => ({
        ...row,
        period: row.period || row.periode || row.mob,
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
  }, [calculationResults, account]);

  if (!account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Pilih debitur dari Watchlist untuk melakukan DCF Analysis.
        </Alert>
      </Box>
    );
  }

  const handleCalculate = () => {
    setValidationError(null);

    const totalPo = assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3;
    if (totalPo !== 100) {
      setValidationError(`Total PO Rate must be exactly 100% (Current: ${totalPo}%)`);
      return;
    }

    // IA_FLOWS Rule: Generate default monthly cashflows if none exist for Quick Calculate
    const horizon = assumptions.timeHorizon || 12;
    const outstanding = toFiniteNumber(account?.outstanding_balance || account?.outstanding || 0);
    const monthlyPrincipal = outstanding / horizon;
    
    const generatedCashflows = [];
    const startDate = dayjs();
    
    for (let i = 1; i <= horizon; i++) {
      generatedCashflows.push({
        mob: i,
        periode: startDate.add(i, 'month').format('YYYY-MM-DD'),
        principal: monthlyPrincipal,
        interest: 0,
        collateral: 0
      });
    }

    onCalculate({
      accountId: account?.account_id,
      accountNumber: account?.account_number,
      assumptions: {
        ...assumptions,
        discountRate: account?.eff_interest_rate || account?.interest_rate || 12,
        nOfScenario: 3,
        method: '3'
      },
      repaymentRates: [
        {
          periodStart: startDate.format('YYYY-MM-DD'),
          periodEnd: startDate.add(horizon + 1, 'month').format('YYYY-MM-DD'),
          rrRate1: assumptions.rrRate1,
          rrRate2: assumptions.rrRate2,
          rrRate3: assumptions.rrRate3
        }
      ],
      cashflows: generatedCashflows
    });
  };

  const handleProcessStaged = () => {
    if (!stagedDCF) return;
    onCalculate({
      accountId: account?.account_id,
      assumptions: {
        ...(stagedDCF.assumptions || assumptions),
        discountRate: account?.eff_interest_rate || account?.interest_rate || 12
      },
      repaymentRates: stagedDCF.repaymentRates || [],
      cashflows: stagedDCF.cashflows || []
    });
  };

  const handleUploadSuccess = (rows: any[]) => {
    setUploadDialogOpen(false);
  };

  const handleAssumptionChange = (field: string, value: number) => {
    setAssumptions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 700 }}>
        <CalculateIcon sx={{ mr: 1, color: 'primary.main' }} />
        Advanced DCF Analysis - {account?.account_number}
      </Typography>

      <Grid container spacing={3}>
        {/* Scenario Weighting Panel */}
        <Grid size={12}>
          <Card sx={{ borderLeft: '5px solid', borderColor: 'primary.main', boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ShowChartIcon sx={{ mr: 1 }} /> Multi-Scenario Weighting & Assumptions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Scenario 1: Base */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2.5, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 3, border: '1px solid rgba(33, 150, 243, 0.2)', borderLeft: '6px solid #1976d2' }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      SCENARIO 1: BASE CASE
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate1}
                        onChange={(e) => handleAssumptionChange('poRate1', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate1}
                        onChange={(e) => handleAssumptionChange('rrRate1', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Stack>
                  </Box>
                </Grid>
                {/* Scenario 2: Optimistic */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2.5, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 3, border: '1px solid rgba(76, 175, 80, 0.2)', borderLeft: '6px solid #2e7d32' }}>
                    <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      SCENARIO 2: OPTIMISTIC
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate2}
                        onChange={(e) => handleAssumptionChange('poRate2', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate2}
                        onChange={(e) => handleAssumptionChange('rrRate2', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Stack>
                  </Box>
                </Grid>
                {/* Scenario 3: Pessimistic */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2.5, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 3, border: '1px solid rgba(244, 67, 54, 0.2)', borderLeft: '6px solid #d32f2f' }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      SCENARIO 3: PESSIMISTIC
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate3}
                        onChange={(e) => handleAssumptionChange('poRate3', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate3}
                        onChange={(e) => handleAssumptionChange('rrRate3', Number(e.target.value))}
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Stack>
                  </Box>
                </Grid>

                {/* Weight Tracker Section */}
                <Grid size={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: (assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) === 100 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 152, 0, 0.05)', borderStyle: 'dashed' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                       <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Total Possible Outcome (PO) Weighting 
                          {(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) === 100 ? <CheckCircleIcon color="success" sx={{ fontSize: 18 }} /> : <WarningIcon color="warning" sx={{ fontSize: 18 }} />}
                       </Typography>
                       <Typography variant="body2" fontWeight="bold" color={(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) === 100 ? "success.main" : "warning.main"}>
                          {assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3}% / 100%
                       </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3, 100)} 
                      color={(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) === 100 ? "success" : "warning"}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth label="Time Horizon (Months)" size="small" type="number"
                    value={assumptions.timeHorizon}
                    onChange={(e) => handleAssumptionChange('timeHorizon', Number(e.target.value))}
                    sx={{ mt: 1 }}
                    helperText="Masa proyeksi arus kas dalam bulan"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: stagedDCF ? 3 : 4 }}>
                  <Button
                    fullWidth variant="contained" size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    onClick={handleCalculate}
                    disabled={loading}
                    sx={{ height: '56px', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Quick Calculate
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: stagedDCF ? 3 : 4 }}>
                   <Button
                    fullWidth variant="outlined" size="large"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{ height: '56px', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Upload DCF
                  </Button>
                </Grid>
                {stagedDCF && (
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Button
                            fullWidth variant="contained" size="large" color="success"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RunIcon />}
                            onClick={handleProcessStaged}
                            disabled={loading}
                            sx={{ height: '56px', borderRadius: 2, fontWeight: 'bold', boxShadow: 3 }}
                        >
                            Recalculate (Staged)
                        </Button>
                    </Grid>
                )}
                <Grid size={{ xs: 12, md: stagedDCF ? 3 : 4 }}>
                   <Button
                    fullWidth variant="text" size="large"
                    onClick={onClearResults}
                    disabled={!calculationResults}
                    sx={{ height: '56px', borderRadius: 2 }}
                  >
                    Clear
                  </Button>
                </Grid>

                {/* Validation Info */}
                <Grid size={12}>
                  <Alert severity={(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) === 100 ? "info" : "warning"} sx={{ py: 0 }}>
                    Total PO Rate: <strong>{assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3}%</strong>
                    {(assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3) !== 100 ? " (Must be exactly 100%)" : " (Valid)"}
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* DCF Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa' }}>
            <Typography variant="h6" component="span" fontWeight="bold">Upload Cash Flow Detail</Typography>
            <Button onClick={() => setUploadDialogOpen(false)}><CloseIcon /></Button>
          </DialogTitle>
          <DialogContent dividers>
            <DCFUploadTab
              account={account}
              onUploadSuccess={handleUploadSuccess}
              initialAssumptions={assumptions}
              onStagedDCF={onStagedDCF}
            />
          </DialogContent>
        </Dialog>

        {/* DCF Results & Amortization Schedule */}
        {normalizedResults && (
          <Grid size={12}>
            <Card sx={{ boxShadow: 5, borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary">Assessment Results Summary</Typography>
                  <Chip label="PROCESSED" color="success" variant="filled" size="small" sx={{ fontWeight: 'bold' }} />
                </Stack>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                   {[
                    { label: 'PV Cashflow', value: normalizedResults.presentValue, color: 'primary.main', bg: '#e3f2fd' },
                    { label: 'Outstanding Balance', value: normalizedResults.outstanding, color: 'text.primary', bg: '#f5f5f5' },
                    { label: 'IA Provision', value: normalizedResults.iaProvision, color: 'error.main', bg: '#ffebee' }
                   ].map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <Box sx={{ p: 2, bgcolor: item.bg, borderRadius: 2, textAlign: 'center', height: '100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: item.color }}>{formatCurrency(item.value)}</Typography>
                      </Box>
                    </Grid>
                   ))}
                </Grid>

                {/* Amortization Table */}
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="primary" /> Amortization & Unwinding Schedule
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: 2, border: '1px solid #eee' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>MOB</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Period</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Principal</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Interest</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Installment</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Collateral</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">PO Rate 1</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">RR Rate 1</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Default 1</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">PO Rate 2</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">RR Rate 2</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Default 2</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">PO Rate 3</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">RR Rate 3</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Default 3</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Weighted Flow</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Discount Factor</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">PV Amount</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Beginning Balance</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Interest (EIR)</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold', whiteSpace: 'nowrap' }} align="right">Ending Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {normalizedResults.details.length > 0 ? normalizedResults.details.map((row: any, idx: number) => (
                        <TableRow key={`${row.period || 'period'}-${idx}`} hover>
                          <TableCell>{row.mob || '-'}</TableCell>
                          <TableCell>{row.period || '-'}</TableCell>
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
                          <TableCell align="right" sx={{ color: 'error.main' }}>-{formatCurrency(row.weightedFlow)}</TableCell>
                          <TableCell align="right">{toFiniteNumber(row.discountFactor).toFixed(6)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.pvAmt)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.beginningBalance)}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>+{formatCurrency(row.interestAccrual)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(row.endingBalance)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={21}>
                            <Alert severity="info" sx={{ my: 1 }}>
                              No amortization schedule rows returned for this DCF calculation.
                            </Alert>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Visual Chart Trend */}
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddChartIcon color="primary" /> Projected Recovery Trend
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ height: 350, width: '100%', mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={normalizedResults.details}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2196f3" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4caf50" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="period"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9e9e9e', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9e9e9e', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Legend verticalAlign="top" align="right" height={36}/>
                      <Area
                        name="Ending Balance"
                        type="monotone"
                        dataKey="endingBalance"
                        stroke="#2196f3"
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                        strokeWidth={3}
                      />
                      <Area
                        name="Monthly Cash Flow"
                        type="monotone"
                        dataKey="weightedFlow"
                        stroke="#4caf50"
                        fillOpacity={1}
                        fill="url(#colorFlow)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#f1f8e9', borderRadius: 2, borderLeft: '4px solid #4caf50' }}>
                  <Typography variant="body2" color="text.secondary">
                    * Grafik di atas menunjukkan proyeksi penurunan saldo hutang (Ending Balance) seiring dengan diterimanya pembayaran (Monthly Cash Flow) selama jangka waktu {assumptions.timeHorizon} bulan.
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    * Calculation based on EIR: <strong>{toFiniteNumber(normalizedResults.assumptions?.eir).toFixed(2)}%</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
