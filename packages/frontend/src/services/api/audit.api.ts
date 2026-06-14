import { apiClient } from '../api-client';

export const auditAPI = {
  // Get all audit logs with filtering and pagination
  getLogs: async (params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    action?: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    requestId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const response = await apiClient.get('/audit/logs', { params });
    return response.data;
  },

  // Get specific audit log
  getLogById: async (id: string) => {
    const response = await apiClient.get(`/audit/logs/${id}`);
    return response.data;
  },

  // Get audit stats
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/audit/stats', { params });
    return response.data;
  },

  // Export audit logs
  exportLogs: async (format: 'csv' | 'json', filters?: any) => {
    const response = await apiClient.post('/audit/export', { format, filters }, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }
};