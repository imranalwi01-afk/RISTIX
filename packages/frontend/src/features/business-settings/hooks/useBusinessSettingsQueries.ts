import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

export function useBusinessSettingsQuery(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['business-settings', params],
    queryFn: async () => {
      const res = await apiClient.get('/banking/setup/business', { params });
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useBusinessSettingsTablesQuery() {
  return useQuery({
    queryKey: ['business-settings', 'tables'],
    queryFn: async () => {
      const res = await apiClient.get('/banking/setup/business/tables');
      return res.data;
    },
    staleTime: 60000,
  });
}

export function useBusinessSettingsColumnsQuery(tableName: string | undefined) {
  return useQuery({
    queryKey: ['business-settings', 'columns', tableName],
    queryFn: async () => {
      const res = await apiClient.get(`/banking/business-settings/columns`, { params: { table: tableName } });
      return res.data;
    },
    enabled: !!tableName,
    staleTime: 60000,
  });
}
