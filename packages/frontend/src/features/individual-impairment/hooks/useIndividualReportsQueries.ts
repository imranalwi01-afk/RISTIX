'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchIndividualReportAssessmentList, fetchIndividualReportHistory } from '../api/individual-impairment.api';
import { toAssessmentWatchlist, toIndividualReportHistoryRows } from '../domain/individual-impairment.models';

export function useIndividualReportHistoryQuery(enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('individual-report-history'),
    queryFn: async () => {
      const response = await fetchIndividualReportHistory();
      return toIndividualReportHistoryRows(response?.data);
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useIndividualReportAssessmentListQuery(
  params: {
    page: number;
    limit: number;
    search?: string;
    mode: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: businessQueryKeys.list('individual-report-assessment-list', params),
    queryFn: async () => {
      const response = await fetchIndividualReportAssessmentList(params);
      const rows = toAssessmentWatchlist(response?.data);
      return {
        rows,
        total: Number(response?.meta?.total ?? response?.pagination?.total ?? rows.length),
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
