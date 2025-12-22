// packages/frontend/src/app/banking/maintenance/job-monitoring/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Avatar,
  Paper,
  Stack,
  Badge,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid, GridColDef, GridRowParams, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  RestartAlt as RestartAltIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Computer as ComputerIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, subDays, addMinutes, differenceInMinutes } from 'date-fns';

// Types and Interfaces
interface JobExecution {
  id: string;
  jobId: string;
  jobName: string;
  jobType: 'IFRS9_CALCULATION' | 'ETL_PROCESS' | 'DATA_VALIDATION' | 'REPORT_GENERATION' | 'BACKUP' | 'MAINTENANCE';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING' | 'PAUSED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  userId: string;
  userName: string;
  tenantId?: string;
  tenantName?: string;
  parameters?: any;
  resultData?: any;
  errorMessage?: string;
  errorDetails?: string;
  resourceUsage?: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  performanceMetrics?: {
    recordsProcessed: number;
    throughput: number;
    averageResponseTime: number;
  };
  nextRunTime?: string;
  isScheduled: boolean;
  scheduleExpression?: string;
  retryCount: number;
  maxRetries: number;
  tags: string[];
}

interface JobDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  isEnabled: boolean;
  scheduleExpression: string;
  parameters: any;
  maxRetries: number;
  timeout: number;
  priority: string;
  createdBy: string;
  lastModified: string;
  nextRunTime?: string;
  lastRunStatus?: string;
  lastRunTime?: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeJobs: number;
  queuedJobs: number;
  completedJobsToday: number;
  failedJobsToday: number;
  averageExecutionTime: number;
  throughputPerHour: number;
}

interface JobFilters {
  status?: string;
  type?: string;
  priority?: string;
  userId?: string;
  tenantId?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  searchTerm?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`job-monitoring-tabpanel-${index}`}
    aria-labelledby={`job-monitoring-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const JobMonitoringPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [jobExecutions, setJobExecutions] = useState<JobExecution[]>([]);
  const [jobDefinitions, setJobDefinitions] = useState<JobDefinition[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    dateFrom: subDays(new Date(), 1),
    dateTo: new Date(),
  });
  
  // Dialog states
  const [jobDetailsDialog, setJobDetailsDialog] = useState<{
    open: boolean;
    job: JobExecution | null;
  }>({
    open: false,
    job: null,
  });

  const [jobControlDialog, setJobControlDialog] = useState<{
    open: boolean;
    job: JobExecution | null;
    action: 'start' | 'pause' | 'stop' | 'restart' | null;
  }>({
    open: false,
    job: null,
    action: null,
  });

  // Mock data
  const mockJobExecutions: JobExecution[] = [
    {
      id: 'exec-001',
      jobId: 'job-001',
      jobName: 'IFRS9 ECL Calculation - Monthly',
      jobType: 'IFRS9_CALCULATION',
      status: 'RUNNING',
      priority: 'HIGH',
      startTime: new Date().toISOString(),
      progress: 65,
      userId: 'user-001',
      userName: 'Sarah Chen',
      tenantId: 'tenant-001',
      tenantName: 'Metro Bank',
      resourceUsage: {
        cpuUsage: 78,
        memoryUsage: 1024,
        diskUsage: 45
      },
      performanceMetrics: {
        recordsProcessed: 156000,
        throughput: 2400,
        averageResponseTime: 250
      },
      isScheduled: true,
      scheduleExpression: '0 0 1 * *',
      retryCount: 0,
      maxRetries: 3,
      tags: ['monthly', 'ecl', 'critical']
    },
    {
      id: 'exec-002',
      jobId: 'job-002',
      jobName: 'Portfolio Data ETL Process',
      jobType: 'ETL_PROCESS',
      status: 'COMPLETED',
      priority: 'NORMAL',
      startTime: new Date(Date.now() - 1800000).toISOString(),
      endTime: new Date(Date.now() - 300000).toISOString(),
      duration: 1500000,
      progress: 100,
      userId: 'user-002',
      userName: 'Ahmad Hassan',
      tenantId: 'tenant-002',
      tenantName: 'Syariah Bank',
      resourceUsage: {
        cpuUsage: 35,
        memoryUsage: 512,
        diskUsage: 28
      },
      performanceMetrics: {
        recordsProcessed: 89000,
        throughput: 3600,
        averageResponseTime: 150
      },
      isScheduled: true,
      scheduleExpression: '0 */4 * * *',
      retryCount: 0,
      maxRetries: 2,
      tags: ['etl', 'portfolio', 'automated']
    },
    {
      id: 'exec-003',
      jobId: 'job-003',
      jobName: 'Data Validation Report',
      jobType: 'DATA_VALIDATION',
      status: 'FAILED',
      priority: 'NORMAL',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3300000).toISOString(),
      duration: 300000,
      progress: 45,
      userId: 'user-003',
      userName: 'Lisa Rodriguez',
      tenantId: 'tenant-001',
      tenantName: 'Metro Bank',
      errorMessage: 'Data quality check failed',
      errorDetails: 'Invalid data format detected in column OUTSTANDING_AMOUNT',
      resourceUsage: {
        cpuUsage: 15,
        memoryUsage: 256,
        diskUsage: 12
      },
      performanceMetrics: {
        recordsProcessed: 23000,
        throughput: 1200,
        averageResponseTime: 200
      },
      isScheduled: false,
      retryCount: 1,
      maxRetries: 3,
      tags: ['validation', 'manual', 'quality']
    }
  ];

  const mockJobDefinitions: JobDefinition[] = [
    {
      id: 'job-001',
      name: 'IFRS9 ECL Calculation - Monthly',
      description: 'Monthly Expected Credit Loss calculation for all portfolios',
      type: 'IFRS9_CALCULATION',
      isEnabled: true,
      scheduleExpression: '0 0 1 * *',
      parameters: { includeStressTest: true, reportFormat: 'PDF' },
      maxRetries: 3,
      timeout: 7200000,
      priority: 'HIGH',
      createdBy: 'system',
      lastModified: new Date().toISOString(),
      nextRunTime: addMinutes(new Date(), 120).toISOString(),
      lastRunStatus: 'RUNNING',
      lastRunTime: new Date().toISOString()
    },
    {
      id: 'job-002',
      name: 'Portfolio Data ETL Process',
      description: 'Extract, transform, and load portfolio data from core banking',
      type: 'ETL_PROCESS',
      isEnabled: true,
      scheduleExpression: '0 */4 * * *',
      parameters: { sourceSystem: 'CoreBanking', batchSize: 1000 },
      maxRetries: 2,
      timeout: 3600000,
      priority: 'NORMAL',
      createdBy: 'admin',
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      nextRunTime: addMinutes(new Date(), 240).toISOString(),
      lastRunStatus: 'COMPLETED',
      lastRunTime: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const mockSystemMetrics: SystemMetrics = {
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 34,
    activeJobs: 3,
    queuedJobs: 8,
    completedJobsToday: 156,
    failedJobsToday: 12,
    averageExecutionTime: 1250000,
    throughputPerHour: 45000
  };

  // Fetch data
  const fetchJobExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In real implementation, call API
      // const response = await api.get('/api/v1/jobs/executions', { params: filters });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobExecutions(mockJobExecutions);
      setJobDefinitions(mockJobDefinitions);
      setSystemMetrics(mockSystemMetrics);
    } catch (error) {
      console.error('Error fetching job data:', error);
      setError('Failed to fetch job data. Please try again.');
      // Fallback to mock data
      setJobExecutions(mockJobExecutions);
      setJobDefinitions(mockJobDefinitions);
      setSystemMetrics(mockSystemMetrics);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobExecutions();
  }, [fetchJobExecutions]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchJobExecutions();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchJobExecutions]);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFilterChange = (field: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: subDays(new Date(), 1),
      dateTo: new Date(),
    });
  };

  const handleRefresh = () => {
    fetchJobExecutions();
  };

  const handleViewJobDetails = (job: JobExecution) => {
    setJobDetailsDialog({
      open: true,
      job
    });
  };

  const handleJobControl = async (job: JobExecution, action: 'start' | 'pause' | 'stop' | 'restart') => {
    setJobControlDialog({
      open: true,
      job,
      action
    });
  };

  const executeJobControl = async () => {
    if (!jobControlDialog.job || !jobControlDialog.action) return;

    try {
      // In real implementation, call API
      // await api.post(`/api/v1/jobs/${jobControlDialog.job.jobId}/${jobControlDialog.action}`);
      console.log(`${jobControlDialog.action} job:`, jobControlDialog.job.jobName);
      
      setJobControlDialog({ open: false, job: null, action: null });
      fetchJobExecutions();
    } catch (error) {
      console.error('Job control error:', error);
    }
  };

  const toggleJobDefinition = async (jobId: string, enabled: boolean) => {
    try {
      // In real implementation, call API
      // await api.patch(`/api/v1/jobs/definitions/${jobId}`, { isEnabled: enabled });
      console.log(`${enabled ? 'Enable' : 'Disable'} job:`, jobId);
      
      setJobDefinitions(prev => 
        prev.map(job => 
          job.id === jobId ? { ...job, isEnabled: enabled } : job
        )
      );
    } catch (error) {
      console.error('Toggle job error:', error);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'info';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'PENDING': return 'warning';
      case 'PAUSED': return 'secondary';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'IFRS9_CALCULATION': return <AnalyticsIcon />;
      case 'ETL_PROCESS': return <StorageIcon />;
      case 'DATA_VALIDATION': return <CheckCircleIcon />;
      case 'REPORT_GENERATION': return <AssignmentIcon />;
      case 'BACKUP': return <CloudDownloadIcon />;
      case 'MAINTENANCE': return <SettingsIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // DataGrid columns for job executions
  const executionColumns: GridColDef[] = [
    {
      field: 'jobName',
      headerName: 'Job Name',
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getJobTypeIcon(params.row.jobType)}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {params.row.jobName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.jobType.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.status}
          size="small"
          color={getStatusColor(params.row.status) as any}
          variant="filled"
        />
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={params.row.progress}
              sx={{ flexGrow: 1, height: 6 }}
              color={params.row.status === 'FAILED' ? 'error' : 'primary'}
            />
            <Typography variant="caption" sx={{ minWidth: 35 }}>
              {params.row.progress}%
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.priority}
          size="small"
          color={getPriorityColor(params.row.priority) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {format(parseISO(params.row.startTime), 'MMM dd, HH:mm')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(parseISO(params.row.startTime), 'yyyy')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.status === 'RUNNING' 
            ? formatDuration(Date.now() - new Date(params.row.startTime).getTime())
            : formatDuration(params.row.duration)
          }
        </Typography>
      ),
    },
    {
      field: 'userName',
      headerName: 'User',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {params.row.userName.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Typography variant="body2">
            {params.row.userName}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewJobDetails(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'RUNNING' && (
            <Tooltip title="Pause Job">
              <IconButton
                size="small"
                onClick={() => handleJobControl(params.row, 'pause')}
              >
                <PauseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.status === 'PAUSED' && (
            <Tooltip title="Resume Job">
              <IconButton
                size="small"
                onClick={() => handleJobControl(params.row, 'start')}
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {(params.row.status === 'RUNNING' || params.row.status === 'PAUSED') && (
            <Tooltip title="Stop Job">
              <IconButton
                size="small"
                onClick={() => handleJobControl(params.row, 'stop')}
                color="error"
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; direction: 'up' | 'down' };
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend.direction === 'up' ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="caption"
              sx={{
                color: trend.direction === 'up' ? 'success.main' : 'error.main',
                ml: 0.5
              }}
            >
              {trend.value}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Job Monitoring Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and control background jobs, ETL processes, and system tasks
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="Auto Refresh"
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* System Metrics */}
      {systemMetrics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Active Jobs"
              value={systemMetrics.activeJobs}
              icon={<PlayArrowIcon fontSize="large" />}
              color={theme.palette.info.main}
              subtitle="Currently running"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Queued Jobs"
              value={systemMetrics.queuedJobs}
              icon={<HourglassEmptyIcon fontSize="large" />}
              color={theme.palette.warning.main}
              subtitle="Waiting to start"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Completed Today"
              value={systemMetrics.completedJobsToday}
              icon={<CheckCircleIcon fontSize="large" />}
              color={theme.palette.success.main}
              trend={{ value: 12, direction: 'up' }}
              subtitle="Successful jobs"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Failed Today"
              value={systemMetrics.failedJobsToday}
              icon={<ErrorIcon fontSize="large" />}
              color={theme.palette.error.main}
              trend={{ value: 5, direction: 'down' }}
              subtitle="Failed jobs"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label="Active Jobs"
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab
            label="Job History"
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab
            label="Job Definitions"
            icon={<SettingsIcon />}
            iconPosition="start"
          />
          <Tab
            label="System Performance"
            icon={<SpeedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Active Jobs Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Filters"
            action={
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="RUNNING">Running</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="PAUSED">Paused</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="FAILED">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="IFRS9_CALCULATION">IFRS9 Calculation</MenuItem>
                    <MenuItem value="ETL_PROCESS">ETL Process</MenuItem>
                    <MenuItem value="DATA_VALIDATION">Data Validation</MenuItem>
                    <MenuItem value="REPORT_GENERATION">Report Generation</MenuItem>
                    <MenuItem value="BACKUP">Backup</MenuItem>
                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    label="Priority"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="CRITICAL">Critical</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Search by job name, user, or tenant..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Active Jobs DataGrid */}
        <Card>
          <CardHeader
            title={`Job Executions (${jobExecutions.length})`}
            subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
          />
          <CardContent>
            <DataGrid
              rows={jobExecutions}
              columns={executionColumns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{ height: 600 }}
              onRowDoubleClick={(params: GridRowParams) => handleViewJobDetails(params.row)}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Job History Tab */}
      <TabPanel value={currentTab} index={1}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Job History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historical job execution data and trends coming soon...
          </Typography>
        </Box>
      </TabPanel>

      {/* Job Definitions Tab */}
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          {jobDefinitions.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job.id}>
              <Card>
                <CardHeader
                  title={job.name}
                  subheader={job.description}
                  action={
                    <Switch
                      checked={job.isEnabled}
                      onChange={(e) => toggleJobDefinition(job.id, e.target.checked)}
                      size="small"
                    />
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Schedule
                      </Typography>
                      <Typography variant="body2">
                        {job.scheduleExpression}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Next Run
                      </Typography>
                      <Typography variant="body2">
                        {job.nextRunTime ? format(parseISO(job.nextRunTime), 'MMM dd, yyyy HH:mm') : 'Not scheduled'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Status
                      </Typography>
                      <Chip
                        label={job.lastRunStatus || 'Never run'}
                        size="small"
                        color={job.lastRunStatus ? getStatusColor(job.lastRunStatus) as any : 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Priority: {job.priority}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max Retries: {job.maxRetries}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* System Performance Tab */}
      <TabPanel value={currentTab} index={3}>
        {systemMetrics && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="CPU Usage"
                value={`${systemMetrics.cpuUsage}%`}
                icon={<ComputerIcon fontSize="large" />}
                color={systemMetrics.cpuUsage > 80 ? theme.palette.error.main : theme.palette.success.main}
                subtitle="System CPU utilization"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Memory Usage"
                value={`${systemMetrics.memoryUsage}%`}
                icon={<MemoryIcon fontSize="large" />}
                color={systemMetrics.memoryUsage > 80 ? theme.palette.error.main : theme.palette.info.main}
                subtitle="System memory utilization"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Disk Usage"
                value={`${systemMetrics.diskUsage}%`}
                icon={<StorageIcon fontSize="large" />}
                color={systemMetrics.diskUsage > 80 ? theme.palette.error.main : theme.palette.primary.main}
                subtitle="System disk utilization"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatCard
                title="Avg Execution Time"
                value={formatDuration(systemMetrics.averageExecutionTime)}
                icon={<ScheduleIcon fontSize="large" />}
                color={theme.palette.warning.main}
                subtitle="Average job completion time"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StatCard
                title="Throughput"
                value={`${systemMetrics.throughputPerHour.toLocaleString()}/hr`}
                icon={<SpeedIcon fontSize="large" />}
                color={theme.palette.success.main}
                subtitle="Records processed per hour"
              />
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsDialog.open}
        onClose={() => setJobDetailsDialog({ open: false, job: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Job Execution Details
        </DialogTitle>
        <DialogContent>
          {jobDetailsDialog.job && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body2">{jobDetailsDialog.job.jobName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body2">{jobDetailsDialog.job.jobType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip
                      label={jobDetailsDialog.job.status}
                      size="small"
                      color={getStatusColor(jobDetailsDialog.job.status) as any}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Priority</Typography>
                    <Chip
                      label={jobDetailsDialog.job.priority}
                      size="small"
                      color={getPriorityColor(jobDetailsDialog.job.priority) as any}
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Execution Details
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Start Time</Typography>
                    <Typography variant="body2">
                      {format(parseISO(jobDetailsDialog.job.startTime), 'MMM dd, yyyy HH:mm:ss')}
                    </Typography>
                  </Box>
                  {jobDetailsDialog.job.endTime && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">End Time</Typography>
                      <Typography variant="body2">
                        {format(parseISO(jobDetailsDialog.job.endTime), 'MMM dd, yyyy HH:mm:ss')}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="body2">
                      {jobDetailsDialog.job.status === 'RUNNING' 
                        ? formatDuration(Date.now() - new Date(jobDetailsDialog.job.startTime).getTime())
                        : formatDuration(jobDetailsDialog.job.duration)
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={jobDetailsDialog.job.progress}
                        sx={{ flexGrow: 1 }}
                      />
                      <Typography variant="body2">
                        {jobDetailsDialog.job.progress}%
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              {jobDetailsDialog.job.resourceUsage && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Resource Usage
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                      <Typography variant="body2">{jobDetailsDialog.job.resourceUsage.cpuUsage}%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Memory Usage</Typography>
                      <Typography variant="body2">{jobDetailsDialog.job.resourceUsage.memoryUsage} MB</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Disk Usage</Typography>
                      <Typography variant="body2">{jobDetailsDialog.job.resourceUsage.diskUsage}%</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {jobDetailsDialog.job.performanceMetrics && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Records Processed</Typography>
                      <Typography variant="body2">
                        {jobDetailsDialog.job.performanceMetrics.recordsProcessed.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Throughput</Typography>
                      <Typography variant="body2">
                        {jobDetailsDialog.job.performanceMetrics.throughput.toLocaleString()} records/min
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
                      <Typography variant="body2">
                        {jobDetailsDialog.job.performanceMetrics.averageResponseTime}ms
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {jobDetailsDialog.job.errorMessage && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Error Information
                  </Typography>
                  <Alert severity="error">
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {jobDetailsDialog.job.errorMessage}
                    </Typography>
                    {jobDetailsDialog.job.errorDetails && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {jobDetailsDialog.job.errorDetails}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDetailsDialog({ open: false, job: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Control Dialog */}
      <Dialog
        open={jobControlDialog.open}
        onClose={() => setJobControlDialog({ open: false, job: null, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Job {jobControlDialog.action?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          {jobControlDialog.job && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to {jobControlDialog.action} the following job?
              </Typography>
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6">
                  {jobControlDialog.job.jobName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Status: {jobControlDialog.job.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progress: {jobControlDialog.job.progress}%
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobControlDialog({ open: false, job: null, action: null })}>
            Cancel
          </Button>
          <Button
            onClick={executeJobControl}
            variant="contained"
            color={jobControlDialog.action === 'stop' ? 'error' : 'primary'}
          >
            {jobControlDialog.action?.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobMonitoringPage;