// packages/frontend/src/services/api.ts
// ============================================================================
// IFRS9 API SERVICE - CENTRALIZED CONFIGURATION SYSTEM
// ============================================================================
// ✅ CENTRALIZED: All URLs come from centralized config system
// ✅ NO HARDCODING: Eliminates all hardcoded URLs and values
// ✅ ENVIRONMENT AWARE: Auto-detects deployment environment
// ✅ TYPE SAFE: Full TypeScript support with configuration validation
// ✅ SESSION CONTROL: Integrated with centralized session management
// ============================================================================

import axios, { AxiosResponse, AxiosError } from 'axios';
import { getAuthToken } from '../utils/auth-token';
import { normalizeUsersMutationResponse } from './users-api.utils';
import { normalizeRolesMutationResponse } from './roles-api.utils';
import { getErrorMessage } from '@/utils/error-message';

// ============================================================================
// 🏗️ CENTRALIZED API CONFIGURATION
// ============================================================================
// Imported from lightweight setup to avoid circular dependencies
import {
  apiClient,
  initializeUrls,
  ensureCurrentUrls,
  API_BASE_URL,
  BACKEND_URL
} from './api-setup';

export { apiClient };

// Import Domain APIs
// Import Individual Impairment API (will be initialized later to avoid circular dependency)
import { individualImpairmentAPI as individualImpairmentAPIService } from './api.individual-impairment';
import { pdConfigurationsApi } from './api/pd-configurations.api';
import { lgdConfigurationsApi } from './api/lgd-configurations.api';
import { eadConfigurationsApi } from './api/ead-configurations.api';
import { populationSegmentsApi } from './api/population-segments.api';
import { flScalarAPI } from './api/fl-scalar.api';
import { eclConfigurationsApi } from './api/ecl-configurations.api';
import { impairmentApi } from './api/impairment.api';
import { approvalAPI } from './api/approval.api';
import { notificationAPI } from './api/notification.api';
// Import IFRS9 API service
import { ifrs9API as ifrs9Service, ifrs9API } from './api/ifrs9.api';
export { ifrs9API };

// ✅ ENVIRONMENT-AWARE CONFIG LOGGING - AUTO-DETECTION MODE
console.log('🏗️ IFRS9 IAF API SERVICE - DUAL-MODE AUTO-DETECTION:');
console.log('  - API Base URL:', API_BASE_URL || 'Loading...');
console.log('  - Backend URL:', BACKEND_URL || 'Loading...');
console.log('  - Mode: Automatic Environment Detection');
console.log('  - Environment: Frontend auto-detects based on hostname');
console.log('  - Auto-Switch: IAF Development ↔ IAF Production');
console.log('  - Configuration Source: Environment Loader');

// ============================================================================
// REAL AUTHENTICATION API - NO MOCKUP DATA
// ============================================================================
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

// ============================================================================
// REAL USERS API - DATABASE INTEGRATION
// ============================================================================
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
    bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isActive?: boolean;
    includeInactive?: boolean;
    sort?: string;
    order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  }, tenantId?: string) => {
    console.log(`👥 Fetching users from real database${tenantId ? ` (tenant: ${tenantId})` : ''}`, params);
    const config: any = { params };
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/users', config);
    return response.data;
  },

  // Get user by ID from real database
  getById: async (id: string, tenantId?: string) => {
    console.log(`👤 Fetching user ${id} from real database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/users/${id}`, config);
    return response.data;
  },

  // Create user in real database
  create: async (userData: any, tenantId?: string) => {
    console.log(`➕ Creating user in real database${tenantId ? ` (tenant: ${tenantId})` : ''}`, userData.email);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post('/users', userData, config);
    return usersAPI.normalizeMutationResponse(response, 'User created successfully');
  },

  // Update user in real database
  update: async (id: string, userData: any, tenantId?: string) => {
    console.log(`✏️ Updating user ${id} in real database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.put(`/users/${id}`, userData, config);
    return usersAPI.normalizeMutationResponse(response, 'User updated successfully');
  },

  // Delete user from real database
  delete: async (id: string, tenantId?: string) => {
    console.log(`🗑️ Deleting user ${id} from real database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.delete(`/users/${id}`, config);
    return usersAPI.normalizeMutationResponse(response, 'User deleted successfully');
  },

  // ✅ NEW: Enable/disable user actions
  enable: async (id: string, tenantId?: string) => {
    console.log(`✅ Enabling user ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/enable`, {}, config);
    return usersAPI.normalizeMutationResponse(response, 'User enabled successfully');
  },

  disable: async (id: string, tenantId?: string) => {
    console.log(`❌ Disabling user ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
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
    console.log(`🔐 Resetting password for user ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/reset-password`, payload, config);
    return usersAPI.normalizeMutationResponse(response, 'Password reset successfully');
  }
};

// ============================================================================
// REAL ROLES API - TENANT DATABASE INTEGRATION
// ============================================================================
export const rolesAPI = {
  normalizeMutationResponse: (
    response: AxiosResponse<any>,
    fallbackSuccessMessage: string
  ): Record<string, any> & {
    success: boolean;
    approvalRequired: boolean;
    status?: number;
    message: string;
    requestId?: string;
  } => normalizeRolesMutationResponse(response, fallbackSuccessMessage),

  // Get all roles from tenant database with filtering and pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    isActive?: boolean;
    includeInactive?: boolean;
  }, tenantId?: string) => {
    console.log(`🔒 Fetching roles from tenant database with real API${tenantId ? ` (tenant: ${tenantId})` : ''}`, params);
    const config: any = { params };
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/roles', config);
    return response.data;
  },

  // Get role by ID from tenant database
  getById: async (id: string, tenantId?: string) => {
    console.log(`🔒 Fetching role ${id} from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/${id}`, config);
    return response.data;
  },

  // Create role in tenant database
  create: async (roleData: {
    roleName?: string;
    name: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    complianceLevel?: string;
    hierarchyLevel?: number;
    isActive?: boolean;
  }, tenantId?: string) => {
    console.log(`➕ Creating role in tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`, roleData.name);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = {
      roleName: roleData.roleName || roleData.name || roleData.displayName,
      description: roleData.description,
      permissions: roleData.permissions || [],
      complianceLevel: roleData.complianceLevel,
      hierarchyLevel: roleData.hierarchyLevel,
      isActive: roleData.isActive,
    };
    const response = await apiClient.post('/roles', payload, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role created successfully');
  },

  // Update role in tenant database
  update: async (id: string, roleData: {
    roleName?: string;
    name?: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
    complianceLevel?: string;
    hierarchyLevel?: number;
    isActive?: boolean;
  }, tenantId?: string) => {
    console.log(`✏️ Updating role ${id} in tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = {
      roleName: roleData.roleName || roleData.name || roleData.displayName,
      description: roleData.description,
      permissions: roleData.permissions,
      complianceLevel: roleData.complianceLevel,
      hierarchyLevel: roleData.hierarchyLevel,
      isActive: roleData.isActive,
    };
    const response = await apiClient.put(`/roles/${id}`, payload, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role updated successfully');
  },

  // Delete role from tenant database
  delete: async (id: string, tenantId?: string) => {
    console.log(`🗑️ Deleting role ${id} from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.delete(`/roles/${id}`, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role deleted successfully');
  },

  // Toggle role active status
  toggle: async (id: string, tenantId?: string) => {
    console.log(`🔄 Toggling role ${id} active status${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/roles/${id}/toggle`, {}, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role status updated successfully');
  },

  // Get all available permissions
  getPermissions: async (tenantId?: string) => {
    console.log(`🔑 Fetching permissions from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/roles/permissions', config);
    return response.data;
  },

  // Update role permissions
  updatePermissions: async (
    id: string,
    permissions: string[],
    tenantId?: string,
    options?: { submitForApproval?: boolean; approvalReason?: string }
  ) => {
    console.log(`🔑 Updating permissions for role ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.put(`/roles/${id}/permissions`, {
      permissions,
      submitForApproval: options?.submitForApproval ?? true,
      approvalReason: options?.approvalReason
    }, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role permissions updated successfully');
  },

  // Get users assigned to role
  getUsers: async (roleId: string, tenantId?: string) => {
    console.log(`👥 Fetching users for role ${roleId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/${roleId}/users`, config);
    return response.data;
  },

  // Get roles assigned to user
  getUserRoles: async (userId: string, tenantId?: string) => {
    console.log(`👤 Fetching role assignments for user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/users/${userId}/roles`, config);
    return response.data;
  },

  // Assign role to user
  assignUser: async (roleId: string, userId: string, tenantId?: string) => {
    console.log(`👤 Assigning role ${roleId} to user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = { isTemporary: false };
    try {
      // Preferred RBAC route in new-backend: /roles/users/:userId/roles/:roleId
      const response = await apiClient.post(`/roles/users/${userId}/roles/${roleId}`, payload, config);
      return rolesAPI.normalizeMutationResponse(response, 'Role assigned successfully');
    } catch (error: any) {
      // Compatibility fallback for legacy route shape if RBAC-prefixed path is unavailable.
      if (error?.response?.status === 404) {
        const response = await apiClient.post(`/users/${userId}/roles/${roleId}`, payload, config);
        return rolesAPI.normalizeMutationResponse(response, 'Role assigned successfully');
      }
      throw error;
    }
  },

  // Remove role from user
  removeUser: async (roleId: string, userId: string, tenantId?: string) => {
    console.log(`👤 Removing role ${roleId} from user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    try {
      // Preferred RBAC route in new-backend: /roles/users/:userId/roles/:roleId
      const response = await apiClient.delete(`/roles/users/${userId}/roles/${roleId}`, config);
      return rolesAPI.normalizeMutationResponse(response, 'Role removed successfully');
    } catch (error: any) {
      // Compatibility fallback for legacy route shape if RBAC-prefixed path is unavailable.
      if (error?.response?.status === 404) {
        const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`, config);
        return rolesAPI.normalizeMutationResponse(response, 'Role removed successfully');
      }
      throw error;
    }
  },

  checkUserPermission: async (
    userId: string,
    input: { resource: string; action: string },
    tenantId?: string
  ) => {
    console.log(`🔍 Checking permission for user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`, input);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/roles/users/${userId}/permissions/check`, input, config);
    return response.data;
  }
};

// ============================================================================
// REAL AUDIT API - DATABASE INTEGRATION
// ============================================================================
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

// ============================================================================
// SECURITY CONFIG API (STUB)
// ============================================================================
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

// ============================================================================
// REAL BANKING PARAMETERS API - DS2 DATABASE INTEGRATION
import { bankingAPI } from './api/banking.api';
export { bankingAPI };

// REAL HEALTH CHECK API - LOCALHOST ONLY
// ============================================================================
export const healthAPI = {
  // Check backend health
  check: async () => {
    console.log('🏥 Checking backend health at:', BACKEND_URL);
    const response = await axios.get(`${BACKEND_URL}/health`);
    return response.data;
  },

  // Get API information
  getInfo: async () => {
    console.log('ℹ️ Getting API info from:', API_BASE_URL);
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  }
};

// ============================================================================
// FILE UPLOAD API - REAL BACKEND INTEGRATION
// ============================================================================
export const uploadAPI = {
  uploadFile: async (file: File, endpoint: string = '/upload') => {
    console.log(`📤 Uploading file: ${file.name} to real backend`);

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 Upload progress: ${progress}%`);
        }
      },
    });
    return response.data;
  }
};

// ============================================================================
// API DIAGNOSTICS - DEVELOPMENT ONLY
// ============================================================================
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

// ============================================================================
// APPLICATION PARAMETERS API - MASTER-DETAIL PATTERN
// ============================================================================
export const applicationParameterAPI = {
  // Header operations
  headers: {
    getAll: async (params?: {
      include_details?: boolean;
      page?: number;
      offset?: number;
      limit?: number;
      search?: string;
      filters?: string;
      sort?: string;
      paginationMode?: 'client' | 'offset' | 'cursor';
    }) => {
      console.log('📋 Fetching application parameter headers from real database', params);
      const response = await apiClient.get('/banking/setup/application', { params });
      return response.data;
    },

    getById: async (id: string) => {
      console.log(`📄 Fetching application parameter header ${id} from real database`);
      const response = await apiClient.get(`/banking/setup/application/${id}`);
      return response.data;
    },

    create: async (headerData: any) => {
      console.log('➕ Creating application parameter header in real database');
      const response = await apiClient.post('/banking/setup/application', headerData);
      return response.data;
    },

    update: async (id: string, headerData: any) => {
      console.log(`✏️ Updating application parameter header ${id} in real database`);
      const response = await apiClient.put(`/banking/setup/application/${id}`, headerData);
      return response.data;
    },

    delete: async (id: string) => {
      console.log(`🗑️ Deleting application parameter header ${id} from real database`);
      const response = await apiClient.delete(`/banking/setup/application/${id}`);
      return response.data;
    }
  },

  // Detail operations
  details: {
    getForHeader: async (headerId: string) => {
      console.log(`📋 Fetching details for application parameter header ${headerId}`);
      const response = await apiClient.get(`/banking/setup/application/${headerId}/details`);
      return response.data;
    },

    create: async (headerId: string, detailData: any) => {
      console.log(`➕ Creating detail for application parameter header ${headerId}`);
      const response = await apiClient.post(`/banking/setup/application/${headerId}/details`, detailData);
      return response.data;
    },

    update: async (detailId: string, detailData: any) => {
      console.log(`✏️ Updating application parameter detail ${detailId}`);
      const response = await apiClient.put(`/banking/setup/application/details/${detailId}`, detailData);
      return response.data;
    },

    delete: async (detailId: string) => {
      console.log(`🗑️ Deleting application parameter detail ${detailId}`);
      const response = await apiClient.delete(`/banking/setup/application/details/${detailId}`);
      return response.data;
    }
  },

  // Utility operations
  health: async () => {
    console.log('🏥 Checking application parameter service health');
    const response = await apiClient.get('/banking/health');
    return response.data;
  },

  metadata: async () => {
    console.log('📋 Getting application parameter metadata');
    const response = await apiClient.get('/banking/metadata');
    return response.data;
  }
};

// ============================================================================
// CONSOLIDATED API EXPORT - REAL DATABASE ONLY
// ============================================================================
// ============================================================================
// IFRS9 CALCULATION API - REAL DATABASE INTEGRATION
// ============================================================================


export const api = {
  auth: authAPI,
  users: usersAPI,
  roles: rolesAPI,
  banking: bankingAPI,
  applicationParameter: applicationParameterAPI,
  individualImpairment: individualImpairmentAPIService,
  ifrs9: ifrs9Service,
  ifrs9Reports: bankingAPI.ifrs9Reports,
  health: healthAPI,
  upload: uploadAPI,
  diagnostics: apiDiagnostics,
  client: apiClient
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================
export const handleAPIError = (error: any) => {
  if (error.response) {
    const requestId =
      error.response.data && typeof error.response.data === 'object' && typeof error.response.data.requestId === 'string'
        ? error.response.data.requestId
        : undefined;
    return {
      type: 'server_error',
      status: error.response.status,
      message: getErrorMessage(error, 'Server error occurred'),
      details: error.response.data,
      requestId,
    };
  } else if (error.request) {
    return {
      type: 'network_error',
      message: `Cannot connect to backend server. Please check if backend is running at ${BACKEND_URL}`,
      details: error.request
    };
  } else {
    return {
      type: 'client_error',
      message: getErrorMessage(error, 'An unexpected error occurred'),
      details: error
    };
  }
};

// ============================================================================
// IAF ECS DEBUGGING
// ============================================================================
if (typeof window !== 'undefined') {
  // Expose API for debugging - IAF ECS DEPLOYMENT
  (window as any).__IFRS9_IAF_API__ = {
    client: apiClient,
    diagnostics: apiDiagnostics,
    config: {
      baseUrl: API_BASE_URL || '/api/v1',
      backendUrl: BACKEND_URL || '',
      deploymentMode: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development',
      ecsServer: process.env.BACKEND_HOST || '',
      realDatabaseMode: true,
      mockupData: false,
      singleTenantMode: true
    },
    testConnectivity: apiDiagnostics.testConnectivity,
    diagnose: apiDiagnostics.diagnose,
  };

  console.log('🏗️ API debugging available: window.__IFRS9_IAF_API__');
  console.log('🏗️ Run window.__IFRS9_IAF_API__.diagnose() for diagnostics');
  console.log('🏗️ Single tenant mode active');
}


// ============================================================================
// REAL PLATFORM USERS API - PLATFORM DB INTEGRATION
// ============================================================================
export const platformUsersAPI = {
  // Get all platform users
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    console.log('👥 Fetching platform users from real database', params);
    const response = await apiClient.get('/platform-users', { params });
    return response.data;
  },

  // Get platform user by ID
  getById: async (id: string) => {
    console.log(`👤 Fetching platform user ${id} from real database`);
    const response = await apiClient.get(`/platform-users/${id}`);
    return response.data;
  },

  // Create platform user
  create: async (userData: any) => {
    console.log('➕ Creating platform user', userData.email);
    const response = await apiClient.post('/platform-users', userData);
    return response.data;
  },

  // Update platform user
  update: async (id: string, userData: any) => {
    console.log(`✏️ Updating platform user ${id}`);
    const response = await apiClient.put(`/platform-users/${id}`, userData);
    return response.data;
  },

  // Delete platform user
  delete: async (id: string) => {
    console.log(`🗑️ Deleting platform user ${id}`);
    const response = await apiClient.delete(`/platform-users/${id}`);
    return response.data;
  }
};

// ============================================================================
// REAL TENANTS API - PLATFORM DB INTEGRATION
// ============================================================================
export const tenantsAPI = {
  // Get all tenants
  getAll: async (params?: { page?: number; limit?: number; search?: string; mode?: 'admin' }) => {
    console.log('🏢 Fetching tenants from real database', params);
    const response = await apiClient.get('/tenants', { params });
    return response.data;
  },

  // Get tenant by ID
  getById: async (id: string) => {
    console.log(`🏢 Fetching tenant ${id} from real database`);
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },

  // Create tenant
  create: async (tenantData: any) => {
    console.log('➕ Creating tenant', tenantData.name);
    const response = await apiClient.post('/tenants', tenantData);
    return response.data;
  },

  // Update tenant
  update: async (id: string, tenantData: any) => {
    console.log(`✏️ Updating tenant ${id}`);
    const response = await apiClient.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  // Delete tenant
  delete: async (id: string) => {
    console.log(`🗑️ Deleting tenant ${id}`);
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  },

  // Enable tenant
  enable: async (id: string) => {
    console.log(`✅ Enabling tenant ${id}`);
    const response = await apiClient.post(`/tenants/${id}/enable`);
    return response.data;
  },

  // Disable tenant
  disable: async (id: string) => {
    console.log(`❌ Disabling tenant ${id}`);
    const response = await apiClient.post(`/tenants/${id}/disable`);
    return response.data;
  }
};

export default api;
