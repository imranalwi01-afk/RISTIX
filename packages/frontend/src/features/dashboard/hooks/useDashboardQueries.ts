import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

export function useDashboardDataQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/banking/dashboard');
      return res.data;
    },
    staleTime: 15000,
  });
}

export function useDashboardEclSummaryQuery() {
  return useQuery({
    queryKey: ['dashboard', 'ecl-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/banking/dashboard/ecl-summary');
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useDashboardPortfolioQuery() {
  return useQuery({
    queryKey: ['dashboard', 'portfolio'],
    queryFn: async () => {
      const res = await apiClient.get('/banking/dashboard/portfolio');
      return res.data;
    },
    staleTime: 30000,
  });
}
