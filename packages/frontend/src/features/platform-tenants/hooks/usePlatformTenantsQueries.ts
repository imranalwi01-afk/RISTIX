'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  createPlatformTenant,
  deletePlatformTenant,
  disablePlatformTenant,
  enablePlatformTenant,
  fetchPlatformTenants,
  updatePlatformTenant,
  type PlatformTenantsListParams,
} from '../api/platform-tenants.api';

export function usePlatformTenantsQuery(params: PlatformTenantsListParams, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('platform-tenants', params),
    queryFn: async () => {
      const response = await fetchPlatformTenants(params);
      const responseData = (response as any)?.data;
      const rows = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.tenants)
          ? responseData.tenants
          : [];
      const totalRaw = (response as any)?.total ?? responseData?.total ?? rows.length;
      return {
        rows,
        total: Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : rows.length,
      };
    },
    enabled,
  });
}

function usePlatformTenantsInvalidatingMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'platform-tenants');
    },
  });
}

export function useCreatePlatformTenantMutation() {
  return usePlatformTenantsInvalidatingMutation<Record<string, unknown>>(createPlatformTenant);
}

export function useUpdatePlatformTenantMutation() {
  return usePlatformTenantsInvalidatingMutation<{ id: string; input: Record<string, unknown> }>(({ id, input }) =>
    updatePlatformTenant(id, input),
  );
}

export function useDeletePlatformTenantMutation() {
  return usePlatformTenantsInvalidatingMutation<string>(deletePlatformTenant);
}

export function useTogglePlatformTenantMutation() {
  return usePlatformTenantsInvalidatingMutation<{ id: string; isActive: boolean }>(({ id, isActive }) =>
    isActive ? disablePlatformTenant(id) : enablePlatformTenant(id),
  );
}
