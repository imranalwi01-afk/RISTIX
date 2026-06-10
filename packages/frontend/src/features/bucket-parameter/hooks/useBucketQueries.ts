import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';

export function useBucketHeadersQuery(params?: any) {
  return useQuery({
    queryKey: ['bucket', 'headers', params],
    queryFn: () => bankingAPI.bucketParameter.getHeaders(params),
    staleTime: 15000,
  });
}

export function useCreateBucketHeaderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankingAPI.bucketParameter.createHeader(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bucket'] }),
  });
}

export function useUpdateBucketHeaderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bankingAPI.bucketParameter.updateHeader(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bucket'] }),
  });
}

export function useDeleteBucketHeaderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankingAPI.bucketParameter.deleteHeader(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bucket'] }),
  });
}
