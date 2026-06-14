import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eadConfigurationsApi } from '@/services/api/ead-configurations.api';

export function useEADConfigsQuery(params?: any) {
  return useQuery({
    queryKey: ['ead-config', params],
    queryFn: () => eadConfigurationsApi.getAll(params),
    staleTime: 15000,
  });
}

export function useCreateEADConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eadConfigurationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ead-config'] }),
  });
}

export function useUpdateEADConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => eadConfigurationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ead-config'] }),
  });
}

export function useDeleteEADConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eadConfigurationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ead-config'] }),
  });
}
