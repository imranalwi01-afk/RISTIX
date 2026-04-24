'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import type { BaseIfrs9ReportProps, ReportFilters } from '@/components/ifrs9/BaseIfrs9Report';
import type { EnterpriseTableQueryParams } from '@/types/enterprise-table';
import { fetchIfrs9Report } from '../api/ifrs9-reports.api';

export function useIfrs9ReportQuery(input: {
  reportType: BaseIfrs9ReportProps['reportType'];
  filters: ReportFilters;
  requiredParams: string[];
  supportsPagination: boolean;
  queryParams: EnterpriseTableQueryParams;
  deferredSearchTerm: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: businessQueryKeys.list(`ifrs9-report:${input.reportType}`, {
      filters: input.filters,
      queryParams: input.queryParams,
      search: input.deferredSearchTerm,
    }),
    queryFn: async () => fetchIfrs9Report(input),
    enabled: input.enabled,
    placeholderData: keepPreviousData,
  });
}
