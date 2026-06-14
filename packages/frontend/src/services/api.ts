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


// ============================================================================
// REAL AUTHENTICATION API - NO MOCKUP DATA
// ============================================================================
import { authAPI } from './api/auth.api';
export { authAPI };

// ============================================================================
// REAL USERS API - DATABASE INTEGRATION
// ============================================================================
import { usersAPI } from './api/users.api';
export { usersAPI };

// ============================================================================
// REAL ROLES API - TENANT DATABASE INTEGRATION
// ============================================================================
import { rolesAPI } from './api/roles.api';
export { rolesAPI };

// ============================================================================
// REAL AUDIT API - DATABASE INTEGRATION
// ============================================================================
import { auditAPI } from './api/audit.api';
export { auditAPI };

// ============================================================================
// SECURITY CONFIG API (STUB)
// ============================================================================
import { securityConfigAPI } from './api/security-config.api';
export { securityConfigAPI };

// ============================================================================
// REAL BANKING PARAMETERS API - DS2 DATABASE INTEGRATION
import { bankingAPI } from './api/banking.api';
export { bankingAPI };

// REAL HEALTH CHECK API - LOCALHOST ONLY
// ============================================================================
import { healthAPI } from './api/health.api';
export { healthAPI };

// ============================================================================
// FILE UPLOAD API - REAL BACKEND INTEGRATION
// ============================================================================
import { uploadAPI } from './api/upload.api';
export { uploadAPI };

// ============================================================================
// API DIAGNOSTICS - DEVELOPMENT ONLY
// ============================================================================
import { apiDiagnostics } from './api/diagnostics.api';
export { apiDiagnostics };

// ============================================================================
// APPLICATION PARAMETERS API - MASTER-DETAIL PATTERN
// ============================================================================
import { applicationParameterAPI } from './api/application-params.api';
export { applicationParameterAPI };

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

}


// ============================================================================
// REAL PLATFORM USERS API - PLATFORM DB INTEGRATION
// ============================================================================
export const platformUsersAPI = {
  // Get all platform users
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get('/platform-users', { params });
    return response.data;
  },

  // Get platform user by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/platform-users/${id}`);
    return response.data;
  },

  // Create platform user
  create: async (userData: any) => {
    const response = await apiClient.post('/platform-users', userData);
    return response.data;
  },

  // Update platform user
  update: async (id: string, userData: any) => {
    const response = await apiClient.put(`/platform-users/${id}`, userData);
    return response.data;
  },

  // Delete platform user
  delete: async (id: string) => {
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
    const response = await apiClient.get('/tenants', { params });
    return response.data;
  },

  // Get tenant by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },

  // Create tenant
  create: async (tenantData: any) => {
    const response = await apiClient.post('/tenants', tenantData);
    return response.data;
  },

  // Update tenant
  update: async (id: string, tenantData: any) => {
    const response = await apiClient.put(`/tenants/${id}`, tenantData);
    return response.data;
  },

  // Delete tenant
  delete: async (id: string) => {
    const response = await apiClient.delete(`/tenants/${id}`);
    return response.data;
  },

  // Enable tenant
  enable: async (id: string) => {
    const response = await apiClient.post(`/tenants/${id}/enable`);
    return response.data;
  },

  // Disable tenant
  disable: async (id: string) => {
    const response = await apiClient.post(`/tenants/${id}/disable`);
    return response.data;
  }
};

export default api;
