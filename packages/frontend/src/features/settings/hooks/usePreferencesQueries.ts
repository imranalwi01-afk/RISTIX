import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const HEADERS = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

const API = typeof window !== 'undefined'
  ? (window as any).__NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4232/api'
  : 'http://localhost:4232/api';

export function useUserPreferencesQuery(userId?: string) {
  return useQuery({
    queryKey: ['settings', 'preferences', userId],
    queryFn: async () => {
      const res = await fetch(`${API}/user/${userId}/preferences`, { headers: HEADERS() });
      if (!res.ok) return null;
      const d = await res.json();
      return d.data || null;
    },
    enabled: !!userId, staleTime: 30000,
  });
}

export function useSaveUserPreferencesMutation(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: any) => {
      const res = await fetch(`${API}/user/${userId}/preferences`, {
        method: 'PUT', headers: HEADERS(), body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings', 'preferences', userId] }),
  });
}
