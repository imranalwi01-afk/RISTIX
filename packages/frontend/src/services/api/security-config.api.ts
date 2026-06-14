import { apiClient } from '../api-client';

export const securityConfigAPI = {
  // Get security configuration
  get: async () => {
    console.log('🛡️ Fetching security configuration');
    const response = await apiClient.get('/security-config');
    return response.data;
  },

  // Update security configuration
  update: async (config: any) => {
    console.log('🛡️ Updating security configuration');
    const response = await apiClient.put('/security-config', config);
    return response.data;
  }
};