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
    console.log('📜 Fetching audit logs from real database', params);
    const response = await apiClient.get('/audit/logs', { params });
    return response.data;
  },

  // Get specific audit log
  getLogById: async (id: string) => {
    console.log(`📜 Fetching audit log ${id}`);
    const response = await apiClient.get(`/audit/logs/${id}`);
    return response.data;
  },

  // Get audit stats
  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    console.log('📊 Fetching audit stats');
    const response = await apiClient.get('/audit/stats', { params });
    return response.data;
  },

  // Export audit logs
  exportLogs: async (format: 'csv' | 'json', filters?: any) => {
    console.log(`📤 Exporting audit logs as ${format}`);
    const response = await apiClient.post('/audit/export', { format, filters }, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  }
};