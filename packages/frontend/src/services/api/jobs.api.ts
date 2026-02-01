import { apiClient } from '../api-client';

export interface JobDefinition {
  id: string;
  name: string;
  description?: string;
  type: string;
  scheduleExpression?: string;
  isEnabled: boolean;
  parameters?: any;
  maxRetries: number;
  timeout: number;
  priority: string;
  lastRunTime?: string;
  lastRunStatus?: string;
  nextRunTime?: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  jobName?: string; // Often joined from definition
  jobType?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PENDING' | 'PAUSED' | 'CANCELLED';
  startTime: string;
  endTime?: string;
  progress: number;
  resultSummary?: any;
  errorMessage?: string;
  resourceUsage?: {
    cpuUsage?: number;
    memoryUsage?: number;
    diskUsage?: number;
  };
  triggeredBy?: string;
  triggerType?: string;
}

export interface JobMetrics {
  activeJobs: number;
  failedToday: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}

export const jobsAPI = {
  getDefinitions: async (): Promise<JobDefinition[]> => {
    const response = await apiClient.get('/jobs/definitions');
    return response.data;
  },

  getExecutions: async (): Promise<JobExecution[]> => {
    const response = await apiClient.get('/jobs/executions');
    return response.data;
  },

  getMetrics: async (): Promise<JobMetrics> => {
    const response = await apiClient.get('/jobs/metrics');
    return response.data;
  },

  runJob: async (id: string): Promise<JobExecution> => {
    const response = await apiClient.post(`/jobs/${id}/run`);
    return response.data;
  },

  controlJob: async (id: string, action: 'stop' | 'pause' | 'resume'): Promise<JobExecution> => {
    const response = await apiClient.post(`/jobs/executions/${id}/control`, { action });
    return response.data;
  },

  toggleJob: async (id: string, isEnabled: boolean): Promise<JobDefinition> => {
    const response = await apiClient.patch(`/jobs/definitions/${id}`, { isEnabled });
    return response.data;
  },

  createDefinition: async (data: Partial<JobDefinition>): Promise<JobDefinition> => {
    const response = await apiClient.post('/jobs/definitions', data);
    return response.data;
  },
};
