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
  Paper
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
  Assignment as AssignmentIcon
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
  onStagedDCF
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
      calculationResults.outstanding ??
      calculationResults.outstandingBalance ??
      account?.outstanding_balance ??
      account?.outstanding ??
      0;

    return {
      ...calculationResults,
      presentValue: toFiniteNumber(calculationResults.presentValue ?? calculationResults.pvDcfAmt),
      outstanding: toFiniteNumber(outstanding),
      lgd: toFiniteNumber(calculationResults.lgd ?? calculationResults.impairmentLoss),
      recommendedProvision: toFiniteNumber(calculationResults.recommendedProvision ?? calculationResults.eclIaAmt),
      details: rawDetails.map((row: any) => ({
        ...row,
        beginningBalance: toFiniteNumber(row.beginningBalance),
        interestAccrual: toFiniteNumber(row.interestAccrual),
        weightedFlow: toFiniteNumber(row.weightedFlow ?? row.cashflow),
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

    // 1. Validate PO Rate (Total must be 100)
    const totalPo = assumptions.poRate1 + assumptions.poRate2 + assumptions.poRate3;
    if (totalPo !== 100) {
      setValidationError(`Total PO Rate must be exactly 100% (Current: ${totalPo}%)`);
      return;
    }

    // 2. Validate Repayment Rate (At least one must reach 100, usually Base Case)
    // As per user request: "repayment rate harus mencapai 100%"
    if (assumptions.rrRate1 < 100 && assumptions.rrRate2 < 100 && assumptions.rrRate3 < 100) {
      setValidationError('At least one scenario (ideally Base Case) must have a Repayment Rate of 100%');
      return;
    }

    onCalculate({
      ...assumptions,
      accountId: account?.account_id
    });
  };

  const handleUploadSuccess = (rows: any[]) => {
    setUploadDialogOpen(false);
    // Trigger calculation with uploaded cashflows
    onCalculate({
      ...assumptions,
      accountId: account?.account_id,
      cashflows: rows
    });
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
                  <Box sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>Scenario 1: Base Case</Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate1}
                        onChange={(e) => handleAssumptionChange('poRate1', Number(e.target.value))}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate1}
                        onChange={(e) => handleAssumptionChange('rrRate1', Number(e.target.value))}
                      />
                    </Stack>
                  </Box>
                </Grid>
                {/* Scenario 2: Optimistic */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>Scenario 2: Optimistic</Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate2}
                        onChange={(e) => handleAssumptionChange('poRate2', Number(e.target.value))}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate2}
                        onChange={(e) => handleAssumptionChange('rrRate2', Number(e.target.value))}
                      />
                    </Stack>
                  </Box>
                </Grid>
                {/* Scenario 3: Pessimistic */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.05)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom>Scenario 3: Pessimistic</Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="PO Rate (Weight %)" size="small" type="number"
                        value={assumptions.poRate3}
                        onChange={(e) => handleAssumptionChange('poRate3', Number(e.target.value))}
                      />
                      <TextField
                        label="Repayment Rate (%)" size="small" type="number"
                        value={assumptions.rrRate3}
                        onChange={(e) => handleAssumptionChange('rrRate3', Number(e.target.value))}
                      />
                    </Stack>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth label="Time Horizon (Months)" size="small" type="number"
                    value={assumptions.timeHorizon}
                    onChange={(e) => handleAssumptionChange('timeHorizon', Number(e.target.value))}
                  />
                </Grid>
                {validationError && (
                  <Grid size={12}>
                    <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 'bold' }}>
                      {validationError}
                    </Alert>
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    fullWidth variant="contained" size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    onClick={handleCalculate}
                    disabled={loading}
                    sx={{ height: '56px', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Calculate
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                   <Button
                    fullWidth variant="outlined" size="large"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{ height: '56px', borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Upload DCF
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
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
                    { label: 'Present Value (NPV)', value: normalizedResults.presentValue, color: 'primary.main', bg: '#e3f2fd' },
                    { label: 'Outstanding Balance', value: normalizedResults.outstanding, color: 'text.primary', bg: '#f5f5f5' },
                    { label: 'Impairment Loss (LGD)', value: normalizedResults.lgd, color: 'error.main', bg: '#ffebee' },
                    { label: 'Recommended Provision', value: normalizedResults.recommendedProvision, color: 'warning.dark', bg: '#fffde7' }
                   ].map((item, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
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
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Period</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Beginning Balance</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Interest (EIR)</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Weighted Flow</TableCell>
                        <TableCell sx={{ bgcolor: '#f8f9fa', fontWeight: 'bold' }}>Ending Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {normalizedResults.details.length > 0 ? normalizedResults.details.map((row: any, idx: number) => (
                        <TableRow key={`${row.period || 'period'}-${idx}`} hover>
                          <TableCell>{row.period || '-'}</TableCell>
                          <TableCell>{formatCurrency(row.beginningBalance)}</TableCell>
                          <TableCell sx={{ color: 'success.main' }}>+{formatCurrency(row.interestAccrual)}</TableCell>
                          <TableCell sx={{ color: 'error.main' }}>-{formatCurrency(row.weightedFlow)}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.endingBalance)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5}>
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
