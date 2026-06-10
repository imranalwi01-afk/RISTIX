import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pdConfigurationsApi } from '@/services/api/pd-configurations.api';

export function usePDConfigsQuery(params?: any) {
  return useQuery({
    queryKey: ['pd-config', params],
    queryFn: () => pdConfigurationsApi.getAll(params),
    staleTime: 15000,
  });
}

export function useCreatePDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => pdConfigurationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pd-config'] }),
  });
}

export function useUpdatePDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => pdConfigurationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pd-config'] }),
  });
}

export function useDeletePDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pdConfigurationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pd-config'] }),
  });
}
