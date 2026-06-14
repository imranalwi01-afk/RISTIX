import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';

export function useProductParamsQuery(mode: string, params?: any) {
  return useQuery({
    queryKey: ['product-params', mode, params],
    queryFn: () => bankingAPI.productParameters.getAll(mode, params),
    staleTime: 15000,
  });
}

export function useProductParamQuery(prdCode: string | undefined) {
  return useQuery({
    queryKey: ['product-params', prdCode],
    queryFn: () => bankingAPI.productParameters.getById(prdCode!),
    enabled: !!prdCode,
  });
}

export function useCreateProductParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankingAPI.productParameters.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product-params'] }),
  });
}

export function useUpdateProductParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ prdCode, data }: { prdCode: string; data: any }) => bankingAPI.productParameters.update(prdCode, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product-params'] }),
  });
}

export function useDeleteProductParamMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prdCode: string) => bankingAPI.productParameters.delete(prdCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product-params'] }),
  });
}

export function useInstrumentClassOptionsQuery() {
  return useQuery({
    queryKey: ['product-params', 'instrument-class-options'],
    queryFn: () => bankingAPI.productParameters.getInstrumentClassOptions(),
    staleTime: 60000,
  });
}
