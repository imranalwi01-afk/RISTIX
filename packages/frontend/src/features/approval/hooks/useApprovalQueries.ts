'use client';

import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchApprovalMatrices, fetchApprovalRequestHistory, fetchApprovalRouting, type ApprovalRequestQueryInput } from '../api/approval.api';
import { transformApprovalRequest } from '../domain/approval.models';

export function useApprovalRequestsQuery(params: ApprovalRequestQueryInput) {
  return useQuery({
    queryKey: businessQueryKeys.list('approval-requests', params),
    queryFn: async () => {
      const response = await fetchApprovalRequestHistory(params);
      const requestRows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.requests)
            ? response.requests
            : [];

      return {
        rows: requestRows.map(transformApprovalRequest),
        total: Number(response?.pagination?.total ?? requestRows.length),
        filterDefinitions: response?.filterDefinitions ?? {},
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useApprovalUniverseQuery(params: Omit<ApprovalRequestQueryInput, 'page' | 'columnFilters' | 'sort'> & { enabled?: boolean }) {
  return useQuery({
    queryKey: businessQueryKeys.meta('approval-requests', 'universe', params),
    queryFn: async () => {
      const pageSize = 200;
      let page = 1;
      let total = 0;
      const rows: ReturnType<typeof transformApprovalRequest>[] = [];

      do {
        const response = await fetchApprovalRequestHistory({
          ...params,
          page,
          limit: pageSize,
        });

        const chunk = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        rows.push(...chunk.map(transformApprovalRequest));
        total = Number(response?.pagination?.total ?? chunk.length);
        if (chunk.length === 0) break;
        page += 1;
      } while (rows.length < total);

      return rows;
    },
    enabled: params.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

export function useApprovalMatricesQuery() {
  return useQuery({
    queryKey: businessQueryKeys.meta('approval', 'matrices'),
    queryFn: async () => {
      const response = await fetchApprovalMatrices();
      return Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.matrices)
            ? response.matrices
            : [];
    },
  });
}

export function useApprovalRoutingQuery(params: {
  entityType?: string;
  operation?: 'create' | 'update' | 'delete';
  department?: string;
}) {
  return useQuery({
    queryKey: businessQueryKeys.meta('approval', 'routing', params),
    queryFn: async () => {
      const response = await fetchApprovalRouting(params);
      return Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
    },
    placeholderData: keepPreviousData,
  });
}

export function useApprovalStatistics(requests: Array<{ status: string; priority?: string; expiresAt?: string; completedAt?: string; requestedAt: string; currentLevel?: number; requestType?: string }>) {
  return useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((request) => request.status === 'pending').length;
    const approved = requests.filter((request) => request.status === 'approved').length;
    const rejected = requests.filter((request) => request.status === 'rejected').length;
    const overdue = requests.filter((request) => request.expiresAt && new Date(request.expiresAt) < new Date() && request.status === 'pending').length;
    const infoRequested = requests.filter((request) => request.status === 'info_requested').length;
    const delegated = requests.filter((request) => request.status === 'delegated').length;
    const criticalPending = requests.filter((request) => request.status === 'pending' && request.priority === 'critical').length;

    const completedRequests = requests.filter(
      (request) => request.completedAt && ['approved', 'rejected', 'completed', 'cancelled'].includes(request.status),
    );
    const totalApprovalTimeMs = completedRequests.reduce((sum, request) => {
      const startedAt = new Date(request.requestedAt).getTime();
      const completedAt = request.completedAt ? new Date(request.completedAt).getTime() : startedAt;
      if (Number.isNaN(startedAt) || Number.isNaN(completedAt) || completedAt < startedAt) return sum;
      return sum + (completedAt - startedAt);
    }, 0);
    const avgTime = completedRequests.length > 0
      ? Number((totalApprovalTimeMs / completedRequests.length / (1000 * 60 * 60 * 24)).toFixed(1))
      : 0;

    const pendingByLevel = Array.from(
      requests
        .filter((request) => request.status === 'pending' && typeof request.currentLevel === 'number')
        .reduce((map, request) => {
          const level = request.currentLevel as number;
          map.set(level, (map.get(level) || 0) + 1);
          return map;
        }, new Map<number, number>())
        .entries(),
    )
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => a.level - b.level);

    const byRequestType = Array.from(
      requests.reduce((map, request) => {
        const key = request.requestType || 'unknown';
        map.set(key, (map.get(key) || 0) + 1);
        return map;
      }, new Map<string, number>()).entries(),
    )
      .map(([requestType, count]) => ({ requestType, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      averageApprovalTime: avgTime,
      overdueRequests: overdue,
      infoRequestedRequests: infoRequested,
      delegatedRequests: delegated,
      criticalPendingRequests: criticalPending,
      uniqueRequestTypes: byRequestType.length,
      pendingByLevel,
      byRequestType,
    };
  }, [requests]);
}
