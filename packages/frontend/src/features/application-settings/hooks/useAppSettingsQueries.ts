import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationParameterAPI } from '@/services/api';

export function useAppSettingsHeadersQuery(params?: Parameters<typeof applicationParameterAPI.headers.getAll>[0]) {
  return useQuery({
    queryKey: ['app-settings', 'headers', params],
    queryFn: () => applicationParameterAPI.headers.getAll(params),
    staleTime: 30000,
  });
}

export function useAppSettingsHeaderQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['app-settings', 'header', id],
    queryFn: () => applicationParameterAPI.headers.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAppSettingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => applicationParameterAPI.headers.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-settings'] }),
  });
}

export function useUpdateAppSettingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => applicationParameterAPI.headers.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-settings'] }),
  });
}

export function useDeleteAppSettingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationParameterAPI.headers.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-settings'] }),
  });
}
