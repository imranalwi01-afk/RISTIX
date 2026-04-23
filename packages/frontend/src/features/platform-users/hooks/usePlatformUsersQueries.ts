'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  createPlatformUser,
  deletePlatformUser,
  fetchPlatformUsers,
  updatePlatformUser,
  type PlatformUsersListParams,
} from '../api/platform-users.api';

export function usePlatformUsersQuery(params: PlatformUsersListParams, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('platform-users', params),
    queryFn: async () => {
      const response = await fetchPlatformUsers(params);
      const responseData = (response as any)?.data;
      const rows = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.users)
          ? responseData.users
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

function usePlatformUsersInvalidatingMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'platform-users');
    },
  });
}

export function useCreatePlatformUserMutation() {
  return usePlatformUsersInvalidatingMutation<Record<string, unknown>>(createPlatformUser);
}

export function useUpdatePlatformUserMutation() {
  return usePlatformUsersInvalidatingMutation<{ id: string; input: Record<string, unknown> }>(({ id, input }) =>
    updatePlatformUser(id, input),
  );
}

export function useDeletePlatformUserMutation() {
  return usePlatformUsersInvalidatingMutation<string>(deletePlatformUser);
}
