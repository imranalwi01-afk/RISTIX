// packages/frontend/src/app/banking/maintenance/job-monitoring/page.tsx
'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Typography,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Button,
  Alert,
  Tooltip,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Analytics as AnalyticsIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Add as AddIcon,
  Description as ScriptIcon,
  CloudDownload as CloudDownloadIcon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO, subDays } from 'date-fns';
import { bankingAPI } from '@/services/api';
import { usePermission } from '@/hooks/usePermission';
import { getErrorMessage } from '@/utils/error-message';
import { useJobExecutionRuntimeQuery, useJobMonitoringQuery } from '@/features/job-monitoring/hooks/useJobMonitoringQueries';
import { ActiveJobsPanel } from './components/ActiveJobsPanel';
import { JobSystemMetricsPanel } from './components/JobSystemMetricsPanel';
import { JobDefinitionsPanel } from './components/JobDefinitionsPanel';
import { JobExecutionDetailsDialog } from './components/JobExecutionDetailsDialog';
import { JobControlConfirmDialog } from './components/JobControlConfirmDialog';
import { CreateJobDefinitionDialog } from './components/CreateJobDefinitionDialog';
import {
  CreateJobForm,
  JobDefinition,
  JobExecution,
  JobFilters,
  JobRuntimeSummary,
  SupportedJobType,
  SystemMetrics,
  TabPanelProps,
} from './types';

const SUPPORTED_JOB_TYPE_OPTIONS: Array<{ value: SupportedJobType; label: string }> = [
  { value: 'SQL_SP', label: 'Stored Procedure' },
  { value: 'INTERNAL_SCRIPT', label: 'Internal Script' },
  { value: 'SHELL_COMMAND', label: 'Shell Command' },
];

const JOB_VIEW_PERMISSIONS = ['jobs.view', 'jobs.manage', 'jobs.access', 'admin.system.view', 'admin.system.manage', 'admin.super_admin'];
const JOB_CREATE_PERMISSIONS = ['jobs.create', 'jobs.manage', 'jobs.access', 'admin.system.manage', 'admin.super_admin'];
const JOB_RUN_PERMISSIONS = ['jobs.run', 'jobs.manage', 'jobs.access', 'admin.system.manage', 'admin.super_admin'];
const JOB_CONTROL_PERMISSIONS = ['jobs.control', 'jobs.manage', 'jobs.access', 'admin.system.manage', 'admin.super_admin'];
const JOB_RUNTIME_PERMISSIONS = ['jobs.runtime.view', 'jobs.manage', 'admin.system.view', 'admin.system.manage', 'admin.super_admin'];

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

const mapExecutionFromApi = (e: any): JobExecution => {
  const rawError = typeof e.error === 'string' ? e.error : '';
  const [summary, ...details] = rawError.split('\n');
  const runtime = e.runtime && typeof e.runtime === 'object' ? e.runtime as JobRuntimeSummary : undefined;

  return {
    id: e.id,
    jobId: e.jobDefinitionId || e.jobId || e.id,
    jobName: e.jobName || e.jobType,
    jobType: e.jobType,
    status: toExecutionUiStatus(e),
    priority: e.priority || 'NORMAL',
    startTime: e.startTime || new Date().toISOString(),
    endTime: e.endTime || undefined,
    resultSummary: e.result || undefined,
    errorMessage: summary || undefined,
    errorDetails: details.join('\n').trim() || undefined,
    triggeredBy: e.triggeredBy || undefined,
    userName: e.userName || e.triggeredBy || 'System',
    tenantName: e.tenantName || 'Main Tenant',
    runtime,
  };
};

const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === 'number' ? response.status : undefined;
};

const getHttpPayload = (error: unknown): Record<string, unknown> | null => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const payload = (error as { response?: { data?: unknown } }).response?.data;
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  return payload as Record<string, unknown>;
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
  const { hasAnyPermission } = usePermission();
  const canViewJobs = hasAnyPermission(JOB_VIEW_PERMISSIONS);
  const canCreateJobs = hasAnyPermission(JOB_CREATE_PERMISSIONS);
  const canRunJobs = hasAnyPermission(JOB_RUN_PERMISSIONS);
  const canControlJobs = hasAnyPermission(JOB_CONTROL_PERMISSIONS);
  const canViewRuntime = hasAnyPermission(JOB_RUNTIME_PERMISSIONS);
  const canEditJobDefinitions = canCreateJobs;
  const canDeleteJobDefinitions = canControlJobs;
  const [currentTab, setCurrentTab] = useState(0);
  const [statusTab, setStatusTab] = useState(0); // 0: All, 1: Ongoing, 2: Running, 3: Completed, 4: Failed
  const [jobExecutions, setJobExecutions] = useState<JobExecution[]>([]);
  const [jobDefinitions, setJobDefinitions] = useState<JobDefinition[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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
  const [editJobDialog, setEditJobDialog] = useState<{
    open: boolean;
    jobId: string | null;
    jobData: CreateJobForm;
  }>({
    open: false,
    jobId: null,
    jobData: DEFAULT_NEW_JOB_DATA,
  });
  const [deleteJobDialog, setDeleteJobDialog] = useState<{
    open: boolean;
    job: JobDefinition | null;
  }>({
    open: false,
    job: null,
  });
  const monitoringQuery = useJobMonitoringQuery({
    enabled: canViewJobs,
    autoRefresh,
  });
  const runtimeQuery = useJobExecutionRuntimeQuery(
    jobDetailsDialog.open && jobDetailsDialog.job?.status === 'RUNNING' && !jobDetailsDialog.job?.runtime?.available
      ? jobDetailsDialog.job.id
      : null,
    canViewRuntime,
  );
  const loading = monitoringQuery.isLoading || monitoringQuery.isFetching || actionLoading;

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

  const buildJobDefinitionPayload = (jobData: CreateJobForm) => {
    const trimmedName = (jobData.name || '').trim();

    let defaultParams: Record<string, unknown> = { ...(jobData.parameters || {}) };

    if (jobData.type === 'SQL_SP') {
      const normalized = normalizeSqlProcedureInput(jobData);
      defaultParams = normalized.defaultParameters;
    } else if (jobData.type === 'INTERNAL_SCRIPT' && jobData.handlerName) {
      defaultParams.handlerName = jobData.handlerName.trim();
    } else if (jobData.type === 'SHELL_COMMAND' && jobData.command) {
      defaultParams.command = jobData.command.trim();
    }

    return {
      name: trimmedName,
      description: jobData.description?.trim() || undefined,
      jobType: jobData.type,
      cronExpression: jobData.scheduleExpression || undefined,
      defaultParameters: defaultParams,
      priority: jobData.priority,
      maxRetries: jobData.maxRetries,
      timeout: jobData.timeout,
      isEnabled: jobData.isEnabled,
    };
  };

  const validateJobDefinitionForm = (jobData: CreateJobForm) => {
    const trimmedName = (jobData.name || '').trim();
    if (!trimmedName) {
      setError('Job name is required.');
      return false;
    }

    if (jobData.type === 'SQL_SP' && !(jobData.procedureName || '').trim()) {
      setError('Stored Procedure Name is required for Stored Procedure jobs.');
      return false;
    }

    if (jobData.type === 'INTERNAL_SCRIPT' && !(jobData.handlerName || '').trim()) {
      setError('Handler Name is required for Internal Script jobs.');
      return false;
    }

    if (jobData.type === 'SHELL_COMMAND' && !(jobData.command || '').trim()) {
      setError('Shell Command is required for Shell Command jobs.');
      return false;
    }

    return true;
  };

  const handleCreateJob = async () => {
    if (!canCreateJobs) {
      setError('You do not have permission to create job definitions.');
      return;
    }

    try {
      if (!validateJobDefinitionForm(newJobData)) return;

      setActionLoading(true);
      const payload = buildJobDefinitionPayload(newJobData);

      await bankingAPI.jobs.createDefinition(payload as any);

      setCreateJobDialogOpen(false);
      await fetchJobExecutions();

      // Reset form
      setNewJobData(DEFAULT_NEW_JOB_DATA);
    } catch (error) {
      console.error('Error creating job:', error);
      setError(getErrorMessage(error, 'Failed to create job definition. Please check your inputs.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCreateLegacyIfrs9Job = () => {
    if (!canCreateJobs) {
      setError('You do not have permission to create job definitions.');
      return;
    }

    setNewJobData(LEGACY_IFRS9_SEQUENCE_JOB_TEMPLATE);
    setCreateJobDialogOpen(true);
  };

  const isCreateJobDisabled =
    loading
    || !(newJobData.name || '').trim()
    || (newJobData.type === 'SQL_SP' && !(newJobData.procedureName || '').trim())
    || (newJobData.type === 'INTERNAL_SCRIPT' && !(newJobData.handlerName || '').trim())
    || (newJobData.type === 'SHELL_COMMAND' && !(newJobData.command || '').trim());
  const isEditJobDisabled =
    loading
    || !(editJobDialog.jobData.name || '').trim()
    || (editJobDialog.jobData.type === 'SQL_SP' && !(editJobDialog.jobData.procedureName || '').trim())
    || (editJobDialog.jobData.type === 'INTERNAL_SCRIPT' && !(editJobDialog.jobData.handlerName || '').trim())
    || (editJobDialog.jobData.type === 'SHELL_COMMAND' && !(editJobDialog.jobData.command || '').trim());
  const fetchJobExecutions = useCallback(async () => {
    await monitoringQuery.refetch();
  }, [monitoringQuery]);

  useEffect(() => {
    if (!canViewJobs) {
      setJobExecutions([]);
      setJobDefinitions([]);
      setSystemMetrics(null);
      setError('You do not have permission to view job monitoring.');
      return;
    }

    if (!monitoringQuery.data) return;

    const executions = monitoringQuery.data.executions || [];
    const definitions = monitoringQuery.data.definitions || [];
    const metrics = monitoringQuery.data.metrics || {};

    const mapped: JobExecution[] = executions.map((execution: any) => mapExecutionFromApi(execution));
    const latestExecutionByDefinition = new Map<string, JobExecution>();
    for (const execution of mapped) {
      if (!execution.jobId || execution.jobId === execution.id) continue;
      if (!latestExecutionByDefinition.has(execution.jobId)) {
        latestExecutionByDefinition.set(execution.jobId, execution);
      }
    }

    const mappedDefinitions: JobDefinition[] = definitions.map((definition: any) => {
      const latestExecution = latestExecutionByDefinition.get(definition.id);

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description || '',
        type: definition.type || definition.jobType || 'UNKNOWN',
        isEnabled: Boolean(definition.isEnabled),
        scheduleExpression: definition.scheduleExpression || definition.cronExpression || '',
        parameters: definition.parameters || definition.defaultParameters || {},
        maxRetries: Number(definition.maxRetries ?? 0),
        timeout: Number(definition.timeout ?? 3600),
        priority: definition.priority || 'NORMAL',
        createdBy: definition.createdBy || '',
        lastModified: definition.updatedAt || definition.lastModified || definition.createdAt || new Date().toISOString(),
        nextRunTime: definition.nextRunTime || undefined,
        lastRunStatus: definition.lastRunStatus
          ? toUiStatus(definition.lastRunStatus)
          : latestExecution
            ? toUiStatus(latestExecution.status)
            : undefined,
        lastRunTime: definition.lastRunTime || latestExecution?.startTime || undefined,
      };
    });

    setJobExecutions(mapped);
    setJobDefinitions((prev) => {
      const prevById = new Map(prev.map((job) => [job.id, job]));

      return mappedDefinitions.map((job) => {
        const previous = prevById.get(job.id);
        return {
          ...job,
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
    setError(null);
  }, [canViewJobs, monitoringQuery.data]);

  useEffect(() => {
    if (monitoringQuery.error) {
      console.error('Error fetching job data:', monitoringQuery.error);
      setError(getErrorMessage(monitoringQuery.error, 'Failed to fetch job data. Please try again.'));
    }
  }, [monitoringQuery.error]);

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
    void fetchJobExecutions();
  };

  const handleViewJobDetails = (job: JobExecution) => {
    setJobDetailsDialog({
      open: true,
      job
    });
  };

  useEffect(() => {
    if (!runtimeQuery.data) return;

    const runtime = runtimeQuery.data;
    const executionId = jobDetailsDialog.job?.id;
    if (!executionId) return;

    setJobExecutions((prev) =>
      prev.map((job) => (job.id === executionId ? { ...job, runtime } : job))
    );

    setJobDetailsDialog((prev) => {
      if (!prev.job || prev.job.id !== executionId) return prev;
      return {
        ...prev,
        job: {
          ...prev.job,
          runtime,
        },
      };
    });
  }, [jobDetailsDialog.job?.id, runtimeQuery.data]);

  useEffect(() => {
    if (!runtimeQuery.error) return;
    const statusCode = getHttpStatus(runtimeQuery.error);
    if (statusCode === 403 || statusCode === 404) return;
    console.error('Failed to fetch runtime diagnostics:', runtimeQuery.error);
  }, [runtimeQuery.error]);

  const handleJobControl = async (job: JobExecution, action: 'start' | 'pause' | 'stop' | 'restart') => {
    setJobControlDialog({
      open: true,
      job,
      action
    });
  };

  const handleJobAction = async (jobId: string, action: 'start' | 'pause' | 'stop' | 'restart') => {
    if (action === 'start') {
      if (!canRunJobs) {
        setError('You do not have permission to run jobs.');
        return;
      }

      try {
        setActionLoading(true);
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
        const statusCode = getHttpStatus(error);
        const payload = getHttpPayload(error);

        if (statusCode === 409 && payload) {
          const activeExecutionId = typeof payload.activeExecutionId === 'string'
            ? payload.activeExecutionId
            : undefined;
          setError(getErrorMessage(error, 'Job is already running.'));

          if (activeExecutionId) {
            const existing = jobExecutions.find((execution) => execution.id === activeExecutionId);
            if (existing) {
              setJobDetailsDialog({ open: true, job: existing });
            } else {
              try {
                const executionRecord = await bankingAPI.jobs.getExecution(activeExecutionId);
                if (executionRecord) {
                  setJobDetailsDialog({ open: true, job: mapExecutionFromApi(executionRecord) });
                }
              } catch (detailsError) {
                console.error('Failed to load active execution details:', detailsError);
              }
            }
            await fetchJobExecutions();
          }
        } else {
          if (statusCode === 403) {
            setError('You do not have permission to run jobs.');
            return;
          }
          console.error('Run job error:', error);
          setError(getErrorMessage(error, 'Failed to start job execution.'));
        }
      } finally {
        setActionLoading(false);
      }
    } else {
      if (!canControlJobs) {
        setError('You do not have permission to control jobs.');
        return;
      }

      // For existing executions
      const execution = jobExecutions.find(e => e.id === jobId);
      if (execution) {
        handleJobControl(execution, action);
      }
    }
  };

  const executeJobControl = async () => {
    if (!jobControlDialog.job || !jobControlDialog.action) return;

    if (jobControlDialog.action === 'start' || jobControlDialog.action === 'restart') {
      if (!canRunJobs) {
        setError('You do not have permission to run jobs.');
        return;
      }
    } else if (!canControlJobs) {
      setError('You do not have permission to control jobs.');
      return;
    }

    try {
      if (jobControlDialog.action === 'start' || jobControlDialog.action === 'restart') {
        await bankingAPI.jobs.runJob(jobControlDialog.job.jobId || jobControlDialog.job.id);
      } else if (jobControlDialog.action === 'stop' || jobControlDialog.action === 'pause') {
        await bankingAPI.jobs.controlJob(jobControlDialog.job.id, jobControlDialog.action);
      }

      setJobControlDialog({ open: false, job: null, action: null });
      await fetchJobExecutions();
    } catch (error) {
      const statusCode = getHttpStatus(error);
      if (statusCode === 403) {
        setError('You do not have permission to control this job.');
        return;
      }
      console.error('Job control error:', error);
      setError(getErrorMessage(error, 'Failed to control job. Please try again.'));
    }
  };

  const mapJobDefinitionToForm = (job: JobDefinition): CreateJobForm => {
    const parameters = job.parameters && typeof job.parameters === 'object' ? job.parameters : {};
    const type = SUPPORTED_JOB_TYPE_OPTIONS.some((option) => option.value === job.type)
      ? job.type as SupportedJobType
      : 'SQL_SP';

    return {
      name: job.name,
      description: job.description || '',
      type,
      parameters: { ...parameters },
      priority: job.priority || 'NORMAL',
      maxRetries: job.maxRetries,
      timeout: job.timeout,
      isEnabled: job.isEnabled,
      scheduleExpression: job.scheduleExpression || '',
      targetDatabase: parameters.targetDatabase === 'LEGACY' ? 'LEGACY' : 'TENANT',
      schemaName: typeof parameters.schemaName === 'string' ? parameters.schemaName : '',
      procedureName: typeof parameters.procedureName === 'string' ? parameters.procedureName : '',
      handlerName: typeof parameters.handlerName === 'string' ? parameters.handlerName : '',
      command: typeof parameters.command === 'string' ? parameters.command : '',
    };
  };

  const handleEditJobDefinition = (job: JobDefinition) => {
    if (!canEditJobDefinitions) {
      setError('You do not have permission to edit job definitions.');
      return;
    }

    setEditJobDialog({
      open: true,
      jobId: job.id,
      jobData: mapJobDefinitionToForm(job),
    });
  };

  const handleUpdateJobDefinition = async () => {
    if (!canEditJobDefinitions) {
      setError('You do not have permission to edit job definitions.');
      return;
    }

    if (!editJobDialog.jobId) return;

    try {
      if (!validateJobDefinitionForm(editJobDialog.jobData)) return;

      setActionLoading(true);
      const payload = buildJobDefinitionPayload(editJobDialog.jobData);
      await bankingAPI.jobs.updateDefinition(editJobDialog.jobId, payload);
      setEditJobDialog({ open: false, jobId: null, jobData: DEFAULT_NEW_JOB_DATA });
      await fetchJobExecutions();
    } catch (error) {
      const statusCode = getHttpStatus(error);
      if (statusCode === 403) {
        setError('You do not have permission to edit job definitions.');
        return;
      }
      console.error('Update job definition error:', error);
      setError(getErrorMessage(error, 'Failed to update job definition. Please check your inputs.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteJobDefinition = async () => {
    if (!canDeleteJobDefinitions) {
      setError('You do not have permission to delete job definitions.');
      return;
    }

    const job = deleteJobDialog.job;
    if (!job) return;

    try {
      setActionLoading(true);
      await bankingAPI.jobs.deleteDefinition(job.id);
      setDeleteJobDialog({ open: false, job: null });
      setJobDefinitions((prev) => prev.filter((definition) => definition.id !== job.id));
      await fetchJobExecutions();
    } catch (error) {
      const statusCode = getHttpStatus(error);
      if (statusCode === 403) {
        setError('You do not have permission to delete job definitions.');
        return;
      }
      console.error('Delete job definition error:', error);
      setError(getErrorMessage(error, 'Failed to delete job definition.'));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleJobDefinition = async (jobId: string, enabled: boolean) => {
    if (!canControlJobs) {
      setError('You do not have permission to control jobs.');
      return;
    }

    try {
      await bankingAPI.jobs.toggleJob(jobId);

      setJobDefinitions(prev =>
        prev.map(job =>
          job.id === jobId ? { ...job, isEnabled: enabled } : job
        )
      );
    } catch (error) {
      const statusCode = getHttpStatus(error);
      if (statusCode === 403) {
        setError('You do not have permission to toggle job definitions.');
        return;
      }
      console.error('Toggle job error:', error);
      setError(getErrorMessage(error, 'Failed to toggle job. Please try again.'));
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

  const formatDateTime = (value: string) => format(parseISO(value), 'MMM dd, yyyy HH:mm:ss');
  const formatNextRun = (value?: string) => (value ? format(parseISO(value), 'MMM dd, yyyy HH:mm') : 'Not scheduled');

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
          {canCreateJobs && (
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
          )}
          {canCreateJobs && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ScriptIcon />}
              onClick={handleOpenCreateLegacyIfrs9Job}
            >
              Quick Add IFRS9 Legacy Job
            </Button>
          )}

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
      <JobSystemMetricsPanel
        metrics={systemMetrics}
        mode="summary"
        formatDuration={formatDuration}
        themePalette={{
          info: theme.palette.info.main,
          warning: theme.palette.warning.main,
          success: theme.palette.success.main,
          error: theme.palette.error.main,
          primary: theme.palette.primary.main,
        }}
      />

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
        <ActiveJobsPanel
          loading={loading}
          filters={filters}
          filteredJobs={filteredJobs}
          totalJobs={jobExecutions.length}
          statusTab={statusTab}
          statusCounts={statusCounts}
          canControlJobs={canControlJobs}
          onStatusTabChange={handleStatusTabChange}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onViewDetails={handleViewJobDetails}
          onJobControl={handleJobControl}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          getJobTypeIcon={getJobTypeIcon}
          formatDuration={formatDuration}
          supportedJobTypeOptions={SUPPORTED_JOB_TYPE_OPTIONS}
          lastUpdatedLabel={format(new Date(), 'MMM dd, yyyy HH:mm')}
        />
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
        <JobDefinitionsPanel
          jobs={jobDefinitions}
          loading={loading}
          canControlJobs={canControlJobs}
          canRunJobs={canRunJobs}
          canEditJobs={canEditJobDefinitions}
          canDeleteJobs={canDeleteJobDefinitions}
          onToggle={toggleJobDefinition}
          onRunNow={(jobId) => handleJobAction(jobId, 'start')}
          onEdit={handleEditJobDefinition}
          onDelete={(job) => setDeleteJobDialog({ open: true, job })}
          getStatusColor={getStatusColor}
          formatNextRun={formatNextRun}
        />
      </TabPanel>

      {/* System Performance Tab */}
      <TabPanel value={currentTab} index={3}>
        <JobSystemMetricsPanel
          metrics={systemMetrics}
          mode="performance"
          formatDuration={formatDuration}
          themePalette={{
            info: theme.palette.info.main,
            warning: theme.palette.warning.main,
            success: theme.palette.success.main,
            error: theme.palette.error.main,
            primary: theme.palette.primary.main,
          }}
        />
      </TabPanel>
      <CreateJobDefinitionDialog
        open={createJobDialogOpen}
        loading={loading}
        jobData={newJobData}
        supportedJobTypeOptions={SUPPORTED_JOB_TYPE_OPTIONS}
        disabled={isCreateJobDisabled}
        onClose={() => setCreateJobDialogOpen(false)}
        onSubmit={handleCreateJob}
        onChange={setNewJobData}
      />
      <CreateJobDefinitionDialog
        open={editJobDialog.open}
        loading={loading}
        jobData={editJobDialog.jobData}
        supportedJobTypeOptions={SUPPORTED_JOB_TYPE_OPTIONS}
        disabled={isEditJobDisabled}
        title="Edit Job Definition"
        submitLabel="Save Changes"
        onClose={() => setEditJobDialog({ open: false, jobId: null, jobData: DEFAULT_NEW_JOB_DATA })}
        onSubmit={handleUpdateJobDefinition}
        onChange={(updater) => {
          setEditJobDialog((prev) => ({
            ...prev,
            jobData: typeof updater === 'function' ? updater(prev.jobData) : updater,
          }));
        }}
      />

      <Dialog
        open={deleteJobDialog.open}
        onClose={() => setDeleteJobDialog({ open: false, job: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Job Definition</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete {deleteJobDialog.job?.name ? `"${deleteJobDialog.job.name}"` : 'this job definition'}? Existing execution history will remain available, but the definition can no longer be run.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteJobDialog({ open: false, job: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteJobDefinition}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <JobExecutionDetailsDialog
        open={jobDetailsDialog.open}
        job={jobDetailsDialog.job}
        canViewRuntime={canViewRuntime}
        onClose={() => setJobDetailsDialog({ open: false, job: null })}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        formatDateTime={formatDateTime}
        formatDuration={formatDuration}
      />

      <JobControlConfirmDialog
        open={jobControlDialog.open}
        job={jobControlDialog.job}
        action={jobControlDialog.action}
        onClose={() => setJobControlDialog({ open: false, job: null, action: null })}
        onConfirm={executeJobControl}
      />
    </Box>
  );
};
