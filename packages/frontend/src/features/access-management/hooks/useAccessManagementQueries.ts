'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  createAccessRole,
  deleteAccessRole,
  fetchAccessManagementRoles,
  toggleAccessRole,
  updateAccessRole,
  updateAccessRolePermissions,
  type AccessManagementFilters,
} from '../api/access-management.api';
import { toAccessManagementData } from '../domain/access-management.models';

export function useAccessManagementDataQuery(filters: AccessManagementFilters, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('access-management-data', filters),
    queryFn: async () => {
      const responses = await fetchAccessManagementRoles(filters);
      return toAccessManagementData(responses);
    },
    enabled,
  });
}

function useInvalidatingMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    retry: false,
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'access-management-data');
    },
  });
}

export function useCreateAccessRoleMutation() {
  return useInvalidatingMutation<Record<string, unknown>>(createAccessRole);
}

export function useUpdateAccessRoleMutation() {
  return useInvalidatingMutation<{ roleId: string; input: Record<string, unknown> }>(({ roleId, input }) =>
    updateAccessRole(roleId, input),
  );
}

export function useToggleAccessRoleMutation() {
  return useInvalidatingMutation<string>(toggleAccessRole);
}

export function useDeleteAccessRoleMutation() {
  return useInvalidatingMutation<string>(deleteAccessRole);
}

export function useUpdateAccessRolePermissionsMutation() {
  return useInvalidatingMutation<{ roleId: string; permissions: string[] }>(({ roleId, permissions }) =>
    updateAccessRolePermissions(roleId, permissions),
  );
}
