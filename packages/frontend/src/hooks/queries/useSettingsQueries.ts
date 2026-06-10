import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = typeof window !== 'undefined'
  ? (window as any).__NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4232/api'
  : 'http://localhost:4232/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

// ============================================================================
// USER PREFERENCES
// ============================================================================
export function useUserPreferencesQuery(userId?: string) {
  return useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/${userId}/preferences`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || null;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useSaveUserPreferencesMutation(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: any) => {
      const res = await fetch(`${API_BASE}/user/${userId}/preferences`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] }),
  });
}

// ============================================================================
// USER PROFILE
// ============================================================================
export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/profile`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      return data.data || null;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: any) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
  });
}

// ============================================================================
// USER THEME
// ============================================================================
export function useUserThemeQuery(userId?: string) {
  return useQuery({
    queryKey: ['user-theme', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user/${userId}/theme`, { headers: getHeaders() });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data || null;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useSaveUserThemeMutation(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (theme: any) => {
      const res = await fetch(`${API_BASE}/user/${userId}/theme`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(theme),
      });
      if (!res.ok) throw new Error('Failed to save theme');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-theme', userId] }),
  });
}

// ============================================================================
// USER ACTIVITIES
// ============================================================================
export function useUserActivitiesQuery(userId?: string) {
  return useQuery({
    queryKey: ['user-activities', userId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/user-activity/activities?userId=${userId}`, { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!userId,
    staleTime: 10000,
  });
}
