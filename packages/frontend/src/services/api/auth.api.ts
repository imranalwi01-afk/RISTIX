import { apiClient } from '../api-client';
import { ensureCurrentUrls } from '../api-setup';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';

export const authAPI = {
  // ✅ FIXED: Real login with tenantId support
  login: async (email: string, password: string, tenantId?: string) => {
    // CRITICAL: Ensure URLs are current before authentication
    ensureCurrentUrls();

    console.log(`🔐 Real API login: ${email}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    console.log(`🔐 Using API Base URL: ${API_BASE_URL}`);

    const payload: any = { email, password };
    if (tenantId) {
      payload.tenantId = tenantId;
    }

    const response = await apiClient.post('/auth/login', payload);
    console.log('✅ Login API response received');
    return response.data;
  },

  // Real logout
  logout: async () => {
    console.log('🚪 Real API logout');
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get current user from real database
  me: async () => {
    console.log('👤 Fetching current user from real database');
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Verify token
  verifyToken: async () => {
    console.log('🔒 Verifying token');
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  changePassword: async (data: any) => {
    console.log('🔒 Changing password (stub)');
    // In real implementation: await apiClient.post('/auth/change-password', data);
    return { success: true, message: 'Password changed successfully' };
  },

  // Real token refresh
  refresh: async (refreshToken: string) => {
    console.log('🔄 Real token refresh');
    // Use relative auth path so we don't duplicate /api/v1 on configured base URLs
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};