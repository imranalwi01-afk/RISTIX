import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flScalarAPI } from '@/services/api/fl-scalar.api';

export function useFLScalarsQuery() {
  return useQuery({
    queryKey: ['fl-scalar'],
    queryFn: () => flScalarAPI.getAll(),
    staleTime: 15000,
  });
}

export function useCreateFLScalarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => flScalarAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fl-scalar'] }),
  });
}

export function useUpdateFLScalarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => flScalarAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fl-scalar'] }),
  });
}

export function useDeleteFLScalarMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flScalarAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fl-scalar'] }),
  });
}
