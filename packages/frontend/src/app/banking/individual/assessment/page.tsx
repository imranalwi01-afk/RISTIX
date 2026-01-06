// packages/frontend/src/app/banking/individual/assessment/page.tsx
// ============================================================================
// IFRS9 FRONTEND - INDIVIDUAL IMPAIRMENT ASSESSMENT PAGE
// ============================================================================
// Purpose: Individual account impairment assessment and DCF analysis
// API Integration: Real-time backend connectivity with FRS9PRO database
// Features: Watchlist management, DCF calculations, provision analysis
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MoneyIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Calculate as CalculateIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
  PlayArrow as RunIcon,
  Clear as ClearIcon,

  ShowChart as ShowChartIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import AddChartIcon from '@mui/icons-material/AddChart';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI, individualImpairmentHelpers, type IndividualImpairmentWatchlistItem, type IndividualImpairmentAssessment } from '@/services/api.individual-impairment';

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`individual-impairment-tabpanel-${index}`}
      aria-labelledby={`individual-impairment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// DCF Analysis Tab Component
interface DCFAnalysisTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  onCalculate: (parameters: any) => void;
  loading: boolean;
}

function DCFAnalysisTab({ account, assessment, onCalculate, loading }: DCFAnalysisTabProps) {
  const [parameters, setParameters] = useState({
    discountRate: 8.5,
    projectedGrowthRate: 2.0,
    recoveryRate: 60.0,
    timeHorizon: 60,
    paymentFrequency: 'monthly',
    scenarioType: 'base'
  });

  const [scenarioData, setScenarioData] = useState([
    { name: 'Base Case', discountRate: 8.5, recoveryRate: 60.0, growthRate: 2.0 },
    { name: 'Optimistic', discountRate: 6.5, recoveryRate: 75.0, growthRate: 3.5 },
    { name: 'Pessimistic', discountRate: 12.0, recoveryRate: 40.0, growthRate: 0.5 }
  ]);

  const [activeScenario, setActiveScenario] = useState('base');
  const [calculationResults, setCalculationResults] = useState<any>(null);

  const handleParameterChange = (field: string, value: any) => {
    setParameters(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    onCalculate({
      ...parameters,
      scenarioType: activeScenario,
      accountId: account?.account_id
    });
  };

  const handleScenarioChange = (scenarioName: string) => {
    const scenario = scenarioData.find(s => s.name === scenarioName);
    if (scenario) {
      setParameters(prev => ({
        ...prev,
        discountRate: scenario.discountRate,
        recoveryRate: scenario.recoveryRate,
        projectedGrowthRate: scenario.growthRate
      }));
      setActiveScenario(scenarioName.toLowerCase().replace(' ', ''));
    }
  };

  // Local helper function for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Local helper function for rendering stage chip
  const renderStageChipLocal = (stage: number) => {
    const colors = {
      1: '#4caf50',
      2: '#ff9800',
      3: '#f44336'
    };
    const labels = {
      1: 'Stage 1',
      2: 'Stage 2',
      3: 'Stage 3'
    };

    return (
      <Chip
        label={labels[stage as keyof typeof labels]}
        size="small"
        sx={{
          backgroundColor: colors[stage as keyof typeof colors],
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Local helper function for rendering impaired flag
  const renderImpairedFlagLocal = (flag: string) => {
    return (
      <Chip
        label={flag === 'I' ? 'Impaired' : 'Non-Impaired'}
        size="small"
        color={flag === 'I' ? 'error' : 'success'}
        variant="outlined"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <CalculateIcon sx={{ mr: 1 }} />
        DCF Analysis - {account?.account_number} - {account?.cif_name}
      </Typography>

      <Grid container spacing={3}>
        {/* Input Parameters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                DCF Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Discount Rate (%)"
                  type="number"
                  value={parameters.discountRate}
                  onChange={(e) => handleParameterChange('discountRate', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  size="small"
                  helperText="Annual discount rate for present value calculation"
                />

                <TextField
                  label="Recovery Rate (%)"
                  type="number"
                  value={parameters.recoveryRate}
                  onChange={(e) => handleParameterChange('recoveryRate', parseFloat(e.target.value))}
                  inputProps={{ step: 1, min: 0, max: 100 }}
                  size="small"
                  helperText="Expected recovery rate of outstanding balance"
                />

                <TextField
                  label="Growth Rate (%)"
                  type="number"
                  value={parameters.projectedGrowthRate}
                  onChange={(e) => handleParameterChange('projectedGrowthRate', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: -10, max: 20 }}
                  size="small"
                  helperText="Projected cash flow growth rate"
                />

                <TextField
                  label="Time Horizon (months)"
                  type="number"
                  value={parameters.timeHorizon}
                  onChange={(e) => handleParameterChange('timeHorizon', parseInt(e.target.value))}
                  inputProps={{ step: 1, min: 1, max: 360 }}
                  size="small"
                  helperText="Analysis period in months"
                />

                <FormControl size="small" fullWidth>
                  <InputLabel>Payment Frequency</InputLabel>
                  <Select
                    value={parameters.paymentFrequency}
                    label="Payment Frequency"
                    onChange={(e) => handleParameterChange('paymentFrequency', e.target.value)}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="annually">Annually</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={handleCalculate}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? <CircularProgress size={20} /> : 'Calculate DCF'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => setCalculationResults(null)}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Scenarios */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AddChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Scenario Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {scenarioData.map((scenario) => (
                  <Button
                    key={scenario.name}
                    variant={activeScenario.includes(scenario.name.toLowerCase()) ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleScenarioChange(scenario.name)}
                  >
                    {scenario.name}
                  </Button>
                ))}
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scenario</TableCell>
                      <TableCell>Discount Rate</TableCell>
                      <TableCell>Recovery Rate</TableCell>
                      <TableCell>Growth Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scenarioData.map((scenario) => (
                      <TableRow key={scenario.name}>
                        <TableCell>{scenario.name}</TableCell>
                        <TableCell>{scenario.discountRate}%</TableCell>
                        <TableCell>{scenario.recoveryRate}%</TableCell>
                        <TableCell>{scenario.growthRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Account Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Outstanding Balance:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(account?.outstanding_balance || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Current Stage:</Typography>
                  <Box sx={{ mt: 1 }}>
                    {account && renderStageChipLocal(account.stage)}
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Impaired Status:</Typography>
                  <Box sx={{ mt: 1 }}>
                    {account && renderImpairedFlagLocal(account.impaired_flag)}
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">Current Provision:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(account?.provision_amount || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// Provision Calculation Tab Component
interface ProvisionCalculationTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  calculation: any;
  loading: boolean;
}

function ProvisionCalculationTab({ account, assessment, calculation, loading }: ProvisionCalculationTabProps) {
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

export default function IndividualAssessmentPage() {
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<IndividualImpairmentWatchlistItem[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [assessment, setAssessment] = useState<IndividualImpairmentAssessment | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 25,
    total: 0
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    impairedFlag: '',
    assessmentStatus: '',
    priorityLevel: '',
    ratingCode: ''
  });

  // Fetch watchlist data
  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page + 1,
        limit: pagination.limit
      };

      // Add filters to params if they have values
      if (filters.search) params.search = filters.search;
      if (filters.stage) params.filter = { ...params.filter, stage: parseInt(filters.stage) };
      if (filters.impairedFlag) params.filter = { ...params.filter, impaired_flag: filters.impairedFlag };
      if (filters.assessmentStatus) params.filter = { ...params.filter, assessment_status: filters.assessmentStatus };
      if (filters.priorityLevel) params.filter = { ...params.filter, priority_level: filters.priorityLevel };
      if (filters.ratingCode) params.filter = { ...params.filter, rating_code: filters.ratingCode };

      const response = await individualImpairmentAPI.watchlist.getAll(params);

      if (response.success) {
        setWatchlist(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch assessment data for selected account
  const fetchAssessment = useCallback(async (accountId: number) => {
    try {
      const response = await individualImpairmentAPI.assessment.get(accountId);
      if (response.success) {
        setAssessment(response.data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  }, []);

  // Initialize page data
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle account selection
  const handleAccountSelect = (account: IndividualImpairmentWatchlistItem) => {
    setSelectedAccount(account);
    fetchAssessment(account.account_id);
    setTabValue(1); // Switch to Assessment tab
  };

  // Handle assessment dialog
  const handleAssessmentDialog = (open: boolean) => {
    setAssessmentDialogOpen(open);
    if (!open) {
      setAssessment(null);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchWatchlist();
  };

  // Export data
  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      await individualImpairmentAPI.watchlist.export(format, filters);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Handle DCF calculation
  const handleCalculateDCF = async (parameters: any) => {
    if (!selectedAccount?.account_id) return;

    setLoading(true);
    try {
      const response = await individualImpairmentAPI.dcf.calculate(selectedAccount.account_id, parameters);
      if (response.success) {
        setSelectedCalculation(response.data);
      }
    } catch (error) {
      console.error('Error calculating DCF:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle save assessment
  const handleSaveAssessment = async (assessmentData: any) => {
    if (!selectedAccount?.account_id) return;

    setLoading(true);
    try {
      const response = await individualImpairmentAPI.assessment.create(selectedAccount.account_id, assessmentData);
      if (response.success) {
        setAssessment(response.data);
        fetchWatchlist(); // Refresh watchlist to update status
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render stage chip
  const renderStageChip = (stage: number) => {
    const colors = {
      1: '#4caf50',
      2: '#ff9800',
      3: '#f44336'
    };
    const labels = {
      1: 'Stage 1',
      2: 'Stage 2',
      3: 'Stage 3'
    };

    return (
      <Chip
        label={labels[stage as keyof typeof labels]}
        size="small"
        sx={{
          backgroundColor: colors[stage as keyof typeof colors],
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Render priority chip
  const renderPriorityChip = (priority: string) => {
    const colors = {
      'LOW': '#4caf50',
      'MEDIUM': '#ff9800',
      'HIGH': '#ff5722',
      'CRITICAL': '#f44336'
    };

    return (
      <Chip
        label={priority}
        size="small"
        sx={{
          backgroundColor: colors[priority as keyof typeof colors],
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  // Render impaired flag
  const renderImpairedFlag = (flag: string) => {
    return (
      <Chip
        label={flag === 'I' ? 'Impaired' : 'Non-Impaired'}
        size="small"
        color={flag === 'I' ? 'error' : 'success'}
        variant="outlined"
      />
    );
  };

  // Render assessment status
  const renderAssessmentStatus = (status: string) => {
    const colors = {
      'PENDING': '#757575',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'REVIEWED': '#ff9800'
    };

    return (
      <Chip
        label={status.replace('_', ' ')}
        size="small"
        sx={{
          backgroundColor: colors[status as keyof typeof colors],
          color: 'white',
          fontWeight: 'bold'
        }}
      />
    );
  };

  if (loading && watchlist.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Individual Assessment
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Individual Impairment Assessment
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton onClick={() => handleExport('xlsx')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Individual account impairment assessment, DCF analysis, and provision calculation
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search accounts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 250 }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Stage</InputLabel>
                <Select
                  value={filters.stage}
                  label="Stage"
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                >
                  <MenuItem value="">All Stages</MenuItem>
                  <MenuItem value="1">Stage 1</MenuItem>
                  <MenuItem value="2">Stage 2</MenuItem>
                  <MenuItem value="3">Stage 3</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Impaired Status</InputLabel>
                <Select
                  value={filters.impairedFlag}
                  label="Impaired Status"
                  onChange={(e) => handleFilterChange('impairedFlag', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="I">Impaired</MenuItem>
                  <MenuItem value="N">Non-Impaired</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priorityLevel}
                  label="Priority"
                  onChange={(e) => handleFilterChange('priorityLevel', e.target.value)}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Card sx={{ minWidth: 200, flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" color="primary.main">
                    {watchlist.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Accounts
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200, flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" color="error.main">
                    {watchlist.filter(a => a.impaired_flag === 'I').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impaired Accounts
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200, flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" color="warning.main">
                    {watchlist.filter(a => a.assessment_status === 'PENDING').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Assessments
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200, flex: 1 }}>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" color="success.main">
                    {individualImpairmentHelpers.formatCurrency(
                      watchlist.reduce((sum, a) => sum + (a.provision_amount || 0), 0)
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Provisions
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Watchlist" icon={<AssignmentIcon />} />
                <Tab label="Assessment Details" icon={<AssessmentIcon />} disabled={!selectedAccount} />
                <Tab label="DCF Analysis" icon={<CalculateIcon />} disabled={!selectedAccount} />
                <Tab label="Provision Calculation" icon={<MoneyIcon />} disabled={!selectedAccount} />
              </Tabs>
            </Box>

            <Box>
              {/* Tab Panels */}
              <TabPanel value={tabValue} index={0}>
                {/* Watchlist Table */}
                <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Account Info</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Impaired</TableCell>
                        <TableCell>Provision</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {watchlist.map((account) => (
                        <TableRow key={account.pkid} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {account.account_number}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {account.account_id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{account.cif_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {account.cif_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {individualImpairmentHelpers.formatCurrency(account.outstanding_balance)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {renderStageChip(account.stage)}
                          </TableCell>
                          <TableCell>
                            {renderAssessmentStatus(account.assessment_status)}
                          </TableCell>
                          <TableCell>
                            {renderPriorityChip(account.priority_level)}
                          </TableCell>
                          <TableCell>
                            {renderImpairedFlag(account.impaired_flag)}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {individualImpairmentHelpers.formatCurrency(account.provision_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAccountSelect(account)}
                                  color="primary"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Assessment">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAssessmentDialog(true)}
                                  disabled={!account.account_id}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={pagination.total}
                  rowsPerPage={pagination.limit}
                  page={pagination.page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {selectedAccount ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Assessment details for Account {selectedAccount.account_number} - {selectedAccount.cif_name}
                    </Alert>

                    {assessment ? (
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Assessment Information
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Impaired Flag:</Typography>
                                  <Chip
                                    label={assessment.impaired_flag === 'I' ? 'Impaired' : 'Non-Impaired'}
                                    color={assessment.impaired_flag === 'I' ? 'error' : 'success'}
                                    size="small"
                                  />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Stage:</Typography>
                                  {renderStageChip(assessment.stage)}
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Method:</Typography>
                                  <Typography variant="body2">{assessment.method}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Rating:</Typography>
                                  <Typography variant="body2">{assessment.rating_code}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Approval Status:</Typography>
                                  <Chip
                                    label={assessment.approval_status}
                                    color={assessment.approval_status === 'APPROVED' ? 'success' : 'default'}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Financial Details
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Outstanding Balance:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {individualImpairmentHelpers.formatCurrency(assessment.outstanding_balance)}
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Interest Rate:</Typography>
                                  <Typography variant="body2">{assessment.interest_rate}%</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Days Past Due:</Typography>
                                  <Typography variant="body2">{assessment.dpd}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Collectability:</Typography>
                                  <Typography variant="body2">{assessment.collectability}%</Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Assessment Comments
                              </Typography>
                              <Divider sx={{ mb: 2 }} />

                              <Typography variant="body2" paragraph>
                                {assessment.analyst_comments || 'No analyst comments available.'}
                              </Typography>

                              {assessment.reviewer_comments && (
                                <>
                                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                                    Reviewer Comments:
                                  </Typography>
                                  <Typography variant="body2">
                                    {assessment.reviewer_comments}
                                  </Typography>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">
                        No assessment data available for this account.
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info">
                    Please select an account from the watchlist to view assessment details.
                  </Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <DCFAnalysisTab
                  account={selectedAccount}
                  assessment={assessment}
                  onCalculate={handleCalculateDCF}
                  loading={loading}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <ProvisionCalculationTab
                  account={selectedAccount}
                  assessment={assessment}
                  calculation={selectedCalculation}
                  loading={loading}
                />
              </TabPanel>
            </Box>

            {/* Assessment Dialog */}
            <Dialog
              open={assessmentDialogOpen}
              onClose={() => handleAssessmentDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Edit Assessment</DialogTitle>
              <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Assessment editing functionality will be available in the next phase.
                </Alert>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleAssessmentDialog(false)}>Cancel</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
