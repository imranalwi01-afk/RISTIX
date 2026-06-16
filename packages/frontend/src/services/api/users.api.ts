import { apiClient } from '../api-client';
import type { AxiosResponse } from 'axios';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';
import { normalizeUsersMutationResponse } from '../users-api.utils';

export const usersAPI = {
  normalizeMutationResponse: (
    response: AxiosResponse<any>,
    fallbackSuccessMessage: string
  ): Record<string, any> & {
    success: boolean;
    approvalRequired: boolean;
    status?: number;
    message: string;
    requestId?: string;
  } => normalizeUsersMutationResponse(response, fallbackSuccessMessage),

  // Get all users from real database
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
    includeInactive?: boolean;
    sort?: string;
    order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  }, tenantId?: string) => {
    const config: any = { params };
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/users', config);
    return response.data;
  },

  // Get user by ID from real database
  getById: async (id: string, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/users/${id}`, config);
    return response.data;
  },

  // Create user in real database
  create: async (userData: any, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post('/users', userData, config);
    return usersAPI.normalizeMutationResponse(response, 'User created successfully');
  },

  // Update user in real database
  update: async (id: string, userData: any, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.put(`/users/${id}`, userData, config);
    return usersAPI.normalizeMutationResponse(response, 'User updated successfully');
  },

  // Delete user from real database
  delete: async (id: string, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.delete(`/users/${id}`, config);
    return usersAPI.normalizeMutationResponse(response, 'User deleted successfully');
  },

  // ✅ NEW: Enable/disable user actions
  enable: async (id: string, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/enable`, {}, config);
    return usersAPI.normalizeMutationResponse(response, 'User enabled successfully');
  },

  disable: async (id: string, tenantId?: string) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/disable`, {}, config);
    return usersAPI.normalizeMutationResponse(response, 'User disabled successfully');
  },

  resetPassword: async (
    id: string,
    payload: { newPassword: string; forcePasswordChange?: boolean },
    tenantId?: string
  ) => {
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/reset-password`, payload, config);
    return usersAPI.normalizeMutationResponse(response, 'Password reset successfully');
  }
};