'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  createStandaloneWatchlistEntry,
  fetchStandaloneWatchlist,
  removeStandaloneWatchlistEntry,
  type StandaloneWatchlistFilters,
  type WatchlistCreateInput,
} from '../api/individual-impairment.api';
import { toStandaloneWatchlistRows } from '../domain/individual-impairment.models';

export function useStandaloneWatchlistQuery(params: StandaloneWatchlistFilters, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('individual-watchlist', params),
    queryFn: async () => {
      const response = await fetchStandaloneWatchlist(params);
      const rows = toStandaloneWatchlistRows(response?.data);
      return {
        rows,
        total: Number(response?.pagination?.total ?? rows.length),
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: WatchlistCreateInput) => createStandaloneWatchlistEntry(input),
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'individual-watchlist');
    },
  });
}

export function useRemoveWatchlistMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => removeStandaloneWatchlistEntry(id),
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'individual-watchlist');
    },
  });
}
