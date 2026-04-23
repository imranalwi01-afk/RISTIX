'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import {
  fetchJobDefinitions,
  fetchJobExecutionRuntime,
  fetchJobExecutions,
  fetchJobMetrics,
} from '../api/job-monitoring.api';

export function useJobMonitoringQuery(options?: { enabled?: boolean; autoRefresh?: boolean }) {
  return useQuery({
    queryKey: businessQueryKeys.feature('job-monitoring'),
    queryFn: async () => {
      const [executions, definitions, metrics] = await Promise.all([
        fetchJobExecutions(),
        fetchJobDefinitions(),
        fetchJobMetrics(),
      ]);

      return {
        executions,
        definitions,
        metrics,
      };
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    refetchInterval: options?.autoRefresh ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useJobExecutionRuntimeQuery(executionId: string | null, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.detail('job-monitoring-runtime', executionId ?? 'none'),
    queryFn: async () => fetchJobExecutionRuntime(executionId!),
    enabled: enabled && Boolean(executionId),
    staleTime: 10 * 1000,
  });
}
