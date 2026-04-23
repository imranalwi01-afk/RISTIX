'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import {
  fetchAssessmentAccountBySearch,
  fetchAssessmentSummary,
  fetchAssessmentWatchlist,
  type AssessmentWatchlistFilters,
} from '../api/individual-impairment.api';
import { toAssessmentSummary, toAssessmentWatchlist } from '../domain/individual-impairment.models';

export function useAssessmentWatchlistQuery(params: AssessmentWatchlistFilters, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('individual-assessment-watchlist', params),
    queryFn: async () => {
      const response = await fetchAssessmentWatchlist(params);
      return {
        rows: toAssessmentWatchlist(response.data),
        total: Number(response.meta?.total ?? 0),
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useAssessmentSummaryQuery(downloadDate: string | undefined, mode: string, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.stats('individual-assessment-summary', { downloadDate, mode }),
    queryFn: async () => {
      const response = await fetchAssessmentSummary(downloadDate, mode);
      return toAssessmentSummary((response?.data ?? undefined) as Record<string, unknown> | undefined);
    },
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useAssessmentAccountLookupQuery(accountId: string | null, accountNumber: string | null, mode: string, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.detail('individual-assessment-account', accountId ?? 'none', { accountNumber, mode }),
    queryFn: async () => fetchAssessmentAccountBySearch(accountId ?? '', accountNumber ?? '', mode),
    enabled: enabled && Boolean(accountId) && Boolean(accountNumber),
  });
}
