import { apiClient } from '../api-client';

export interface NotificationListParams {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

export const notificationAPI = {
  list: async (params?: NotificationListParams) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markRead: async (notificationId: string) => {
    const response = await apiClient.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },
};
