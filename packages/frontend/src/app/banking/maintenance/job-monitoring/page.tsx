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
import { GridColDef, GridRowParams, GridRenderCellParams } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
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
  FilterList as FilterListIcon,
  Add as AddIcon,
  PlayCircleFilled as RunIcon,
  Description as ScriptIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, subDays, addMinutes, differenceInMinutes } from 'date-fns';
import { bankingAPI } from '@/services/api';

// Types and Interfaces
interface JobExecution {
  id: string;
  jobId: string;
  jobName: string;
  jobType: 'SQL_SP' | 'INTERNAL_SCRIPT' | 'SHELL_COMMAND' | 'IFRS9_CALCULATION' | 'ETL_PROCESS' | 'DATA_VALIDATION' | 'REPORT_GENERATION' | 'BACKUP' | 'MAINTENANCE';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING' | 'PAUSED' | 'CANCELLED' | 'active' | 'waiting';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  userId: string;
  userName?: string;
  tenantId?: string;
  tenantName?: string;
  parameters?: any;
  resultData?: any;
  errorMessage?: string;
  triggeredBy?: string;
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

interface CreateJobForm {
  name: string;
  description?: string;
  type: string;
  parameters: Record<string, unknown>;
  priority: string;
  maxRetries: number;
  timeout: number;
  isEnabled: boolean;
  scheduleExpression: string;
  targetDatabase?: 'TENANT' | 'LEGACY';
  schemaName?: string;
  procedureName?: string;
  handlerName?: string;
  command?: string;
}

const DEFAULT_NEW_JOB_DATA: CreateJobForm = {
  name: '',
  type: 'SQL_SP',
  parameters: {},
  priority: 'NORMAL',
  maxRetries: 3,
  timeout: 3600,
  isEnabled: true,
  scheduleExpression: '',
  targetDatabase: 'TENANT',
  schemaName: '',
  procedureName: '',
  handlerName: '',
  command: '',
};

const LEGACY_IFRS9_SEQUENCE_JOB_TEMPLATE: CreateJobForm = {
  ...DEFAULT_NEW_JOB_DATA,
  name: 'IFRS9 Impairment Sequence',
  type: 'SQL_SP',
  targetDatabase: 'LEGACY',
  schemaName: 'public',
  procedureName: 'sp_frs9_imp_sequence',
  priority: 'HIGH',
};

const toUiStatus = (rawStatus?: string | null): string => {
  if (!rawStatus) return 'PENDING';
  const status = rawStatus.toUpperCase();
  switch (status) {
    case 'ACTIVE':
      return 'RUNNING';
    case 'WAITING':
    case 'PENDING_APPROVAL':
      return 'PENDING';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'FAILED':
      return 'FAILED';
    case 'PAUSED':
      return 'PAUSED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return status;
  }
};

const toExecutionUiStatus = (execution: { status?: string | null; endTime?: string | null; error?: string | null }): JobExecution['status'] => {
  const mapped = toUiStatus(execution.status) as JobExecution['status'];

  // Guard against stale backend status where end_time/error already indicates terminal state.
  if (mapped === 'RUNNING' && execution.endTime) {
    return execution.error ? 'FAILED' : 'COMPLETED';
  }

  return mapped;
};

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`job-monitoring-tabpanel-${index}`}
    aria-labelledby={`job-monitoring-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
  </div>
);

export default function JobMonitoringPage({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [statusTab, setStatusTab] = useState(0); // 0: All, 1: Ongoing, 2: Running, 3: Completed, 4: Failed
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

  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);
  const [newJobData, setNewJobData] = useState<CreateJobForm>(DEFAULT_NEW_JOB_DATA);

  const normalizeSqlProcedureInput = (jobData: CreateJobForm) => {
    const rawProcedure = (jobData.procedureName || '').trim();
    const rawSchema = (jobData.schemaName || '').trim();
    const parts = rawProcedure.split('.').map((part) => part.trim()).filter(Boolean);

    let schemaName = rawSchema;
    let procedureName = rawProcedure;
    let targetDatabase = jobData.targetDatabase || 'TENANT';
    let sourceDatabase: string | undefined;

    if (parts.length === 2) {
      if (!schemaName) schemaName = parts[0];
      procedureName = parts[1];
    }

    if (parts.length >= 3) {
      sourceDatabase = parts[0];
      if (!schemaName) schemaName = parts[1];
      procedureName = parts.slice(2).join('.');
      if (targetDatabase === 'TENANT') {
        targetDatabase = 'LEGACY';
      }
    }

    const normalized: Record<string, unknown> = {
      ...jobData.parameters,
      procedureName,
      targetDatabase,
    };

    if (schemaName) normalized.schemaName = schemaName;
    if (sourceDatabase) normalized.sourceDatabase = sourceDatabase;

    return { defaultParameters: normalized };
  };

  const handleCreateJob = async () => {
    try {
      const trimmedName = (newJobData.name || '').trim();
      if (!trimmedName) {
        setError('Job name is required.');
        return;
      }

      if (newJobData.type === 'SQL_SP' && !(newJobData.procedureName || '').trim()) {
        setError('Stored Procedure Name is required for Stored Procedure jobs.');
        return;
      }

      if (newJobData.type === 'INTERNAL_SCRIPT' && !(newJobData.handlerName || '').trim()) {
        setError('Handler Name is required for Internal Script jobs.');
        return;
      }

      if (newJobData.type === 'SHELL_COMMAND' && !(newJobData.command || '').trim()) {
        setError('Shell Command is required for Shell Command jobs.');
        return;
      }

      setLoading(true);

      // Construct defaultParameters based on job type
      let defaultParams: Record<string, unknown> = { ...(newJobData.parameters || {}) };

      if (newJobData.type === 'SQL_SP') {
        const normalized = normalizeSqlProcedureInput(newJobData);
        defaultParams = normalized.defaultParameters;
      } else if (newJobData.type === 'INTERNAL_SCRIPT' && newJobData.handlerName) {
        defaultParams.handlerName = newJobData.handlerName.trim();
      } else if (newJobData.type === 'SHELL_COMMAND' && newJobData.command) {
        defaultParams.command = newJobData.command.trim();
      }

      // Map frontend fields to backend schema
      const payload = {
        name: trimmedName,
        description: newJobData.description?.trim() || undefined,
        jobType: newJobData.type,
        cronExpression: newJobData.scheduleExpression || undefined,
        defaultParameters: defaultParams,
        priority: newJobData.priority,
        maxRetries: newJobData.maxRetries,
        timeout: newJobData.timeout,
        isEnabled: newJobData.isEnabled,
      };

      await bankingAPI.jobs.createDefinition(payload as any);

      setCreateJobDialogOpen(false);
      fetchJobExecutions();

      // Reset form
      setNewJobData(DEFAULT_NEW_JOB_DATA);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job definition. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateLegacyIfrs9Job = () => {
    setNewJobData(LEGACY_IFRS9_SEQUENCE_JOB_TEMPLATE);
    setCreateJobDialogOpen(true);
  };

  const isCreateJobDisabled =
    loading
    || !(newJobData.name || '').trim()
    || (newJobData.type === 'SQL_SP' && !(newJobData.procedureName || '').trim())
    || (newJobData.type === 'INTERNAL_SCRIPT' && !(newJobData.handlerName || '').trim())
    || (newJobData.type === 'SHELL_COMMAND' && !(newJobData.command || '').trim());



  // Fetch data
  const fetchJobExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [executions, definitions, metrics] = await Promise.all([
        bankingAPI.jobs.getExecutions({ limit: 100 }),
        bankingAPI.jobs.getDefinitions(),
        bankingAPI.jobs.getMetrics()
      ]);

      // Map backend statuses to UI statuses
      const mapped: JobExecution[] = (executions || []).map((e: any) => {
        const rawError = typeof e.error === 'string' ? e.error : '';
        const [summary, ...details] = rawError.split('\n');

        return {
          id: e.id,
          jobId: e.jobDefinitionId || e.jobId || e.id,
          jobName: e.jobName || e.jobType,
          jobType: e.jobType,
          status: toExecutionUiStatus(e),
          priority: e.priority || 'NORMAL',
          startTime: e.startTime || new Date().toISOString(),
          endTime: e.endTime || undefined,
          progress: typeof e.progress === 'number' ? e.progress : 0,
          resultSummary: e.result || undefined,
          errorMessage: summary || undefined,
          errorDetails: details.join('\n').trim() || undefined,
          triggeredBy: e.triggeredBy || undefined,
          userName: e.userName || e.triggeredBy || 'System',
          tenantName: e.tenantName || 'Main Tenant',
        };
      });

      const latestExecutionByDefinition = new Map<string, JobExecution>();
      for (const execution of mapped) {
        if (!execution.jobId || execution.jobId === execution.id) continue;
        if (!latestExecutionByDefinition.has(execution.jobId)) {
          latestExecutionByDefinition.set(execution.jobId, execution);
        }
      }

      const mappedDefinitions: JobDefinition[] = (definitions || []).map((d: any) => {
        const latestExecution = latestExecutionByDefinition.get(d.id);

        return {
          id: d.id,
          name: d.name,
          description: d.description || '',
          type: d.type || d.jobType || 'UNKNOWN',
          isEnabled: Boolean(d.isEnabled),
          scheduleExpression: d.scheduleExpression || d.cronExpression || '',
          parameters: d.parameters || d.defaultParameters || {},
          maxRetries: Number(d.maxRetries ?? 0),
          timeout: Number(d.timeout ?? 3600),
          priority: d.priority || 'NORMAL',
          createdBy: d.createdBy || '',
          lastModified: d.updatedAt || d.lastModified || d.createdAt || new Date().toISOString(),
          nextRunTime: d.nextRunTime || undefined,
          lastRunStatus: d.lastRunStatus
            ? toUiStatus(d.lastRunStatus)
            : latestExecution
              ? toUiStatus(latestExecution.status)
              : undefined,
          lastRunTime: d.lastRunTime || latestExecution?.startTime || undefined,
        };
      });

      setJobExecutions(mapped);
      setJobDefinitions((prev) => {
        const prevById = new Map(prev.map((job) => [job.id, job]));

        return mappedDefinitions.map((job) => {
          const previous = prevById.get(job.id);
          return {
            ...job,
            // Preserve optimistic status/time until backend has persisted last-run state.
            lastRunStatus: job.lastRunStatus ?? previous?.lastRunStatus,
            lastRunTime: job.lastRunTime ?? previous?.lastRunTime,
          };
        });
      });
      setSystemMetrics({
        cpuUsage: metrics?.cpuUsage || 0,
        memoryUsage: metrics?.memoryUsage || 0,
        diskUsage: metrics?.diskUsage || 0,
        activeJobs: metrics?.activeJobs || 0,
        queuedJobs: metrics?.queuedJobs || 0,
        completedJobsToday: metrics?.completedJobsToday || 0,
        failedJobsToday: metrics?.failedJobsToday || 0,
        averageExecutionTime: metrics?.averageExecutionTime || 0,
        throughputPerHour: metrics?.throughputPerHour || 0,
      });
    } catch (error) {
      console.error('Error fetching job data:', error);
      setError('Failed to fetch job data. Please try again.');
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

  const handleStatusTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setStatusTab(newValue);
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

  const handleJobAction = async (jobId: string, action: 'start' | 'pause' | 'stop' | 'restart') => {
    if (action === 'start') {
      try {
        setLoading(true);
        const runResponse = await bankingAPI.jobs.runJob(jobId);
        const immediateStatus = toUiStatus(runResponse?.status || 'PENDING');
        const nowIso = new Date().toISOString();

        // Optimistic status update on definitions card after "Run Now"
        setJobDefinitions((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? { ...job, lastRunStatus: immediateStatus, lastRunTime: nowIso }
              : job
          )
        );

        await fetchJobExecutions();
      } catch (error) {
        console.error('Run job error:', error);
        setError('Failed to start job execution.');
      } finally {
        setLoading(false);
      }
    } else {
      // For existing executions
      const execution = jobExecutions.find(e => e.id === jobId);
      if (execution) {
        handleJobControl(execution, action);
      }
    }
  };

  const executeJobControl = async () => {
    if (!jobControlDialog.job || !jobControlDialog.action) return;

    try {
      if (jobControlDialog.action === 'start' || jobControlDialog.action === 'restart') {
        await bankingAPI.jobs.runJob(jobControlDialog.job.jobId || jobControlDialog.job.id);
      } else if (jobControlDialog.action === 'stop' || jobControlDialog.action === 'pause') {
        await bankingAPI.jobs.controlJob(jobControlDialog.job.id, jobControlDialog.action);
      }

      setJobControlDialog({ open: false, job: null, action: null });
      fetchJobExecutions();
    } catch (error) {
      console.error('Job control error:', error);
      setError('Failed to control job. Please try again.');
    }
  };

  const toggleJobDefinition = async (jobId: string, enabled: boolean) => {
    try {
      await bankingAPI.jobs.toggleJob(jobId);

      setJobDefinitions(prev =>
        prev.map(job =>
          job.id === jobId ? { ...job, isEnabled: enabled } : job
        )
      );
    } catch (error) {
      console.error('Toggle job error:', error);
      setError('Failed to toggle job. Please try again.');
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (toUiStatus(status)) {
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
      case 'SQL_SP': return <CodeIcon />;
      case 'INTERNAL_SCRIPT': return <ScriptIcon />;
      case 'SHELL_COMMAND': return <TerminalIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Filter jobs by status tab
  const getFilteredJobsByStatus = () => {
    let filtered = jobExecutions;

    // Apply status tab filter
    switch (statusTab) {
      case 1: // Ongoing
        filtered = filtered.filter(job => job.status === 'PENDING');
        break;
      case 2: // Running
        filtered = filtered.filter(job => job.status === 'RUNNING');
        break;
      case 3: // Completed
        filtered = filtered.filter(job => job.status === 'COMPLETED');
        break;
      case 4: // Failed
        filtered = filtered.filter(job => job.status === 'FAILED');
        break;
      default: // All
        break;
    }

    // Apply additional filters
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(job => job.jobType === filters.type);
    }
    if (filters.priority) {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.jobName.toLowerCase().includes(term) ||
        (job.userName && job.userName.toLowerCase().includes(term)) ||
        (job.tenantName && job.tenantName.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  // Get counts for each status
  const getStatusCounts = () => {
    return {
      all: jobExecutions.length,
      ongoing: jobExecutions.filter(job => job.status === 'PENDING').length,
      running: jobExecutions.filter(job => job.status === 'RUNNING').length,
      completed: jobExecutions.filter(job => job.status === 'COMPLETED').length,
      failed: jobExecutions.filter(job => job.status === 'FAILED').length,
    };
  };

  const statusCounts = getStatusCounts();
  const filteredJobs = getFilteredJobsByStatus();

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
      width: 110,
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
            {icon as any}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setNewJobData(DEFAULT_NEW_JOB_DATA);
              setCreateJobDialogOpen(true);
            }}
            sx={{ mr: 1, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}
          >
            Create Job
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ScriptIcon />}
            onClick={handleOpenCreateLegacyIfrs9Job}
          >
            Quick Add IFRS9 Legacy Job
          </Button>

          <Tooltip title="Refresh All Data">
            <IconButton onClick={handleRefresh} disabled={loading} color="primary" sx={{ border: '1px solid', borderColor: 'primary.light' }}>
              <RefreshIcon className={loading ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
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
          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              title="Active Jobs"
              value={systemMetrics.activeJobs}
              icon={<PlayArrowIcon fontSize="large" />}
              color={theme.palette.info.main}
              subtitle="Currently running"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              title="Queued Jobs"
              value={systemMetrics.queuedJobs}
              icon={<HourglassEmptyIcon fontSize="large" />}
              color={theme.palette.warning.main}
              subtitle="Waiting to start"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <StatCard
              title="Completed Today"
              value={systemMetrics.completedJobsToday}
              icon={<CheckCircleIcon fontSize="large" />}
              color={theme.palette.success.main}
              trend={{ value: 12, direction: 'up' }}
              subtitle="Successful jobs"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
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
        {/* Status Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={statusTab}
            onChange={handleStatusTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    All Jobs
                  </Typography>
                  <Chip
                    label={statusCounts.all}
                    size="small"
                    color="default"
                    sx={{ mt: 0.5, minWidth: 40 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<HourglassEmptyIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Ongoing
                  </Typography>
                  <Chip
                    label={statusCounts.ongoing}
                    size="small"
                    color="warning"
                    sx={{ mt: 0.5, minWidth: 40 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<PlayArrowIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Running
                  </Typography>
                  <Chip
                    label={statusCounts.running}
                    size="small"
                    color="info"
                    sx={{ mt: 0.5, minWidth: 40 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<CheckCircleIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Completed
                  </Typography>
                  <Chip
                    label={statusCounts.completed}
                    size="small"
                    color="success"
                    sx={{ mt: 0.5, minWidth: 40 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<ErrorIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Failed
                  </Typography>
                  <Chip
                    label={statusCounts.failed}
                    size="small"
                    color="error"
                    sx={{ mt: 0.5, minWidth: 40 }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Paper>

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
              <Grid size={{ xs: 12, md: 2 }}>
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
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="SQL_SP">Stored Procedure</MenuItem>
                    <MenuItem value="INTERNAL_SCRIPT">Internal Script</MenuItem>
                    <MenuItem value="SHELL_COMMAND">Shell Command</MenuItem>
                    <MenuItem value="IFRS9_CALCULATION">IFRS9 Calculation</MenuItem>
                    <MenuItem value="ETL_PROCESS">ETL Process</MenuItem>
                    <MenuItem value="DATA_VALIDATION">Data Validation</MenuItem>
                    <MenuItem value="REPORT_GENERATION">Report Generation</MenuItem>
                    <MenuItem value="BACKUP">Backup</MenuItem>
                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
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
            title={`Job Executions (${filteredJobs.length}${filteredJobs.length !== jobExecutions.length ? ` of ${jobExecutions.length}` : ''})`}
            subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
          />
          <CardContent>
            <SafeDataGrid
              rows={filteredJobs}
              columns={executionColumns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              checkboxSelection
              sx={{ height: 600 }}
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
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={job.id}>
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
                        Type: {job.type}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RunIcon />}
                      onClick={() => handleJobAction(job.id, 'start')}
                      disabled={!job.isEnabled || loading}
                      fullWidth
                    >
                      Run Now
                    </Button>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard
                title="CPU Usage"
                value={`${systemMetrics.cpuUsage}%`}
                icon={<ComputerIcon fontSize="large" />}
                color={systemMetrics.cpuUsage > 80 ? theme.palette.error.main : theme.palette.success.main}
                subtitle="System CPU utilization"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard
                title="Memory Usage"
                value={`${systemMetrics.memoryUsage}%`}
                icon={<MemoryIcon fontSize="large" />}
                color={systemMetrics.memoryUsage > 80 ? theme.palette.error.main : theme.palette.info.main}
                subtitle="System memory utilization"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <StatCard
                title="Disk Usage"
                value={`${systemMetrics.diskUsage}%`}
                icon={<StorageIcon fontSize="large" />}
                color={systemMetrics.diskUsage > 80 ? theme.palette.error.main : theme.palette.primary.main}
                subtitle="System disk utilization"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Avg Execution Time"
                value={formatDuration(systemMetrics.averageExecutionTime)}
                icon={<ScheduleIcon fontSize="large" />}
                color={theme.palette.warning.main}
                subtitle="Average job completion time"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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

      {/* Create Job Dialog */}
      <Dialog
        open={createJobDialogOpen}
        onClose={() => setCreateJobDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Job Definition</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Job Name"
                value={newJobData.name}
                onChange={(e) => setNewJobData({ ...newJobData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={newJobData.type}
                  label="Job Type"
                  onChange={(e) =>
                    setNewJobData((prev) => ({
                      ...prev,
                      type: e.target.value,
                      // Reset type-specific fields when switching job type
                      procedureName: '',
                      schemaName: '',
                      handlerName: '',
                      command: '',
                    }))
                  }
                >
                  <MenuItem value="SQL_SP">Stored Procedure</MenuItem>
                  <MenuItem value="INTERNAL_SCRIPT">Internal Script</MenuItem>
                  <MenuItem value="SHELL_COMMAND">Shell Command</MenuItem>
                  <MenuItem value="IFRS9_CALCULATION">IFRS9 Calculation</MenuItem>
                  <MenuItem value="ETL_PROCESS">ETL Process</MenuItem>
                  <MenuItem value="DATA_VALIDATION">Data Validation</MenuItem>
                  <MenuItem value="REPORT_GENERATION">Report Generation</MenuItem>
                  <MenuItem value="BACKUP">Backup</MenuItem>
                  <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Dynamic Fields based on Job Type */}
            {newJobData.type === 'SQL_SP' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Target Database</InputLabel>
                    <Select
                      value={newJobData.targetDatabase || 'TENANT'}
                      label="Target Database"
                      onChange={(e) => setNewJobData({ ...newJobData, targetDatabase: e.target.value as 'TENANT' | 'LEGACY' })}
                    >
                      <MenuItem value="TENANT">Tenant DB (Default)</MenuItem>
                      <MenuItem value="LEGACY">Legacy DB (IFRS9 Engine)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Schema Name"
                    placeholder="e.g. core, risk, public"
                    value={newJobData.schemaName || ''}
                    onChange={(e) => setNewJobData({ ...newJobData, schemaName: e.target.value })}
                    helperText="Database schema (optional, defaults to public/core)"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Stored Procedure Name"
                    placeholder="e.g. sp_frs9_imp_sequence or FRS9PRO.public.sp_frs9_imp_sequence"
                    value={newJobData.procedureName || ''}
                    onChange={(e) => setNewJobData({ ...newJobData, procedureName: e.target.value })}
                    helperText="Required. Supports schema/db qualified format."
                    required
                  />
                </Grid>
              </>
            )}

            {newJobData.type === 'INTERNAL_SCRIPT' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Handler Name"
                  placeholder="e.g. test_handler"
                  value={newJobData.handlerName || ''}
                  onChange={(e) => setNewJobData({ ...newJobData, handlerName: e.target.value })}
                  helperText="Registered internal handler name"
                  required
                />
              </Grid>
            )}

            {newJobData.type === 'SHELL_COMMAND' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Shell Command"
                  placeholder="e.g. ls -la"
                  value={newJobData.command || ''}
                  onChange={(e) => setNewJobData({ ...newJobData, command: e.target.value })}
                  helperText="System command to execute (use with caution)"
                  required
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newJobData.priority}
                  label="Priority"
                  onChange={(e) => setNewJobData({ ...newJobData, priority: e.target.value })}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Schedule Expression (Cron)"
                placeholder="0 0 * * *"
                value={newJobData.scheduleExpression}
                onChange={(e) => setNewJobData({ ...newJobData, scheduleExpression: e.target.value })}
                helperText="Leave empty for on-demand only"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Max Retries"
                type="number"
                value={newJobData.maxRetries}
                onChange={(e) => setNewJobData({ ...newJobData, maxRetries: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={newJobData.timeout}
                onChange={(e) => setNewJobData({ ...newJobData, timeout: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newJobData.isEnabled}
                    onChange={(e) => setNewJobData({ ...newJobData, isEnabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateJobDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateJob} variant="contained" disabled={isCreateJobDisabled}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

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
              <Grid size={{ xs: 12, md: 6 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Error Information
                  </Typography>
                  <Alert severity="error">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'medium', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {jobDetailsDialog.job.errorMessage}
                    </Typography>
                    {jobDetailsDialog.job.errorDetails && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        }}
                      >
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
