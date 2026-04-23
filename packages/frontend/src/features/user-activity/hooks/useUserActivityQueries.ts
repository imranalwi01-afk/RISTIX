'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchUserActivities, fetchUserActivityStatistics, type UserActivityQueryInput } from '../api/user-activity.api';
import { toUserActivityRows, toUserActivityStatistics } from '../domain/user-activity.models';

export function useUserActivitiesQuery(filters: UserActivityQueryInput, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('user-activity', filters),
    queryFn: async () => {
      const response = await fetchUserActivities(filters);
      return {
        rows: toUserActivityRows(response.activities),
        statistics: toUserActivityStatistics(response.statistics),
        pagination: response.pagination,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useUserActivityStatisticsQuery(filters: Partial<UserActivityQueryInput>, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.stats('user-activity', filters),
    queryFn: async () => toUserActivityStatistics(await fetchUserActivityStatistics(filters)),
    enabled,
    staleTime: 60 * 1000,
  });
}
