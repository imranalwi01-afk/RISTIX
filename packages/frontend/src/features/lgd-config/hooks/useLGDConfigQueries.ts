import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lgdConfigurationsApi } from '@/services/api/lgd-configurations.api';

export function useLGDConfigsQuery(params?: any) {
  return useQuery({
    queryKey: ['lgd-config', params],
    queryFn: () => lgdConfigurationsApi.getAll(params),
    staleTime: 15000,
  });
}

export function useCreateLGDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => lgdConfigurationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lgd-config'] }),
  });
}

export function useUpdateLGDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => lgdConfigurationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lgd-config'] }),
  });
}

export function useDeleteLGDConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lgdConfigurationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lgd-config'] }),
  });
}
