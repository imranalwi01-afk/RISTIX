import { apiClient } from '../api-client';
import { healthAPI } from './health.api';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';

export const apiDiagnostics = {
  // Diagnose current API configuration - IAF ECS DEPLOYMENT
  diagnose: () => {
  },

  // Test real API connectivity
  testConnectivity: async () => {
    try {
      const response = await healthAPI.check();
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Real API connectivity test failed:', error);
      return { success: false, error };
    }
  }
};