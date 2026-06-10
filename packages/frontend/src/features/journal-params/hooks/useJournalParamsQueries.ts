import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';

export function useJournalParamsQuery(params?: any) {
  return useQuery({
    queryKey: ['journal-params', params],
    queryFn: () => bankingAPI.journalParameters.getAll(params),
    staleTime: 15000,
  });
}

export function useJournalParamQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['journal-params', id],
    queryFn: () => bankingAPI.journalParameters.getById(id!),
    enabled: id !== undefined,
  });
}

export function useCreateJournalParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankingAPI.journalParameters.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-params'] }),
  });
}

export function useUpdateJournalParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bankingAPI.journalParameters.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-params'] }),
  });
}

export function useDeleteJournalParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankingAPI.journalParameters.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal-params'] }),
  });
}

export function useGlGroupOptionsQuery() {
  return useQuery({
    queryKey: ['journal-params', 'gl-group-options'],
    queryFn: () => bankingAPI.journalParameters.getGlGroupOptions(),
    staleTime: 60000,
  });
}
