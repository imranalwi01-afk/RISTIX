'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchIndividualCustomerList, type IndividualCustomerListFilters } from '../api/individual-impairment.api';
import { toIndividualCustomerListRows } from '../domain/individual-impairment.models';

export function useCustomerListQuery(params: IndividualCustomerListFilters, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('individual-customer-list', params),
    queryFn: async () => {
      const response = await fetchIndividualCustomerList(params);
      const rows = toIndividualCustomerListRows(response?.data);
      return {
        rows,
        total: Number(response?.pagination?.total ?? rows.length),
        nextCursor: response?.pagination?.nextCursor ?? null,
        hasNextPage: response?.pagination?.hasNextPage ?? false,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}
