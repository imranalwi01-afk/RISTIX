// packages/frontend/src/app/banking/ifrs9/impairment-module/page.tsx
// ============================================================================
// 🏦 IFRS9 - IMPAIRMENT MODULE MANAGEMENT
// ============================================================================
// ✅ PHASE 1: IFRS9 Impairment Module Configuration
// ✅ PURPOSE: Central IFRS9 impairment calculation and management
// ✅ COMPLIANT: IFRS9 regulatory requirements for impairment calculations
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
  Switch,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab
} from '@mui/icons-material';

import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
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
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';

// API Service Integration
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/providers/AuthProvider';
import { bankingAPI } from '@/services/api';

// Types for Impairment Module
interface ImpairmentCalculation {
  id: string;
  calculationName: string;
  calculationType: 'ECL' | 'PD' | 'LGD' | 'EAD' | 'STAGING';
  portfolioId: string;
  portfolioName: string;
  calculationDate: string;
  reportingDate: string;
  currency: string;
  totalExposure: number;
  totalECL: number;
  coverageRatio: number;
  stage1Exposure: number;
  stage2Exposure: number;
  stage3Exposure: number;
  stage1ECL: number;
  stage2ECL: number;
  stage3ECL: number;
  modelVersion: string;
  assumptions: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

interface ImpairmentConfiguration {
  id: string;
  configName: string;
  configType: 'ECL_MODEL' | 'PD_MODEL' | 'LGD_MODEL' | 'EAD_MODEL';
  isActive: boolean;
  parameters: Record<string, any>;
  modelVersion: string;
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

export default function ImpairmentModulePage() {
  const { user } = useAuth();
  const { get, post, put, del } = useApi();

  // State Management
  const [calculations, setCalculations] = useState<ImpairmentCalculation[]>([]);
  const [configurations, setConfigurations] = useState<ImpairmentConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);

  // Currency options from Business Settings (B0001)
  const [currencyOptions, setCurrencyOptions] = useState<Array<{ id: string; name: string }>>([]);

  // Dialog States
  const [runCalculationDialogOpen, setRunCalculationDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<ImpairmentCalculation | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<ImpairmentConfiguration | null>(null);

  // Form States
  const [calculationForm, setCalculationForm] = useState({
    calculationName: '',
    calculationType: 'ECL' as const,
    portfolioId: '',
    reportingDate: new Date().toISOString().split('T')[0],
    currency: 'IDR',
    assumptions: ''
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

      const response = await get<ApiResponse<ImpairmentCalculation>>(
        `/api/v1/ifrs9/impairment-module/calculations?${params}`
      );

      if (response.success) {
        setCalculations(response.data);
        setTotalCount(response.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to load impairment calculations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [get, page, rowsPerPage]);

  const loadConfigurations = useCallback(async () => {
    try {
      const response = await get<ApiResponse<ImpairmentConfiguration>>(
        '/api/v1/ifrs9/impairment-module/configurations'
      );

      if (response.success) {
        setConfigurations(response.data);
      }
    } catch (err) {
      console.error('Failed to load configurations:', err);
    }
  }, [get]);

  // Load currency options from Business Settings
  const loadCurrencyOptions = useCallback(async () => {
    try {
      const response = await bankingAPI.businessSetup.getAll();
      if (response.success && response.data) {
        // Find B0001 (Currency) parameter
        const currencyParam = response.data.find((param: any) => param.param_code === 'B0001');
        if (currencyParam && currencyParam.details) {
          const options = currencyParam.details.map((detail: any) => ({
            id: detail.value1 || detail.param_value || '',
            name: detail.paramdesc || detail.param_desc || detail.value1 || ''
          }));
          setCurrencyOptions(options);
        } else {
          // Fallback to static list if B0001 not found
          setCurrencyOptions([
            { id: 'IDR', name: 'IDR - Indonesian Rupiah' },
            { id: 'USD', name: 'USD - US Dollar' },
            { id: 'EUR', name: 'EUR - Euro' }
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load currency options:', err);
      // Fallback to static list on error
      setCurrencyOptions([
        { id: 'IDR', name: 'IDR - Indonesian Rupiah' },
        { id: 'USD', name: 'USD - US Dollar' },
        { id: 'EUR', name: 'EUR - Euro' }
      ]);
    }
  }, []);

  useEffect(() => {
    loadCalculations();
    loadConfigurations();
    loadCurrencyOptions();
  }, [loadCalculations, loadConfigurations, loadCurrencyOptions]);

  // Form Handlers
  const handleRunCalculation = async () => {
    try {
      setError(null);
      const response = await post('/api/v1/ifrs9/impairment-module/run-calculation', calculationForm);

      if (response.success) {
        setSuccess('Impairment calculation started successfully');
        setRunCalculationDialogOpen(false);
        resetCalculationForm();
        loadCalculations();
      } else {
        setError(response.message || 'Failed to start impairment calculation');
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
      calculationType: 'ECL',
      portfolioId: '',
      reportingDate: new Date().toISOString().split('T')[0],
      currency: 'IDR',
      assumptions: ''
    });
  };

  const openResultsDialog = (calculation: ImpairmentCalculation) => {
    setSelectedCalculation(calculation);
    setResultsDialogOpen(true);
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
          color={colors[status as keyof typeof colors] || 'default'}
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

  const renderTrendIcon = (value: number, isPositiveGood: boolean = true) => {
    if (value === 0) return <InfoIcon color="action" />;

    const isGood = isPositiveGood ? value > 0 : value < 0;
    return isGood ? (
      <TrendingUpIcon color="success" />
    ) : (
      <TrendingDownIcon color="error" />
    );
  };

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Main Render
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb" mb={2}>
          <Link color="inherit" href="/banking">
            Banking
          </Link>
          <Link color="inherit" href="/banking/ifrs9">
            IFRS 9
          </Link>
          <Typography color="text.primary">
            Impairment Module
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          IFRS 9 Impairment Module
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive IFRS9 impairment calculations, including ECL, PD, LGD, EAD, and staging analysis
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
                        Total ECL
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.totalECL || 0), 0)
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
                        Total Exposure
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.totalExposure || 0), 0)
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
                        Coverage Ratio
                      </Typography>
                      <Typography variant="h5">
                        {calculations.length > 0
                          ? (calculations.reduce((sum, calc) => sum + (calc.coverageRatio || 0), 0) / calculations.length).toFixed(2) + '%'
                          : '0%'
                        }
                      </Typography>
                    </Box>
                    <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
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
                        Stage 3 Exposure
                      </Typography>
                      <Typography variant="h5">
                        {formatCurrency(
                          calculations.reduce((sum, calc) => sum + (calc.stage3Exposure || 0), 0)
                        )}
                      </Typography>
                    </Box>
                    <WarningIcon color="error" sx={{ fontSize: 40 }} />
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
                        <TableCell>Type</TableCell>
                        <TableCell>Portfolio</TableCell>
                        <TableCell>Reporting Date</TableCell>
                        <TableCell>Total Exposure</TableCell>
                        <TableCell>Total ECL</TableCell>
                        <TableCell>Coverage %</TableCell>
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
                            <Chip label={calc.calculationType} size="small" />
                          </TableCell>
                          <TableCell>{calc.portfolioName}</TableCell>
                          <TableCell>{calc.reportingDate}</TableCell>
                          <TableCell>
                            {formatCurrency(calc.totalExposure, calc.currency)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calc.totalECL, calc.currency)}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {calc.coverageRatio.toFixed(2)}%
                              </Typography>
                              {renderTrendIcon(calc.coverageRatio)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {renderStatusChip(calc.status, calc.progress)}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => openResultsDialog(calc)}
                                title="View Results"
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
                          <TableCell colSpan={9} align="center">
                            <Box py={4}>
                              <Typography variant="h6" color="text.secondary">
                                No impairment calculations found
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

      {/* Configurations Tab */}
      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Impairment Model Configurations
              </Typography>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => setConfigDialogOpen(true)}
              >
                Configure Models
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
                    secondary={`${config.configType} - Version ${config.modelVersion}`}
                  />
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={config.isActive ? 'Active' : 'Inactive'}
                      color={config.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <IconButton size="small" onClick={() => setSelectedConfig(config)}>
                      <EditIcon />
                    </IconButton>
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
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ECL Trends
                </Typography>
                <Typography color="textSecondary">
                  ECL calculation trends over time
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
                  Stage Distribution
                </Typography>
                <Typography color="textSecondary">
                  Portfolio staging distribution
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
        <DialogTitle>Run Impairment Calculation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Calculation Name"
                  value={calculationForm.calculationName}
                  onChange={(e) => handleCalculationInputChange('calculationName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Calculation Type</InputLabel>
                  <Select
                    value={calculationForm.calculationType}
                    label="Calculation Type"
                    onChange={(e) => handleCalculationInputChange('calculationType', e.target.value)}
                  >
                    <MenuItem value="ECL">Expected Credit Loss (ECL)</MenuItem>
                    <MenuItem value="PD">Probability of Default (PD)</MenuItem>
                    <MenuItem value="LGD">Loss Given Default (LGD)</MenuItem>
                    <MenuItem value="EAD">Exposure at Default (EAD)</MenuItem>
                    <MenuItem value="STAGING">IFRS9 Staging</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Portfolio ID"
                  value={calculationForm.portfolioId}
                  onChange={(e) => handleCalculationInputChange('portfolioId', e.target.value)}
                  margin="normal"
                  helperText="Enter the portfolio ID to calculate"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reporting Date"
                  type="date"
                  value={calculationForm.reportingDate}
                  onChange={(e) => handleCalculationInputChange('reportingDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={calculationForm.currency}
                    label="Currency"
                    onChange={(e) => handleCalculationInputChange('currency', e.target.value)}
                  >
                    {currencyOptions.length > 0 ? (
                      currencyOptions.map((currency) => (
                        <MenuItem key={currency.id} value={currency.id}>
                          {currency.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="IDR">IDR - Indonesian Rupiah (Loading...)</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assumptions & Notes"
                  value={calculationForm.assumptions}
                  onChange={(e) => handleCalculationInputChange('assumptions', e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                  helperText="Describe any assumptions or special conditions for this calculation"
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

      {/* Results Dialog */}
      <Dialog open={resultsDialogOpen} onClose={() => setResultsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Calculation Results</DialogTitle>
        <DialogContent>
          {selectedCalculation && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCalculation.calculationName}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Exposure Analysis
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Stage 1:</Typography>
                        <Typography fontWeight="bold">
                          {formatCurrency(selectedCalculation.stage1Exposure, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Stage 2:</Typography>
                        <Typography fontWeight="bold">
                          {formatCurrency(selectedCalculation.stage2Exposure, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Stage 3:</Typography>
                        <Typography fontWeight="bold" color="error">
                          {formatCurrency(selectedCalculation.stage3Exposure, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        ECL Breakdown
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Stage 1 ECL:</Typography>
                        <Typography fontWeight="bold">
                          {formatCurrency(selectedCalculation.stage1ECL, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Stage 2 ECL:</Typography>
                        <Typography fontWeight="bold">
                          {formatCurrency(selectedCalculation.stage2ECL, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Stage 3 ECL:</Typography>
                        <Typography fontWeight="bold" color="error">
                          {formatCurrency(selectedCalculation.stage3ECL, selectedCalculation.currency)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Model Information & Assumptions
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Model Version:</strong> {selectedCalculation.modelVersion}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>Currency:</strong> {selectedCalculation.currency}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Assumptions:</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCalculation.assumptions || 'No assumptions recorded'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultsDialogOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download Full Report
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