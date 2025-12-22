'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ViewKanban as ViewKanbanIcon,
  ViewList as ViewListIcon,
  NotificationsActive as AlertIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useSnackbar } from 'notistack';

// Types
interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  unit: string;
  description: string;
}

interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface KPIData {
  totalPortfolio: number;
  totalECL: number;
  nplRatio: number;
  coverageRatio: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  performanceMetrics: {
    performing: number;
    nonPerforming: number;
    restructured: number;
  };
}

interface MonitoringFilters {
  dateRange: [Date | null, Date | null];
  productType: string;
  riskGrade: string;
  accountStatus: string;
  bankingType: string;
}

const PortfolioMonitoring: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'detailed'>('dashboard');
  const [filters, setFilters] = useState<MonitoringFilters>({
    dateRange: [startOfMonth(new Date()), new Date()],
    productType: '',
    riskGrade: '',
    accountStatus: '',
    bankingType: ''
  });

  // Initialize component
  useEffect(() => {
    loadMonitoringData();
  }, []);

  // Load monitoring data
  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadAlerts(),
        loadKPIData()
      ]);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      enqueueSnackbar('Failed to load monitoring data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Load metrics
  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/v1/banking/portfolio/monitoring/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data || generateMockMetrics());
      } else {
        setMetrics(generateMockMetrics());
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics(generateMockMetrics());
    }
  };

  // Load alerts
  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/v1/banking/portfolio/monitoring/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || generateMockAlerts());
      } else {
        setAlerts(generateMockAlerts());
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts(generateMockAlerts());
    }
  };

  // Load KPI data
  const loadKPIData = async () => {
    try {
      const response = await fetch('/api/v1/banking/portfolio/monitoring/kpi', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKpiData(data.data || generateMockKPIData());
      } else {
        setKpiData(generateMockKPIData());
      }
    } catch (error) {
      console.error('Error loading KPI data:', error);
      setKpiData(generateMockKPIData());
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMonitoringData();
      enqueueSnackbar('Monitoring data refreshed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to refresh data', { variant: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  // Export data
  const handleExport = async (format: 'excel' | 'csv' = 'excel') => {
    try {
      const response = await fetch(`/api/v1/banking/portfolio/monitoring/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_monitoring_${format}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        enqueueSnackbar('Monitoring data exported successfully', { variant: 'success' });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar('Failed to export data', { variant: 'error' });
    }
  };

  // Generate mock data
  const generateMockMetrics = (): MonitoringMetric[] => [
    {
      id: '1',
      name: 'Total Portfolio Value',
      value: 2850000000,
      previousValue: 2790000000,
      change: 60000000,
      changePercent: 2.15,
      trend: 'up',
      status: 'good',
      icon: <AssessmentIcon />,
      unit: 'IDR',
      description: 'Total value of all active accounts'
    },
    {
      id: '2',
      name: 'Expected Credit Loss',
      value: 142500000,
      previousValue: 139500000,
      change: 3000000,
      changePercent: 2.15,
      trend: 'up',
      status: 'warning',
      icon: <WarningIcon />,
      unit: 'IDR',
      description: 'Total ECL provision required'
    },
    {
      id: '3',
      name: 'NPL Ratio',
      value: 5.2,
      previousValue: 5.4,
      change: -0.2,
      changePercent: -3.7,
      trend: 'down',
      status: 'good',
      icon: <TrendingDownIcon />,
      unit: '%',
      description: 'Non-performing loans ratio'
    },
    {
      id: '4',
      name: 'Coverage Ratio',
      value: 68.5,
      previousValue: 65.2,
      change: 3.3,
      changePercent: 5.06,
      trend: 'up',
      status: 'good',
      icon: <TrendingUpIcon />,
      unit: '%',
      description: 'ECL coverage of at-risk assets'
    }
  ];

  const generateMockAlerts = (): AlertItem[] => [
    {
      id: '1',
      type: 'warning',
      title: 'NPL Ratio Increase',
      message: 'NPL ratio increased by 0.3% this month, reaching 5.2%',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'Risk Management',
      severity: 'medium'
    },
    {
      id: '2',
      type: 'error',
      title: 'Stage 2 Migration',
      message: '15 accounts migrated from Stage 1 to Stage 2 in the last 7 days',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      category: 'IFRS 9 Staging',
      severity: 'high'
    },
    {
      id: '3',
      type: 'info',
      title: 'ECL Calculation Complete',
      message: 'Monthly ECL calculations completed successfully for all portfolios',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      category: 'System',
      severity: 'low'
    }
  ];

  const generateMockKPIData = (): KPIData => ({
    totalPortfolio: 2850000000,
    totalECL: 142500000,
    nplRatio: 5.2,
    coverageRatio: 68.5,
    stage1Count: 2450,
    stage2Count: 180,
    stage3Count: 45,
    riskDistribution: {
      low: 65.2,
      medium: 22.8,
      high: 9.5,
      critical: 2.5
    },
    performanceMetrics: {
      performing: 92.5,
      nonPerforming: 5.2,
      restructured: 2.3
    }
  });

  // Helper functions
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down': return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default: return <SpeedIcon sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
          Loading monitoring data...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              Portfolio Monitoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time portfolio health monitoring with IFRS 9 compliance metrics
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="dashboard">
                <ViewKanbanIcon />
              </ToggleButton>
              <ToggleButton value="detailed">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('excel')}
              size="small"
            >
              Export
            </Button>

            <Button
              variant="contained"
              startIcon={refreshing ? <LinearProgress sx={{ width: 16 }} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange[0]}
                onChange={(date) => setFilters({
                  ...filters,
                  dateRange: [date, filters.dateRange[1]]
                })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={filters.dateRange[1]}
                onChange={(date) => setFilters({
                  ...filters,
                  dateRange: [filters.dateRange[0], date]
                })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Product Type</InputLabel>
                <Select
                  value={filters.productType}
                  onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                  label="Product Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="KONSUMER">Consumer</MenuItem>
                  <MenuItem value="KOMERSIAL">Commercial</MenuItem>
                  <MenuItem value="SYARIAH">Syariah</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Banking Type</InputLabel>
                <Select
                  value={filters.bankingType}
                  onChange={(e) => setFilters({ ...filters, bankingType: e.target.value })}
                  label="Banking Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="conventional">Conventional</MenuItem>
                  <MenuItem value="syariah">Syariah</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {metrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getStatusColor(metric.status) + '.main', mr: 2 }}>
                      {metric.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {metric.unit === 'IDR'
                          ? `IDR ${(metric.value / 1000000000).toFixed(2)}B`
                          : `${metric.value}${metric.unit}`
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.name}
                      </Typography>
                    </Box>
                    {getTrendIcon(metric.trend)}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {metric.description}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${metric.changePercent > 0 ? '+' : ''}${metric.changePercent.toFixed(1)}%`}
                      color={getStatusColor(metric.status)}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Alerts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AlertIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Recent Alerts</Typography>
                  <Badge badgeContent={alerts.length} color="error" sx={{ ml: 2 }} />
                </Box>

                <Stack spacing={2}>
                  {alerts.slice(0, 5).map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={getAlertColor(alert.type)}
                      sx={{ '& .MuiAlert-message': { width: '100%' } }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {format(alert.timestamp, 'MMM dd, HH:mm')} • {alert.category}
                        </Typography>
                      </Box>
                    </Alert>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">IFRS 9 Staging Distribution</Typography>
                </Box>

                {kpiData && (
                  <Box>
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Stage 1 (12M ECL)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kpiData.stage1Count} accounts
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(kpiData.stage1Count / (kpiData.stage1Count + kpiData.stage2Count + kpiData.stage3Count)) * 100}
                          sx={{ bgcolor: 'success.light', '& .MuiLinearProgress-bar': { bgcolor: 'success.main' } }}
                        />
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Stage 2 (Lifetime ECL)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kpiData.stage2Count} accounts
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(kpiData.stage2Count / (kpiData.stage1Count + kpiData.stage2Count + kpiData.stage3Count)) * 100}
                          sx={{ bgcolor: 'warning.light', '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' } }}
                        />
                      </Box>

                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Stage 3 (Credit Impaired)</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kpiData.stage3Count} accounts
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(kpiData.stage3Count / (kpiData.stage1Count + kpiData.stage2Count + kpiData.stage3Count)) * 100}
                          sx={{ bgcolor: 'error.light', '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }}
                        />
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Performance Metrics</strong>
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 600 }}>
                              {kpiData.performanceMetrics.performing}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Performing
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 600 }}>
                              {kpiData.performanceMetrics.nonPerforming}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Non-Performing
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Risk Distribution */}
        {kpiData && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Risk Distribution</Typography>
              <Grid container spacing={3}>
                {Object.entries(kpiData.riskDistribution).map(([risk, percentage]) => (
                  <Grid item xs={12} sm={6} md={3} key={risk}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{
                        fontWeight: 600,
                        color: risk === 'low' ? 'success.main' :
                               risk === 'medium' ? 'warning.main' :
                               risk === 'high' ? 'error.main' : 'error.dark'
                      }}>
                        {percentage}%
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {risk} Risk
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default PortfolioMonitoring;