import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eclConfigurationsApi } from '@/services/api/ecl-configurations.api';

export function useECLConfigsQuery() {
  return useQuery({
    queryKey: ['ecl-config'],
    queryFn: () => eclConfigurationsApi.getAll(),
    staleTime: 15000,
  });
}

export function useCreateECLConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eclConfigurationsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ecl-config'] }),
  });
}

export function useUpdateECLConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => eclConfigurationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ecl-config'] }),
  });
}

export function useDeleteECLConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => eclConfigurationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ecl-config'] }),
  });
}
