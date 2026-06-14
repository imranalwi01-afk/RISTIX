'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

const queryKeys = {
  allRoles: ['roles', 'all'] as const,
  userRoles: (userId: string) => ['roles', 'user', userId] as const,
};

export const extractRolesArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== 'object') return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.roles)) return res.roles;
  return [];
};

export function useAllRoles() {
  return useQuery({
    queryKey: queryKeys.allRoles,
    queryFn: async () => {
      const res = await api.roles.getAll({ includeInactive: true });
      return extractRolesArray(res);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.userRoles(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.roles.getUserRoles(userId);
      const rows = res?.data?.roles || res?.roles || res?.data || [];
      return (Array.isArray(rows) ? rows : []).map((row: any) => {
        const r = row?.role || row;
        return String(r?.roleId || r?.role_id || r?.id || row?.roleId || row?.role_id || '');
      }).filter(Boolean);
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 60 * 1000,
  });
}

export function useInvalidateRoleQueries() {
  const queryClient = useQueryClient();
  return {
    invalidateAllRoles: () => queryClient.invalidateQueries({ queryKey: ['roles', 'all'] }),
    invalidateUserRoles: (userId: string) => queryClient.invalidateQueries({ queryKey: ['roles', 'user', userId] }),
  };
}
