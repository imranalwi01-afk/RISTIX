import { apiClient } from '../api-client';
import { healthAPI } from './health.api';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';

export const apiDiagnostics = {
  // Diagnose current API configuration - IAF ECS DEPLOYMENT
  diagnose: () => {
    console.group('🏗️ IFRS9 IAF ECS API Diagnostics');
    console.log('Base URL:', API_BASE_URL);
    console.log('Backend URL:', BACKEND_URL);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Deployment Mode: IAF ECS SERVER (10.18.11.35)');
    console.log('Real Database Mode: ON (RDS: pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com)');
    console.log('Mockup Data: ABSOLUTELY PROHIBITED');
    console.log('IAF Single Tenant Mode: ✅ ENABLED');

    if (typeof window !== 'undefined') {
      console.log('Current hostname:', window.location.hostname);
      console.log('Is development:', window.location.hostname === 'localhost');
      console.log('Auth token present:', !!localStorage.getItem('auth_token'));
      console.log('User data present:', !!localStorage.getItem('user_data'));

      // Show real user data if available
      const userData = localStorage.getItem('user_data'); // Fixed: Use 'user_data' key to match auth provider
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('Current real user:', user.email, user.tenantId ? `(tenant: ${user.tenantId})` : '(no tenant)');
        } catch (e) {
          console.log('User data parse error:', e);
        }
      }
    }

    console.groupEnd();
  },

  // Test real API connectivity
  testConnectivity: async () => {
    try {
      console.log('🔧 Testing real API connectivity...');
      const response = await healthAPI.check();
      console.log('✅ Real API connectivity test passed:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Real API connectivity test failed:', error);
      return { success: false, error };
    }
  }
};