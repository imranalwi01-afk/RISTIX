'use client';

import { useQuery } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { fetchAdminTenants } from '../api/tenant-context.api';

export function useTenantContextQuery(enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('tenant-context-options'),
    queryFn: async () => {
      const response = await fetchAdminTenants();
      const tenants = Array.isArray(response?.data?.tenants) ? response.data.tenants : [];
      return tenants;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
