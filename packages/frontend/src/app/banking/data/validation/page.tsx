// packages/frontend/src/app/banking/data/validation/page.tsx
// ============================================================================
// IFRS9 FRONTEND - DATA VALIDATION DASHBOARD
// ============================================================================
// Purpose: Comprehensive data quality validation and error management dashboard
// Features: Quality metrics, rule monitoring, validation reports, error tracking
// Updated: 2025-01-11T14:45:00Z
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  FactCheck as ValidationIcon,
  Home as HomeIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  PlayArrow as RunIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Timeline as TrendIcon,
  Assessment as ReportIcon,
  Rule as RuleIcon,
  DataUsage as DataIcon,
  Speed as PerformanceIcon,
  BugReport as IssueIcon,
  Notifications as NotificationIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutline,
  Timeline,
  FactCheck,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

// Data quality rule types
type QualityRuleType = 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'accuracy' | 'timeliness';
type ValidationStatus = 'passed' | 'failed' | 'warning' | 'running' | 'pending';

interface QualityRule {
  id: string;
  name: string;
  description: string;
  type: QualityRuleType;
  table: string;
  column: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isActive: boolean;
  lastRun: Date;
  status: ValidationStatus;
  score: number;
  errorCount: number;
  totalRecords: number;
}

interface ValidationJob {
  id: string;
  name: string;
  type: 'batch' | 'realtime' | 'scheduled';
  status: ValidationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordsProcessed: number;
  rulesExecuted: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  overallScore: number;
  progress: number;
}

interface DataQualityMetrics {
  totalRules: number;
  activeRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  overallScore: number;
  trend: Array<{
    date: string;
    score: number;
    passed: number;
    failed: number;
    warnings: number;
  }>;
  ruleTypeDistribution: Array<{
    type: string;
    count: number;
    color: string;
  }>;
  severityDistribution: Array<{
    severity: string;
    count: number;
    color: string;
  }>;
}

const COLORS = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  critical: '#d32f2f',
  high: '#ff5722',
  medium: '#ff9800',
  low: '#ffc107',
};

const ruleTypeIcons = {
  completeness: DataIcon,
  uniqueness: RuleIcon,
  validity: FactCheck,
  consistency: Timeline,
  accuracy: CheckCircleOutline,
  timeliness: ScheduleIcon,
};

export default function DataValidationDashboard() {
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [rules, setRules] = useState<QualityRule[]>([]);
  const [jobs, setJobs] = useState<ValidationJob[]>([]);
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null);
  const [selectedRule, setSelectedRule] = useState<QualityRule | null>(null);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API endpoints
      const [rulesResponse, jobsResponse, metricsResponse] = await Promise.allSettled([
        fetch('/api/v1/etl/quality/rules'),
        fetch('/api/v1/etl/quality/jobs'),
        fetch('/api/v1/etl/quality/metrics'),
      ]);

      // Use mock data for demonstration
      const mockRules: QualityRule[] = [
        {
          id: '1',
          name: 'Customer ID Completeness',
          description: 'Ensure all customer records have valid customer IDs',
          type: 'completeness',
          table: 'customers',
          column: 'customer_id',
          condition: 'IS NOT NULL AND LENGTH(customer_id) > 0',
          threshold: 95,
          severity: 'critical',
          isActive: true,
          lastRun: new Date(),
          status: 'passed',
          score: 98.5,
          errorCount: 23,
          totalRecords: 1520,
        },
        {
          id: '2',
          name: 'Account Balance Validity',
          description: 'Account balances must be numeric and non-negative',
          type: 'validity',
          table: 'accounts',
          column: 'balance',
          condition: 'balance >= 0 AND balance IS NOT NULL',
          threshold: 99,
          severity: 'high',
          isActive: true,
          lastRun: new Date(),
          status: 'warning',
          score: 97.2,
          errorCount: 45,
          totalRecords: 3250,
        },
        {
          id: '3',
          name: 'Email Uniqueness',
          description: 'Customer email addresses must be unique',
          type: 'uniqueness',
          table: 'customers',
          column: 'email',
          condition: 'COUNT(email) = COUNT(DISTINCT email)',
          threshold: 100,
          severity: 'medium',
          isActive: true,
          lastRun: new Date(),
          status: 'failed',
          score: 94.1,
          errorCount: 12,
          totalRecords: 1520,
        },
        {
          id: '4',
          name: 'Transaction Date Consistency',
          description: 'Transaction dates should be within valid business ranges',
          type: 'consistency',
          table: 'transactions',
          column: 'transaction_date',
          condition: 'transaction_date BETWEEN created_date AND CURRENT_DATE',
          threshold: 98,
          severity: 'high',
          isActive: true,
          lastRun: new Date(),
          status: 'passed',
          score: 99.1,
          errorCount: 8,
          totalRecords: 8745,
        },
        {
          id: '5',
          name: 'Currency Code Validity',
          description: 'Currency codes must be valid ISO 4217 codes',
          type: 'validity',
          table: 'accounts',
          column: 'currency_code',
          condition: 'currency_code IN (\'USD\', \'EUR\', \'GBP\', \'IDR\')',
          threshold: 100,
          severity: 'critical',
          isActive: false,
          lastRun: new Date(Date.now() - 86400000), // Yesterday
          status: 'pending',
          score: 0,
          errorCount: 0,
          totalRecords: 3250,
        },
      ];

      const mockJobs: ValidationJob[] = [
        {
          id: '1',
          name: 'Daily Quality Check',
          type: 'scheduled',
          status: 'passed',
          startTime: new Date(Date.now() - 1800000), // 30 minutes ago
          endTime: new Date(Date.now() - 600000), // 10 minutes ago
          duration: 1200000, // 20 minutes
          recordsProcessed: 15385,
          rulesExecuted: 24,
          passedRules: 20,
          failedRules: 2,
          warningRules: 2,
          overallScore: 94.2,
          progress: 100,
        },
        {
          id: '2',
          name: 'Customer Data Validation',
          type: 'batch',
          status: 'running',
          startTime: new Date(Date.now() - 300000), // 5 minutes ago
          recordsProcessed: 1250,
          rulesExecuted: 8,
          passedRules: 6,
          failedRules: 1,
          warningRules: 1,
          overallScore: 85.5,
          progress: 65,
        },
        {
          id: '3',
          name: 'Real-time Transaction Check',
          type: 'realtime',
          status: 'passed',
          startTime: new Date(Date.now() - 60000), // 1 minute ago
          endTime: new Date(Date.now() - 30000),
          duration: 30000,
          recordsProcessed: 145,
          rulesExecuted: 6,
          passedRules: 6,
          failedRules: 0,
          warningRules: 0,
          overallScore: 100,
          progress: 100,
        },
      ];

      const mockMetrics: DataQualityMetrics = {
        totalRules: 25,
        activeRules: 20,
        passedRules: 16,
        failedRules: 2,
        warningRules: 2,
        overallScore: 94.2,
        trend: [
          { date: '2024-01-07', score: 92.1, passed: 18, failed: 3, warnings: 4 },
          { date: '2024-01-08', score: 93.5, passed: 19, failed: 2, warnings: 4 },
          { date: '2024-01-09', score: 94.8, passed: 20, failed: 2, warnings: 3 },
          { date: '2024-01-10', score: 93.2, passed: 18, failed: 3, warnings: 4 },
          { date: '2024-01-11', score: 94.2, passed: 20, failed: 2, warnings: 2 },
        ],
        ruleTypeDistribution: [
          { type: 'completeness', count: 8, color: COLORS.info },
          { type: 'validity', count: 6, color: COLORS.success },
          { type: 'uniqueness', count: 4, color: COLORS.warning },
          { type: 'consistency', count: 3, color: COLORS.error },
          { type: 'accuracy', count: 2, color: '#9c27b0' },
          { type: 'timeliness', count: 2, color: '#607d8b' },
        ],
        severityDistribution: [
          { severity: 'critical', count: 8, color: COLORS.critical },
          { severity: 'high', count: 6, color: COLORS.high },
          { severity: 'medium', count: 7, color: COLORS.medium },
          { severity: 'low', count: 4, color: COLORS.low },
        ],
      };

      setRules(mockRules);
      setJobs(mockJobs);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadValidationData();
    setRefreshing(false);
  };

  const runValidation = async (ruleId?: string) => {
    try {
      const endpoint = ruleId ? `/api/v1/etl/quality/rules/${ruleId}/run` : '/api/v1/etl/quality/run';
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshData();
    } catch (error) {
      console.error('Error running validation:', error);
    }
  };

  const getStatusColor = (status: ValidationStatus) => {
    switch (status) {
      case 'passed': return COLORS.success;
      case 'failed': return COLORS.error;
      case 'warning': return COLORS.warning;
      case 'running': return COLORS.info;
      case 'pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getSeverityColor = (severity: string) => {
    return COLORS[severity as keyof typeof COLORS] || '#9e9e9e';
  };

  const filteredRules = rules.filter(rule => {
    if (statusFilter !== 'all' && rule.status !== statusFilter) return false;
    if (typeFilter !== 'all' && rule.type !== typeFilter) return false;
    if (severityFilter !== 'all' && rule.severity !== severityFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ValidationIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Data Validation
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ValidationIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Data Validation Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Monitor data quality rules, validation jobs, and quality metrics
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              color="primary"
            >
              <FilterIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={refreshData}
              disabled={refreshing}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<RunIcon />}
              onClick={() => runValidation()}
              size="small"
            >
              Run All
            </Button>
          </Box>
        </Box>

        {/* Quality Score Overview */}
        {metrics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PerformanceIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Overall Score</Typography>
                  </Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    {metrics.overallScore.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.overallScore}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2.25 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SuccessIcon sx={{ color: COLORS.success, mr: 1 }} />
                    <Typography variant="subtitle2">Passed</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: COLORS.success, fontWeight: 'bold' }}>
                    {metrics.passedRules}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {metrics.activeRules} active rules
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2.25 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon sx={{ color: COLORS.warning, mr: 1 }} />
                    <Typography variant="subtitle2">Warnings</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: COLORS.warning, fontWeight: 'bold' }}>
                    {metrics.warningRules}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    require attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2.25 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ErrorIcon sx={{ color: COLORS.error, mr: 1 }} />
                    <Typography variant="subtitle2">Failed</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: COLORS.error, fontWeight: 'bold' }}>
                    {metrics.failedRules}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    need immediate fix
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 2.25 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RuleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Total Rules</Typography>
                  </Box>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {metrics.totalRules}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metrics.activeRules} active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Main Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<RuleIcon />} label="Quality Rules" />
          <Tab icon={<ScheduleIcon />} label="Validation Jobs" />
          <Tab icon={<TrendIcon />} label="Analytics" />
          <Tab icon={<ReportIcon />} label="Reports" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Quality Rules
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rule</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Errors</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Last Run</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRules.map((rule) => {
                      const RuleTypeIcon = ruleTypeIcons[rule.type];
                      return (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <RuleTypeIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="subtitle2">{rule.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {rule.table}.{rule.column}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={rule.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={rule.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(rule.status) + '20',
                                color: getStatusColor(rule.status),
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {rule.score.toFixed(1)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={rule.score}
                                sx={{ width: 60, height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color={rule.errorCount > 0 ? 'error' : 'text.secondary'}>
                              {rule.errorCount} / {rule.totalRecords}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={rule.severity}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(rule.severity) + '20',
                                color: getSeverityColor(rule.severity),
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {rule.lastRun.toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => runValidation(rule.id)}
                              color="primary"
                            >
                              <RunIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRule(rule);
                                setRuleDialogOpen(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Validation Jobs
              </Typography>

              <List>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ backgroundColor: getStatusColor(job.status) + '20' }}>
                          {job.type === 'scheduled' ? <ScheduleIcon sx={{ color: getStatusColor(job.status) }} /> :
                            job.type === 'batch' ? <DataIcon sx={{ color: getStatusColor(job.status) }} /> :
                              <NotificationIcon sx={{ color: getStatusColor(job.status) }} />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{job.name}</Typography>
                            <Chip
                              label={job.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(job.status) + '20',
                                color: getStatusColor(job.status),
                              }}
                            />
                            <Chip label={job.type} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              <Grid size={3}>
                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={job.progress}
                                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption">{job.progress}%</Typography>
                              </Grid>
                              <Grid size={3}>
                                <Typography variant="caption" color="text.secondary">Records</Typography>
                                <Typography variant="body2">{job.recordsProcessed.toLocaleString()}</Typography>
                              </Grid>
                              <Grid size={3}>
                                <Typography variant="caption" color="text.secondary">Rules</Typography>
                                <Typography variant="body2">
                                  {job.passedRules}/{job.rulesExecuted}
                                </Typography>
                              </Grid>
                              <Grid size={3}>
                                <Typography variant="caption" color="text.secondary">Score</Typography>
                                <Typography variant="body2" sx={{ color: getStatusColor(job.status) }}>
                                  {job.overallScore.toFixed(1)}%
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 2 && metrics && (
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quality Score Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={metrics.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={COLORS.info}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rule Types
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={metrics.ruleTypeDistribution}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                      >
                        {metrics.ruleTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Severity Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={metrics.severityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="severity" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill={COLORS.info} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quality Reports
                  </Typography>
                  <List>
                    <ListItemButton>
                      <ListItemIcon><ReportIcon color="primary" /></ListItemIcon>
                      <ListItemText
                        primary="Daily Quality Summary"
                        secondary="Comprehensive daily data quality report"
                      />
                      <DownloadIcon />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton>
                      <ListItemIcon><IssueIcon color="error" /></ListItemIcon>
                      <ListItemText
                        primary="Failed Rules Report"
                        secondary="Detailed analysis of failed validation rules"
                      />
                      <DownloadIcon />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton>
                      <ListItemIcon><TrendIcon color="success" /></ListItemIcon>
                      <ListItemText
                        primary="Quality Trend Analysis"
                        secondary="Historical data quality trends and patterns"
                      />
                      <DownloadIcon />
                    </ListItemButton>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Scheduled Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure automated report generation and distribution.
                  </Typography>
                  <Button variant="contained" startIcon={<SettingsIcon />} fullWidth>
                    Configure Reports
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="passed">Passed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              label="Type"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completeness">Completeness</MenuItem>
              <MenuItem value="uniqueness">Uniqueness</MenuItem>
              <MenuItem value="validity">Validity</MenuItem>
              <MenuItem value="consistency">Consistency</MenuItem>
              <MenuItem value="accuracy">Accuracy</MenuItem>
              <MenuItem value="timeliness">Timeliness</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              label="Severity"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Rule Detail Dialog */}
      <Dialog
        open={ruleDialogOpen}
        onClose={() => setRuleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRule && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {(React.createElement(ruleTypeIcons[selectedRule.type] as any, { sx: { mr: 1, color: 'primary.main' } }) as any)}
                {selectedRule.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="subtitle2" gutterBottom>Description</Typography>
                  <Typography variant="body2" paragraph>{selectedRule.description}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" gutterBottom>Configuration</Typography>
                  <Typography variant="body2">
                    <strong>Table:</strong> {selectedRule.table}<br />
                    <strong>Column:</strong> {selectedRule.column}<br />
                    <strong>Condition:</strong> {selectedRule.condition}<br />
                    <strong>Threshold:</strong> {selectedRule.threshold}%
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" gutterBottom>Recent Results</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                      label={`Score: ${selectedRule.score.toFixed(1)}%`}
                      color="primary"
                    />
                    <Chip
                      label={`Errors: ${selectedRule.errorCount}`}
                      color={selectedRule.errorCount > 0 ? 'error' : 'success'}
                    />
                    <Chip
                      label={`Records: ${selectedRule.totalRecords}`}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRuleDialogOpen(false)}>Close</Button>
              <Button onClick={() => runValidation(selectedRule.id)} variant="contained">
                Run Rule
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
