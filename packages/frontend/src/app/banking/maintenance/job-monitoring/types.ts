export type SupportedJobType = 'SQL_SP' | 'INTERNAL_SCRIPT' | 'SHELL_COMMAND';

export interface JobRuntimeSummary {
  available: boolean;
  pid?: number;
  state?: string;
  runtimeSeconds?: number;
  waitEventType?: string | null;
  waitEvent?: string | null;
  blockedByPids?: number[];
  dbSessionStart?: string | null;
  queryStart?: string | null;
  reason?: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  jobName: string;
  jobType: SupportedJobType | string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING' | 'PAUSED' | 'CANCELLED' | string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  startTime: string;
  endTime?: string;
  duration?: number;
  userId?: string;
  userName?: string;
  tenantId?: string;
  tenantName?: string;
  parameters?: any;
  resultData?: any;
  resultSummary?: any;
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
  isScheduled?: boolean;
  scheduleExpression?: string;
  retryCount?: number;
  maxRetries?: number;
  tags?: string[];
  runtime?: JobRuntimeSummary;
}

export interface JobDefinition {
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

export interface SystemMetrics {
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

export interface JobFilters {
  status?: string;
  type?: string;
  priority?: string;
  userId?: string;
  tenantId?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  searchTerm?: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface CreateJobForm {
  name: string;
  description?: string;
  type: SupportedJobType;
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
