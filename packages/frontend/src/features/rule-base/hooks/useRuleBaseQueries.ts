import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingAPI } from '@/services/api';

export function useRuleBaseHeadersQuery(params?: any) {
  return useQuery({
    queryKey: ['rule-base', 'headers', params],
    queryFn: () => bankingAPI.ruleBaseSetting.getHeaders(params),
    staleTime: 15000,
  });
}

export function useCreateRuleBaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bankingAPI.ruleBaseSetting.createHeader(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rule-base'] }),
  });
}

export function useUpdateRuleBaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => bankingAPI.ruleBaseSetting.updateHeader(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rule-base'] }),
  });
}

export function useDeleteRuleBaseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bankingAPI.ruleBaseSetting.deleteHeader(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rule-base'] }),
  });
}
