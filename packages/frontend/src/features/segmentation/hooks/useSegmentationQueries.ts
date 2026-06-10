import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';

export function useSegmentationHeadersQuery(params?: any) {
  return useQuery({
    queryKey: ['segmentation', 'headers', params],
    queryFn: () => bankingAPI.segmentation.getHeaders(params),
    staleTime: 15000,
  });
}

export function useCreateSegmentationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankingAPI.segmentation.createHeader(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['segmentation'] }),
  });
}

export function useUpdateSegmentationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bankingAPI.segmentation.updateHeader(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['segmentation'] }),
  });
}

export function useDeleteSegmentationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankingAPI.segmentation.deleteHeader(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['segmentation'] }),
  });
}
