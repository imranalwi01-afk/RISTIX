// packages/frontend/src/services/api-client.ts
// ============================================================================
// SHARED AXIOS CLIENT - BREAKS CIRCULAR DEPENDENCIES
// ============================================================================
// Purpose: Provides a shared axios client instance for all API services
// Used by: api.ts, api.individual-impairment.ts, and other API modules
// ============================================================================

import axios, { AxiosInstance } from 'axios';
import { frontendEnvironmentLoader } from '../config/environment-loader-frontend';

// Initialize configuration
const config = frontendEnvironmentLoader.getConfiguration();
const baseURL = config?.api?.base || config?.api?.backend || 'http://localhost:4232/api/v1';

console.log('🔧 [API CLIENT] Initializing shared axios client with baseURL:', baseURL);

// Create a simple axios client that can be imported by other modules
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  responseType: 'json',
  maxRedirects: 5,
});



// ✅ Add request interceptor to inject auth token and tenant
apiClient.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // Get tenant from storage or user data
    let tenantId = null;
    if (typeof window !== 'undefined') {
      const userDataStr = localStorage.getItem('user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          tenantId = userData.tenantId;
        } catch (e) {
          console.error('Error parsing user data for tenant', e);
        }
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;