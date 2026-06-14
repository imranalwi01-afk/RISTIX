import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api-setup';

export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const r = await apiClient.get('/users/profile');
      return r.data?.data || r.data || null;
    },
    enabled: !!userId, staleTime: 30000,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const r = await apiClient.put('/users/profile', data);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useUserActivitiesQuery(userId?: string) {
  return useQuery({
    queryKey: ['activities', userId],
    queryFn: async () => {
      const r = await apiClient.get('/audit/activity', { params: { userId } });
      return r.data?.data || r.data || [];
    },
    enabled: !!userId, staleTime: 10000,
  });
}

