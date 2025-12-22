// packages/backend/src/config/workflow/workflow.config.ts

export interface WorkflowEngineConfig {
  maxConcurrentProcesses: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableParallelProcessing: boolean;
  performanceMetrics: boolean;
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  scheduling: {
    enableCronJobs: boolean;
    defaultCronPattern: string;
    maxScheduledJobs: number;
  };
  sla: {
    defaultSlaHours: number;
    escalationEnabled: boolean;
    notificationChannels: string[];
  };
}

export const workflowConfig: WorkflowEngineConfig = {
  maxConcurrentProcesses: parseInt(process.env.WORKFLOW_MAX_CONCURRENT || '50'),
  defaultTimeout: parseInt(process.env.WORKFLOW_DEFAULT_TIMEOUT || '300000'), // 5 minutes
  retryAttempts: parseInt(process.env.WORKFLOW_RETRY_ATTEMPTS || '3'),
  enableParallelProcessing: process.env.WORKFLOW_PARALLEL_PROCESSING === 'true',
  performanceMetrics: process.env.WORKFLOW_PERFORMANCE_METRICS !== 'false',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '1234567890',
    db: parseInt(process.env.REDIS_WORKFLOW_DB || '1')
  },
  scheduling: {
    enableCronJobs: process.env.WORKFLOW_CRON_ENABLED !== 'false',
    defaultCronPattern: process.env.WORKFLOW_DEFAULT_CRON || '0 9 * * *', // 9 AM daily
    maxScheduledJobs: parseInt(process.env.WORKFLOW_MAX_SCHEDULED || '100')
  },
  sla: {
    defaultSlaHours: parseInt(process.env.WORKFLOW_DEFAULT_SLA_HOURS || '24'),
    escalationEnabled: process.env.WORKFLOW_ESCALATION_ENABLED !== 'false',
    notificationChannels: ['email', 'slack']
  }
};

