import { apiClient } from '../api-client';

export type NotificationCategory = 'approval' | 'workflow' | 'analytics' | 'system';
export type NotificationReadStatus = 'all' | 'read' | 'unread';

export interface NotificationListParams {
  unreadOnly?: boolean;
  readStatus?: NotificationReadStatus;
  category?: NotificationCategory;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationPreferences {
  muteAll: boolean;
  mutedCategories: NotificationCategory[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
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

  markReadStatusBulk: async (payload: { notificationIds: string[]; read: boolean }) => {
    const response = await apiClient.post('/notifications/read-status', payload);
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (payload: Partial<NotificationPreferences>) => {
    const response = await apiClient.put('/notifications/preferences', payload);
    return response.data;
  },
};
