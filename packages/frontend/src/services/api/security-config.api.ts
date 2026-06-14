import { apiClient } from '../api-client';

export const securityConfigAPI = {
  // Get security configuration
  get: async () => {
    const response = await apiClient.get('/security-config');
    return response.data;
  },

  // Update security configuration
  update: async (config: any) => {
    const response = await apiClient.put('/security-config', config);
    return response.data;
  }
};