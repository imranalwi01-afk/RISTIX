// packages/frontend/src/app/banking/ifrs9/amortization-module/page.tsx
// ============================================================================
// 🏦 IFRS9 - AMORTIZATION MODULE MANAGEMENT
// ============================================================================
// ✅ PHASE 1: IFRS9 Amortization Calculation Module
// ✅ PURPOSE: Effective interest rate method and amortization calculations
// ✅ COMPLIANT: IFRS9 requirements for financial asset amortization
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab
} from '@mui/material';

import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  DateRange as DateRangeIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

// API Service Integration
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';

// Types for Amortization Module
interface AmortizationCalculation {
  id: string;
  calculationName: string;
  portfolioId: string;
  portfolioName: string;
  financialAssetId: string;
  financialAssetCode: string;
  financialAssetName: string;
  calculationDate: string;
  effectiveInterestRate: number;
  nominalRate: number;
  amortizationMethod: 'EFFECTIVE' | 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  currency: string;
  originalBookValue: number;
  currentBookValue: number;
  grossCarryingAmount: number;
  allowanceAccount: number;
  netCarryingAmount: number;
  amortizationStartDate: string;
  amortizationEndDate: string;
  termInMonths: number;
  remainingTermMonths: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

interface AmortizationSchedule {
  id: string;
  calculationId: string;
  periodNumber: number;
  periodDate: string;
  openingBookValue: number;
  interestIncome: number;
  cashReceived: number;
  amortizationAmount: number;
  closingBookValue: number;
  effectiveRateForPeriod: number;
  interestReceivable: number;
  principalRepayment: number;
}

interface AmortizationConfiguration {
  id: string;
  configName: string;
  amortizationMethod: 'EFFECTIVE' | 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  defaultNominalRate: number;
  calculationFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  roundingMethod: 'ROUND_UP' | 'ROUND_DOWN' | 'ROUND_NEAREST';
  isActive: boolean;
  lastUpdated: string;
  updatedBy: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AmortizationModulePage() {
  const { user } = useAuth();
  const { apiCall } = useApi();

  // State Management
  const [calculations, setCalculations] = useState<AmortizationCalculation[]>([]);
  const [schedules, setSchedules] = useState<AmortizationSchedule[]>([]);
  const [configurations, setConfigurations] = useState<AmortizationConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);

  // Dialog States
  const [runCalculationDialogOpen, setRunCalculationDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<AmortizationCalculation | null>(null);

  // Form States
  const [calculationForm, setCalculationForm] = useState({
    calculationName: '',
    portfolioId: '',
    financialAssetId: '',
    amortizationMethod: 'EFFECTIVE' as const,
    nominalRate: 0,
    effectiveInterestRate: 0,
    originalBookValue: 0,
    amortizationStartDate: new Date().toISOString().split('T')[0],
    amortizationEndDate: '',
    currency: 'IDR'
  });

  // Load Data
  const loadCalculations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      const response = await apiCall(`/api/v1/ifrs9/amortization-module/calculations?${params}`) as ApiResponse<AmortizationCalculation>;

      if (response.success) {
        setCalculations(response.data);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load amortization calculations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall, page, rowsPerPage]);

  const loadConfigurations = useCallback(async () => {
    try {
      const response = await apiCall('/api/v1/ifrs9/amortization-module/configurations') as ApiResponse<AmortizationConfiguration>;

      if (response.success) {
        setConfigurations(response.data);
      }
    } catch (err) {
      console.error('Failed to load configurations:', err);
    }
  }, [apiCall]);

  useEffect(() => {
    loadCalculations();
    loadConfigurations();
  }, [loadCalculations, loadConfigurations]);

  // Form Handlers
  const handleRunCalculation = async () => {
    try {
      setError(null);
      const response = await apiCall('/api/v1/ifrs9/amortization-module/run-calculation', {
        method: 'POST',
        body: JSON.stringify(calculationForm),
        headers: { 'Content-Type': 'application/json' }
      }) as any;

      if (response.success) {
        setSuccess('Amortization calculation started successfully');
        setRunCalculationDialogOpen(false);
        resetCalculationForm();
        loadCalculations();
      } else {
        setError(response.message || 'Failed to start amortization calculation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCalculationInputChange = (field: string, value: any) => {
    setCalculationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetCalculationForm = () => {
    setCalculationForm({
      calculationName: '',
      portfolioId: '',
      financialAssetId: '',
      amortizationMethod: 'EFFECTIVE',
      nominalRate: 0,
      effectiveInterestRate: 0,
      originalBookValue: 0,
      amortizationStartDate: new Date().toISOString().split('T')[0],
      amortizationEndDate: '',
      currency: 'IDR'
    });
  };

  const loadSchedule = async (calculationId: string) => {
    try {
      const response = await apiCall(`/api/v1/ifrs9/amortization-module/calculations/${calculationId}/schedule`) as ApiResponse<AmortizationSchedule>;

      if (response.success) {
        setSchedules(response.data);
        setScheduleDialogOpen(true);
      } else {
        setError(response.message || 'Failed to load amortization schedule');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Render Helper Functions
  const renderStatusChip = (status: string, progress?: number) => {
    const colors = {
      PENDING: 'warning',
      RUNNING: 'info',
      COMPLETED: 'success',
      FAILED: 'error'
    };

    return (
      <Box>
        <Chip
          label={status}
          color={(colors[status as keyof typeof colors] as any) || 'default'}
          size="small"
          icon={status === 'RUNNING' ? <SpeedIcon /> : undefined}
        />
        {status === 'RUNNING' && progress !== undefined && (
          <Box sx={{ mt: 1, width: '100%' }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" display="block" textAlign="center">
              {progress}%
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderAmortizationMethodChip = (method: string) => {
    const colors = {
      EFFECTIVE: 'primary',
      STRAIGHT_LINE: 'secondary',
      DECLINING_BALANCE: 'warning'
    };
    return <Chip label={method} color={(colors[method as keyof typeof colors] as any) || 'default'} size="small" />;
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Main Render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/banking">
            Banking
          </Link>
          <Link color="inherit" href="/banking/ifrs9">
            IFRS 9
          </Link>
          <Typography color="text.primary">
            Amortization Module
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          IFRS 9 Amortization Module
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Effective interest rate method calculations and financial asset amortization schedules
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
            <Tab label="Calculations" icon={<CalculateIcon />} />
            <Tab label="Schedules" icon={<ScheduleIcon />} />
            <Tab label="Configurations" icon={<SettingsIcon />} />
            <Tab label="Analytics" icon={<AssessmentIcon />} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Calculations Tab */}
      {currentTab === 0 && (
        <>
          {/* Action Bar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => setRunCalculationDialogOpen(true)}
                    >
                      Run Calculation
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadCalculations}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                    >
                      Import Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                    >
                      Export Results
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" justifyContent="flex-end">
                    <Typography variant="h6" color="primary">
                      {calculations.length} Calculations
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Book Value
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.currentBookValue || 0), 0)
                        )}
                      </Typography>
                    </Box>
                    <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Allowance Account
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.allowanceAccount || 0), 0)
                        )}
                      </Typography>
                    </Box>
                    <MonetizationOnIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Net Carrying Amount
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.netCarryingAmount || 0), 0)
                        )}
                      </Typography>
                    </Box>
                    <ReceiptIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Avg Effective Rate
                      </Typography>
                      <Typography variant="h5">
                        {calculations.length > 0
                          ? formatPercentage(
                            calculations.reduce((sum, calc) => sum + (calc.effectiveInterestRate || 0), 0) / calculations.length
                          )
                          : '0%'
                        }
                      </Typography>
                    </Box>
                    <CurrencyExchangeIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Calculations Table */}
          <Card>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Calculation Name</TableCell>
                        <TableCell>Financial Asset</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Effective Rate</TableCell>
                        <TableCell>Current Book Value</TableCell>
                        <TableCell>Allowance</TableCell>
                        <TableCell>Net Carrying</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calculations.map((calc) => (
                        <TableRow key={calc.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">
                                {calc.calculationName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {calc.calculationDate}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {calc.financialAssetCode}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {calc.financialAssetName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {renderAmortizationMethodChip(calc.amortizationMethod)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatPercentage(calc.effectiveInterestRate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calc.currentBookValue, calc.currency)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calc.allowanceAccount, calc.currency)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calc.netCarryingAmount, calc.currency)}
                          </TableCell>
                          <TableCell>
                            {renderStatusChip(calc.status, calc.progress)}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => loadSchedule(calc.id)}
                                title="View Schedule"
                                disabled={calc.status !== 'COMPLETED'}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Download Report"
                                disabled={calc.status !== 'COMPLETED'}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {calculations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center">
                            <Box py={4}>
                              <Typography variant="h6" color="text.secondary">
                                No amortization calculations found
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => setRunCalculationDialogOpen(true)}
                                sx={{ mt: 2 }}
                              >
                                Run First Calculation
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setPage(0);
                    }}
                  />
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Schedules Tab */}
      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Amortization Schedules
            </Typography>
            <Typography color="textSecondary">
              Select a calculation from the Calculations tab to view its amortization schedule
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <PieChartIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Configurations Tab */}
      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Amortization Method Configurations
              </Typography>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => setConfigDialogOpen(true)}
              >
                Configure Methods
              </Button>
            </Box>

            <List>
              {configurations.map((config) => (
                <ListItem key={config.id} divider>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={config.configName}
                    secondary={`${config.amortizationMethod} - ${config.calculationFrequency}`}
                  />
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={config.isActive ? 'Active' : 'Inactive'}
                      color={config.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Default Rate: {formatPercentage(config.defaultNominalRate)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              {configurations.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No configurations found
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {currentTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Amortization Trends
                </Typography>
                <Typography color="textSecondary">
                  Book value and allowance trends over time
                </Typography>
                <Box sx={{ height: 300, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TimelineIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Effective Rate Analysis
                </Typography>
                <Typography color="textSecondary">
                  Effective interest rate distribution across assets
                </Typography>
                <Box sx={{ height: 300, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Run Calculation Dialog */}
      <Dialog open={runCalculationDialogOpen} onClose={() => setRunCalculationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run Amortization Calculation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Calculation Name"
                  value={calculationForm.calculationName}
                  onChange={(e) => handleCalculationInputChange('calculationName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Portfolio ID"
                  value={calculationForm.portfolioId}
                  onChange={(e) => handleCalculationInputChange('portfolioId', e.target.value)}
                  margin="normal"
                  helperText="Enter the portfolio ID"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Financial Asset ID"
                  value={calculationForm.financialAssetId}
                  onChange={(e) => handleCalculationInputChange('financialAssetId', e.target.value)}
                  margin="normal"
                  helperText="Enter the financial asset ID"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Amortization Method</InputLabel>
                  <Select
                    value={calculationForm.amortizationMethod}
                    label="Amortization Method"
                    onChange={(e) => handleCalculationInputChange('amortizationMethod', e.target.value)}
                  >
                    <MenuItem value="EFFECTIVE">Effective Interest Rate Method</MenuItem>
                    <MenuItem value="STRAIGHT_LINE">Straight Line Method</MenuItem>
                    <MenuItem value="DECLINING_BALANCE">Declining Balance Method</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={calculationForm.currency}
                    label="Currency"
                    onChange={(e) => handleCalculationInputChange('currency', e.target.value)}
                  >
                    <MenuItem value="IDR">IDR - Indonesian Rupiah</MenuItem>
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nominal Rate (%)"
                  type="number"
                  value={calculationForm.nominalRate}
                  onChange={(e) => handleCalculationInputChange('nominalRate', parseFloat(e.target.value))}
                  margin="normal"
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Effective Interest Rate (%)"
                  type="number"
                  value={calculationForm.effectiveInterestRate}
                  onChange={(e) => handleCalculationInputChange('effectiveInterestRate', parseFloat(e.target.value))}
                  margin="normal"
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Original Book Value"
                  type="number"
                  value={calculationForm.originalBookValue}
                  onChange={(e) => handleCalculationInputChange('originalBookValue', parseFloat(e.target.value))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amortization Start Date"
                  type="date"
                  value={calculationForm.amortizationStartDate}
                  onChange={(e) => handleCalculationInputChange('amortizationStartDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amortization End Date"
                  type="date"
                  value={calculationForm.amortizationEndDate}
                  onChange={(e) => handleCalculationInputChange('amortizationEndDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunCalculationDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRunCalculation} variant="contained">
            Run Calculation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Amortization Schedule</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Opening BV</TableCell>
                  <TableCell>Interest</TableCell>
                  <TableCell>Cash</TableCell>
                  <TableCell>Amortization</TableCell>
                  <TableCell>Closing BV</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.periodNumber}</TableCell>
                    <TableCell>{schedule.periodDate}</TableCell>
                    <TableCell>{formatCurrency(schedule.openingBookValue)}</TableCell>
                    <TableCell>{formatCurrency(schedule.interestIncome)}</TableCell>
                    <TableCell>{formatCurrency(schedule.cashReceived)}</TableCell>
                    <TableCell>{formatCurrency(schedule.amortizationAmount)}</TableCell>
                    <TableCell>{formatCurrency(schedule.closingBookValue)}</TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        No schedule data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!success || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess(null);
          setError(null);
        }}
      >
        <Alert
          severity={success ? 'success' : 'error'}
          onClose={() => {
            setSuccess(null);
            setError(null);
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  );
}