import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/services/api/notification.api';

export function useNotificationsQuery(params?: any) {
  return useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => notificationAPI.list(params),
    staleTime: 10000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationAPI.getUnreadCount(),
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
