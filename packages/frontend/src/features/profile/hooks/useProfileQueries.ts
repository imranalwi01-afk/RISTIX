import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const H = () => {
  const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` };
};
const A = typeof window !== 'undefined'
  ? (window as any).__NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4232/api'
  : 'http://localhost:4232/api';

export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const r = await fetch(`${A}/user/profile`, { headers: H() });
      if (!r.ok) throw new Error('Failed');
      const d = await r.json();
      return d.data || null;
    },
    enabled: !!userId, staleTime: 30000,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch(`${A}/user/profile`, { method: 'PUT', headers: H(), body: JSON.stringify(data) });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useUserActivitiesQuery(userId?: string) {
  return useQuery({
    queryKey: ['activities', userId],
    queryFn: async () => {
      const r = await fetch(`${A}/user-activity/activities?userId=${userId}`, { headers: H() });
      if (!r.ok) return [];
      const d = await r.json();
      return d.data || [];
    },
    enabled: !!userId, staleTime: 10000,
  });
}
