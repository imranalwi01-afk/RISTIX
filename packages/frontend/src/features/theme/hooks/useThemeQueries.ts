import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const H = () => {
  const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` };
};
const A = typeof window !== 'undefined'
  ? (window as any).__NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5232/api'
  : 'http://localhost:5232/api';

export function useUserThemeQuery(userId?: string) {
  return useQuery({
    queryKey: ['theme', userId],
    queryFn: async () => {
      const r = await fetch(`${A}/user/${userId}/theme`, { headers: H() });
      if (!r.ok) return null;
      const d = await r.json();
      return d.data || null;
    },
    enabled: !!userId, staleTime: 30000,
  });
}

export function useSaveUserThemeMutation(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (theme: any) => {
      const r = await fetch(`${A}/user/${userId}/theme`, { method: 'PUT', headers: H(), body: JSON.stringify(theme) });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['theme', userId] }),
  });
}
