// packages/frontend/src/services/api-client.ts
// ============================================================================
// SHARED AXIOS CLIENT - BREAKS CIRCULAR DEPENDENCIES
// ============================================================================
// Purpose: Provides a shared axios client instance for all API services
// Used by: api.ts, api.individual-impairment.ts, and other API modules
// ============================================================================

import axios, { AxiosInstance } from 'axios';

// Create a simple axios client that can be imported by other modules
export const apiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  responseType: 'json',
  maxRedirects: 5,
});

export default apiClient;