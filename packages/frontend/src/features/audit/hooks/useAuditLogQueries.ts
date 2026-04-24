'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { normalizeQueryError } from '@/features/shared/query/query-errors';
import { fetchAuditLogs, fetchAuditStats, type AuditLogsQueryParams } from '../api/audit.api';
import { toAuditLogViewModels, toAuditStatsViewModel } from '../domain/audit.models';

export function useAuditLogsQuery(params: AuditLogsQueryParams) {
  return useQuery({
    queryKey: businessQueryKeys.list('audit-logs', params),
    queryFn: async () => {
      const response = await fetchAuditLogs(params);
      return {
        logs: toAuditLogViewModels(response.data),
        total: Number(response.pagination?.total ?? response.data?.length ?? 0),
      };
    },
    placeholderData: keepPreviousData,
    meta: {
      normalizedErrorMessage: 'Failed to load audit logs.',
    },
  });
}

export function useAuditStatsQuery(params: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: businessQueryKeys.stats('audit-logs', params),
    queryFn: async () => toAuditStatsViewModel(await fetchAuditStats(params)),
    staleTime: 60 * 1000,
    meta: {
      normalizedErrorMessage: 'Failed to load audit statistics.',
    },
  });
}

export function getAuditQueryErrorMessage(error: unknown, fallbackMessage: string) {
  return normalizeQueryError(error, fallbackMessage).message;
}
