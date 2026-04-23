'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import { fetchMenuConfigurations, saveMenuConfiguration } from '../api/menu-admin.api';
import type { MenuConfigurationRequest } from '@/services/api/menu.api';

export function useMenuConfigurationsQuery(enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('menu-admin-configurations'),
    queryFn: async () => {
      const response = await fetchMenuConfigurations();
      return response.data.configurations ?? [];
    },
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSaveMenuConfigurationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MenuConfigurationRequest) => saveMenuConfiguration(input),
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'menu-admin-configurations');
    },
  });
}
