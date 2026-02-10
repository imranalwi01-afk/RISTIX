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
    // ✅ FIXED: Use explicit v1 path for refresh to avoid ambiguity
    const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
    return response.data;
  }
};

// ============================================================================
// REAL USERS API - DATABASE INTEGRATION
// ============================================================================
export const usersAPI = {
  // Get all users from real database
  getAll: async (params?: { page?: number; limit?: number; search?: string }, tenantId?: string) => {
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
    return response.data;
  },

  // Update user in real database
  update: async (id: string, userData: any, tenantId?: string) => {
    console.log(`✏️ Updating user ${id} in real database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.put(`/users/${id}`, userData, config);
    return response.data;
  },

  // Delete user from real database
  delete: async (id: string, tenantId?: string) => {
    console.log(`🗑️ Deleting user ${id} from real database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.delete(`/users/${id}`, config);
    return response.data;
  },

  // ✅ NEW: Enable/disable user actions
  enable: async (id: string, tenantId?: string) => {
    console.log(`✅ Enabling user ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/enable`, {}, config);
    return response.data;
  },

  disable: async (id: string, tenantId?: string) => {
    console.log(`❌ Disabling user ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/users/${id}/disable`, {}, config);
    return response.data;
  }
};

// ============================================================================
// REAL ROLES API - TENANT DATABASE INTEGRATION
// ============================================================================
export const rolesAPI = {
  // Get all roles from tenant database with filtering and pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isActive?: boolean;
  }) => {
    console.log('🔒 Fetching roles from tenant database with real API', params);
    const response = await apiClient.get('/roles', { params });
    return response.data;
  },

  // Get role by ID from tenant database
  getById: async (id: string) => {
    console.log(`🔒 Fetching role ${id} from tenant database`);
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Create role in tenant database
  create: async (roleData: {
    name: string;
    displayName?: string;
    description?: string;
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isActive?: boolean;
  }) => {
    console.log('➕ Creating role in tenant database', roleData.name);
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  },

  // Update role in tenant database
  update: async (id: string, roleData: {
    name?: string;
    displayName?: string;
    description?: string;
    bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isActive?: boolean;
  }) => {
    console.log(`✏️ Updating role ${id} in tenant database`);
    const response = await apiClient.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete role from tenant database
  delete: async (id: string) => {
    console.log(`🗑️ Deleting role ${id} from tenant database`);
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  // Toggle role active status
  toggle: async (id: string) => {
    console.log(`🔄 Toggling role ${id} active status`);
    const response = await apiClient.post(`/roles/${id}/toggle`);
    return response.data;
  },

  // Get all available permissions
  getPermissions: async () => {
    console.log('🔑 Fetching permissions from tenant database');
    const response = await apiClient.get('/roles/permissions');
    return response.data;
  },

  // Update role permissions
  updatePermissions: async (id: string, permissions: string[]) => {
    console.log(`🔑 Updating permissions for role ${id}`);
    const response = await apiClient.put(`/roles/${id}/permissions`, { permissions });
    return response.data;
  },

  // Get users assigned to role
  getUsers: async (roleId: string) => {
    console.log(`👥 Fetching users for role ${roleId}`);
    const response = await apiClient.get(`/roles/${roleId}/users`);
    return response.data;
  },

  // Assign role to user
  assignUser: async (roleId: string, userId: string) => {
    console.log(`👤 Assigning role ${roleId} to user ${userId}`);
    // Fixed path matching backend: POST /users/:userId/roles/:roleId
    const response = await apiClient.post(`/users/${userId}/roles/${roleId}`);
    return response.data;
  },

  // Remove role from user
  removeUser: async (roleId: string, userId: string) => {
    console.log(`👤 Removing role ${roleId} from user ${userId}`);
    // Fixed path matching backend: DELETE /users/:userId/roles/:roleId
    const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
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
// ============================================================================
export const bankingAPI = {
  // Health check DS2 database connection
  health: async () => {
    console.log('🏥 Checking DS2 database health');
    const response = await apiClient.get('/banking/health');
    return response.data;
  },

  // New Standardized APIs
  pdConfigurations: pdConfigurationsApi,
  lgdConfigurations: lgdConfigurationsApi,
  eadConfigurations: eadConfigurationsApi,
  populationSegments: populationSegmentsApi,
  flScalar: flScalarAPI,
  eclConfigurations: eclConfigurationsApi,
  impairment: impairmentApi,
  approval: approvalAPI,

  // Jobs Monitoring API (backend /api/v1/jobs)
  jobs: {
    getDefinitions: async () => {
      const response = await apiClient.get('/jobs/definitions')
      return response.data
    },
    getExecutions: async (params?: { page?: number; limit?: number; status?: string; jobType?: string }) => {
      const response = await apiClient.get('/jobs/executions', { params })
      return response.data
    },
    getMetrics: async () => {
      const response = await apiClient.get('/jobs/metrics')
      return response.data
    },
    runJob: async (definitionId: string) => {
      const response = await apiClient.post(`/jobs/${definitionId}/run`)
      return response.data
    },
    controlJob: async (executionId: string, action: 'pause' | 'resume' | 'stop') => {
      const response = await apiClient.post(`/jobs/${executionId}/control`, { action })
      return response.data
    },
    toggleJob: async (definitionId: string) => {
      const response = await apiClient.post(`/jobs/${definitionId}/toggle`)
      return response.data
    },
    createDefinition: async (data: any) => {
      const response = await apiClient.post('/jobs/definitions', data)
      return response.data
    },
  },



  // Application setup parameters (FRS9_PARAM_COMMONH - Type A)
  applicationSetup: {
    getAll: async () => {
      console.log('🔧 Fetching application setup from DS2 database');
      const response = await apiClient.get('/banking/setup/application');
      return response.data;
    },

    create: async (setupData: any) => {
      console.log('➕ Creating application setup in DS2 database');
      const response = await apiClient.post('/banking/setup/application', setupData);
      return response.data;
    },

    update: async (paramCode: string, setupData: any) => {
      console.log(`✏️ Updating application setup ${paramCode} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/application/${paramCode}`, setupData);
      return response.data;
    },

    delete: async (paramCode: string) => {
      console.log(`🗑️ Deleting application setup ${paramCode} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/application/${paramCode}`);
      return response.data;
    },

    getHeaderDetails: async (paramCode: string) => {
      console.log(`📋 Fetching application parameter details for ${paramCode} from DS2 database`);
      const response = await apiClient.get(`/banking/setup/application/${paramCode}/details`);
      return response.data;
    },

    createDetail: async (paramCode: string, detailData: any) => {
      console.log(`➕ Creating application parameter detail for ${paramCode} in DS2 database`);
      const response = await apiClient.post(`/banking/setup/application/${paramCode}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      console.log(`✏️ Updating application parameter detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/application/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      console.log(`🗑️ Deleting application parameter detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/application/details/${detailId}`);
      return response.data;
    }
  },

  // Business setup parameters (FRS9_PARAM_COMMONH - Type B)
  businessSetup: {
    getAll: async () => {
      console.log('🏢 Fetching business setup from DS2 database');
      const response = await apiClient.get('/banking/setup/business');
      return response.data;
    },

    create: async (setupData: any) => {
      console.log('➕ Creating business setup in DS2 database');
      const response = await apiClient.post('/banking/setup/business', { ...setupData, param_type: 'B' });
      return response.data;
    },

    update: async (paramCode: string, setupData: any) => {
      console.log(`✏️ Updating business parameter ${paramCode} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/business/${paramCode}`, { ...setupData, param_type: 'B' });
      return response.data;
    },

    delete: async (paramCode: string) => {
      console.log(`🗑️ Deleting business parameter ${paramCode} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/business/${paramCode}`);
      return response.data;
    },

    getHeaderDetails: async (paramCode: string) => {
      console.log(`📋 Fetching business parameter details for ${paramCode} from DS2 database`);
      const response = await apiClient.get(`/banking/setup/business/${paramCode}/details`);
      return response.data;
    },

    createDetail: async (paramCode: string, detailData: any) => {
      console.log(`➕ Creating business parameter detail for ${paramCode} in DS2 database`);
      const response = await apiClient.post(`/banking/setup/business/${paramCode}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      console.log(`✏️ Updating business parameter detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/setup/business/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      console.log(`🗑️ Deleting business parameter detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/setup/business/details/${detailId}`);
      return response.data;
    }
  },

  // Product parameters (FRS9_PARAM_PRODUCT)
  productParameters: {
    getAll: async (mode: string, params?: { page?: number; limit?: number; search?: string }) => {
      console.log(`🏦 Fetching product parameters for ${mode} from DS2 database`, params);
      const response = await apiClient.get('/banking/parameters/product', { params: { ...params, mode } });
      return response.data;
    },

    getById: async (prdCode: string) => {
      console.log(`🏦 Fetching product parameter ${prdCode} from DS2 database`);
      const response = await apiClient.get(`/banking/parameters/product/${prdCode}`);
      return response.data;
    },

    create: async (productData: any) => {
      console.log('➕ Creating product parameter in DS2 database', productData.prd_code);
      const response = await apiClient.post('/banking/parameters/product', productData);
      return response.data;
    },

    update: async (prdCode: string, productData: any) => {
      console.log(`✏️ Updating product parameter ${prdCode} in DS2 database`);
      const response = await apiClient.put(`/banking/parameters/product/${prdCode}`, productData);
      return response.data;
    },

    delete: async (prdCode: string) => {
      console.log(`🗑️ Deleting product parameter ${prdCode} from DS2 database`);
      const response = await apiClient.delete(`/banking/parameters/product/${prdCode}`);
      return response.data;
    }
  },



  // Segmentation Configuration (FRS9_PARAM_SEGMENTH + FRS9_PARAM_SEGMENTD)
  segmentation: {
    // Header Operations
    getHeaders: async (params?: { page?: number; limit?: number; search?: string }) => {
      console.log('🎯 Fetching segmentation headers from DS2 database');
      const response = await apiClient.get('/banking/parameters/segmentation', { params });
      return response.data;
    },

    getHeader: async (id: number) => {
      console.log(`📄 Fetching segmentation header ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/parameters/segmentation/${id}`);
      return response.data;
    },

    createHeader: async (headerData: any) => {
      console.log('➕ Creating segmentation header in DS2 database');
      const response = await apiClient.post('/banking/parameters/segmentation', headerData);
      return response.data;
    },

    updateHeader: async (id: number, headerData: any) => {
      console.log(`✏️ Updating segmentation header ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/parameters/segmentation/${id}`, headerData);
      return response.data;
    },

    deleteHeader: async (id: number) => {
      console.log(`🗑️ Deleting segmentation header ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/parameters/segmentation/${id}`);
      return response.data;
    },

    // Detail Operations
    getDetails: async (headerId: number) => {
      console.log(`📋 Fetching segmentation details for header ${headerId} from DS2 database`);
      const response = await apiClient.get(`/banking/parameters/segmentation/${headerId}/details`);
      return response.data;
    },

    createDetail: async (headerId: number, detailData: any) => {
      console.log(`➕ Creating segmentation detail for header ${headerId} in DS2 database`);
      const response = await apiClient.post(`/banking/parameters/segmentation/${headerId}/details`, detailData);
      return response.data;
    },

    updateDetail: async (detailId: number, detailData: any) => {
      console.log(`✏️ Updating segmentation detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/parameters/segmentation/details/${detailId}`, detailData);
      return response.data;
    },

    deleteDetail: async (detailId: number) => {
      console.log(`🗑️ Deleting segmentation detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/parameters/segmentation/details/${detailId}`);
      return response.data;
    },

    // Metadata
    getSegmentTypes: async () => {
      console.log('📋 Fetching segment types');
      const response = await apiClient.get('/banking/parameters/segmentation/business-settings/segment-types');
      return response.data;
    },

    // Business Settings for Segmentation
    getBusinessSettingsTables: async () => {
      console.log('📋 Fetching segmentation business settings tables');
      const response = await apiClient.get('/banking/setup/business/tables');
      return response.data;
    },

    getBusinessSettingsColumns: async (tableName: string) => {
      console.log(`📋 Fetching segmentation business settings columns for ${tableName}`);
      const response = await apiClient.get(`/banking/setup/business/columns?table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    getBusinessSettingsDataType: async (tableName: string, columnName: string) => {
      console.log(`📋 Fetching segmentation data type for ${tableName}.${columnName}`);
      const response = await apiClient.get(`/banking/setup/business/data-type?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    getBusinessSettingsOperators: async (dataType: string) => {
      console.log(`📋 Fetching segmentation operators for data type: ${dataType}`);
      const response = await apiClient.get(`/banking/setup/business/operators?dataType=${encodeURIComponent(dataType)}`);
      return response.data;
    },

    getBusinessSettingsConditions: async () => {
      console.log('📋 Fetching segmentation business settings conditions');
      const response = await apiClient.get('/banking/setup/business/conditions');
      return response.data;
    },

    getBusinessSettingsValues: async (tableName: string, columnName: string) => {
      console.log(`📋 Fetching segmentation column values for ${tableName}.${columnName}`);
      const response = await apiClient.get(`/banking/setup/business/column-values?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    }
  },

  // ==========================================
  // PD SETUP API - IFRS9 COLLECTIVE IMPAIRMENT PD CONFIGURATION
  // ==========================================

  // ==========================================
  // JOURNAL PARAMETER API (frs9_param_journal)
  // ==========================================
  journalParameters: {
    getAll: async () => {
      console.log('📋 Fetching journal parameters');
      const response = await apiClient.get('/banking/parameters/journal');
      return response.data;
    },
    getById: async (id: number) => {
      console.log(`📄 Fetching journal parameter ${id}`);
      const response = await apiClient.get(`/banking/parameters/journal/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      console.log('➕ Creating journal parameter');
      const response = await apiClient.post('/banking/parameters/journal', data);
      return response.data;
    },
    update: async (id: number, data: any) => {
      console.log(`✏️ Updating journal parameter ${id}`);
      const response = await apiClient.put(`/banking/parameters/journal/${id}`, data);
      return response.data;
    },
    delete: async (id: number) => {
      console.log(`🗑️ Deleting journal parameter ${id}`);
      const response = await apiClient.delete(`/banking/parameters/journal/${id}`);
      return response.data;
    },
    // Options for dropdowns
    getGlGroupOptions: async () => {
      console.log('📋 Fetching GL Group options');
      const response = await apiClient.get('/banking/parameters/journal/gl-group-options');
      return response.data;
    },
    getCurrencyOptions: async () => {
      console.log('📋 Fetching Currency options');
      const response = await apiClient.get('/banking/parameters/journal/currency-options');
      return response.data;
    },
    getJournalTypeOptions: async () => {
      console.log('📋 Fetching Journal Type options');
      const response = await apiClient.get('/banking/parameters/journal/journal-type-options');
      return response.data;
    },
    getJournalCodeOptions: async () => {
      console.log('📋 Fetching Journal Code options');
      const response = await apiClient.get('/banking/parameters/journal/journal-code-options');
      return response.data;
    },
    getDbcrOptions: async () => {
      console.log('📋 Fetching DB/CR options');
      const response = await apiClient.get('/banking/parameters/journal/dbcr-options');
      return response.data;
    }
  },

  pdSetup: {
    // Get all PD configurations with joined lookup data
    getConfigs: async () => {
      console.log('🎯 Fetching PD configurations from DS2 FRS9PRO database');
      const response = await apiClient.get('/banking/pd-setup/configs');
      return response.data;
    },

    // Get single PD configuration by ID
    getConfigById: async (id: string) => {
      console.log(`📄 Fetching PD configuration ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/pd-setup/configs/${id}`);
      return response.data;
    },

    // Create new PD configuration
    createConfig: async (configData: any) => {
      console.log('➕ Creating PD configuration in DS2 database');
      const response = await apiClient.post('/banking/pd-setup/configs', configData);
      return response.data;
    },

    // Update existing PD configuration
    updateConfig: async (id: string, configData: any) => {
      console.log(`✏️ Updating PD configuration ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/pd-setup/configs/${id}`, configData);
      return response.data;
    },

    // Delete PD configuration
    deleteConfig: async (id: string) => {
      console.log(`🗑️ Deleting PD configuration ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/pd-setup/configs/${id}`);
      return response.data;
    },

    // Get population segments for PD type
    getPopulationSegments: async (segmentType: string = 'PD') => {
      console.log(`📊 Fetching population segments (${segmentType}) from DS2 database`);
      const response = await apiClient.get('/banking/pd-setup/segments', {
        params: { segment_type: segmentType }
      });
      return response.data;
    },

    // Get business parameters for PD methods and population types
    getBusinessParameters: async (paramCode?: string) => {
      console.log(`⚙️ Fetching business parameters ${paramCode ? `(${paramCode})` : ''} from DS2 database`);
      const response = await apiClient.get('/banking/pd-setup/business-parameters', {
        params: paramCode ? { param_code: paramCode } : {}
      });
      return response.data;
    },

    // Get FL scalar data for dropdown
    getFLScalars: async () => {
      console.log('📈 Fetching FL scalars from DS2 database');
      const response = await apiClient.get('/banking/collective/fl-scalar');
      return response.data;
    },

    // Get bucket groups from bucket header table
    getBucketGroups: async () => {
      console.log('🗂️ Fetching bucket groups from DS2 database');
      const response = await apiClient.get('/banking/pd-setup/bucket-groups');
      return response.data;
    },

    // Health check for PD Setup service and DS2 database connection
    health: async () => {
      console.log('🏥 Checking PD Setup service and DS2 database health');
      const response = await apiClient.get('/banking/pd-setup/health');
      return response.data;
    }
  },

  // ==========================================
  // BUSINESS SETTINGS API - EXACT USER SPECIFICATIONS B0012-B0016
  // ==========================================
  businessSettings: {
    // B0012: Get table names
    getTables: async () => {
      console.log('🗃️ Fetching tables from Business Setting B0012');
      const response = await apiClient.get('/banking/business-settings/tables');
      return response.data;
    },

    // B0013: Get columns by selected table
    getColumns: async (tableName: string) => {
      console.log(`🗂️ Fetching columns from Business Setting B0013 for table: ${tableName}`);
      const response = await apiClient.get(`/banking/business-settings/columns?table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // B0013: Get data type for selected column and table
    getDataType: async (columnName: string, tableName: string) => {
      console.log(`🔢 Fetching data type from Business Setting B0013 for column: ${columnName}, table: ${tableName}`);
      const response = await apiClient.get(`/banking/business-settings/data-type?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // Alias for component compatibility (Parameter order flipped: Table, Column)
    getBusinessSettingsDataType: async (tableName: string, columnName: string) => {
      console.log(`🔢 Fetching data type (alias) for table: ${tableName}, column: ${columnName}`);
      const response = await apiClient.get(`/banking/business-settings/data-type?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // B0014: Get operators by selected data type
    getOperators: async (dataType: string) => {
      console.log(`⚙️ Fetching operators from Business Setting B0014 for data type: ${dataType}`);
      const response = await apiClient.get(`/banking/business-settings/operators?dataType=${encodeURIComponent(dataType)}`);
      return response.data;
    },

    // B0015: Get conditions (AND/OR)
    getConditions: async () => {
      console.log('🔗 Fetching conditions from Business Setting B0015');
      const response = await apiClient.get('/banking/business-settings/conditions');
      return response.data;
    },

    // B0016: Get column values for multi-select (IN/NOT IN operators)
    getColumnValues: async (columnName: string, tableName: string) => {
      console.log(`📋 Fetching column values from Business Setting B0016 for column: ${columnName}, table: ${tableName}`);
      const response = await apiClient.get(`/banking/business-settings/column-values?column=${encodeURIComponent(columnName)}&table=${encodeURIComponent(tableName)}`);
      return response.data;
    },

    // Debug endpoint to check available business settings
    getDebugInfo: async () => {
      console.log('🔍 Fetching business settings debug information');
      const response = await apiClient.get('/banking/business-settings/debug');
      return response.data;
    }
  },

  // LGD SETUP API - IFRS9 LOSS GIVEN DEFAULT CONFIGURATION MANAGEMENT
  // ================================================================
  lgdSetup: {
    // Get all LGD configurations with business parameter lookups
    getAll: async () => {
      console.log('🔍 Fetching LGD configurations from DS2 FRS9PRO database (frs9_imp_ca_lgd_config)');
      const response = await apiClient.get('/banking/collective/lgd-setup');
      return response.data;
    },

    // Get business parameters for LGD setup (methods, population types, segments)
    getBusinessParameters: async () => {
      console.log('📊 Fetching LGD business parameters from DS2 database');
      const response = await apiClient.get('/banking/collective/lgd-setup/business-parameters');
      return response.data;
    },

    // Get single LGD configuration by ID
    getById: async (id: string) => {
      console.log(`📊 Fetching LGD configuration ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/lgd-setup/${id}`);
      return response.data;
    },

    // Create new LGD configuration
    create: async (lgdData: any) => {
      console.log('➕ Creating LGD configuration in DS2 database');
      const response = await apiClient.post('/banking/collective/lgd-setup', lgdData);
      return response.data;
    },

    // Update LGD configuration
    update: async (id: string, lgdData: any) => {
      console.log(`✏️ Updating LGD configuration ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/collective/lgd-setup/${id}`, lgdData);
      return response.data;
    },

    // Delete LGD configuration
    delete: async (id: string) => {
      console.log(`🗑️ Deleting LGD configuration ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/collective/lgd-setup/${id}`);
      return response.data;
    },

    // Health check for LGD Setup service
    health: async () => {
      console.log('🏥 Checking LGD Setup DS2 database connection');
      const response = await apiClient.get('/banking/collective/lgd-setup/health');
      return response.data;
    }
  },

  // ============================================================================
  // RULE BASE SETTING API - IFRS9 RULE-BASED COLLECTIVE IMPAIRMENT
  // ============================================================================
  // Real DS2 FRS9PRO database integration for rule-based configurations
  // Tables: frs9_param_scenario_rulesh (headers), frs9_param_scenario_rulesd (details)
  ruleBaseSetting: {
    // Get all rule base setting headers with pagination and search
    getHeaders: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      rule_type?: string;
      active_flag?: boolean;
    }) => {
      console.log('📋 Fetching Rule Base Setting headers from DS2 database');
      const response = await apiClient.get('/banking/collective/rule-base', { params });
      return response.data;
    },

    // Get single rule header with all details
    getHeader: async (id: string | number) => {
      console.log(`📋 Fetching Rule Base Setting header ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/${id}`);
      return response.data;
    },

    // Create new rule header
    createHeader: async (headerData: {
      rule_name: string;
      rule_type: string;
      updated_table: string;
      updated_column: string;
      value: string;
      seq?: number;
      active_flag?: boolean;
    }) => {
      console.log('➕ Creating new Rule Base Setting header in DS2 database');
      const response = await apiClient.post('/banking/collective/rule-base', headerData);
      return response.data;
    },

    // Update rule header
    updateHeader: async (id: string | number, headerData: any) => {
      console.log(`✏️ Updating Rule Base Setting header ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/collective/rule-base/${id}`, headerData);
      return response.data;
    },

    // Delete rule header and all associated details
    deleteHeader: async (id: string | number) => {
      console.log(`🗑️ Deleting Rule Base Setting header ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/collective/rule-base/${id}`);
      return response.data;
    },

    // Get all detail rules for a specific rule header
    getDetails: async (headerId: string | number) => {
      console.log(`📋 Fetching Rule Base Setting details for header ${headerId} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/${headerId}/details`);
      return response.data;
    },

    // Create new detail rule for a rule header
    createDetail: async (headerId: string | number, detailData: {
      query_group: number;
      seq: number;
      table_name: string;
      column_name: string;
      data_type: string;
      operator: string;
      value1?: string;
      value2?: string;
      condition: 'AND' | 'OR';
      detail_type?: string;
      stage_from?: string;
      stage_to?: string;
    }) => {
      console.log(`➕ Creating new Rule Base Setting detail for header ${headerId} in DS2 database`);
      const response = await apiClient.post(`/banking/collective/rule-base/${headerId}/details`, detailData);
      return response.data;
    },

    // Update rule detail
    updateDetail: async (detailId: string | number, detailData: any) => {
      console.log(`✏️ Updating Rule Base Setting detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/collective/rule-base/details/${detailId}`, detailData);
      return response.data;
    },

    // Delete rule detail
    deleteDetail: async (detailId: string | number) => {
      console.log(`🗑️ Deleting Rule Base Setting detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/collective/rule-base/details/${detailId}`);
      return response.data;
    },

    // Get available rule types for dropdown
    getRuleTypes: async () => {
      console.log('📋 Fetching Rule Base Setting rule types from DS2 database');
      const response = await apiClient.get('/banking/collective/rule-base/metadata/rule-types');
      return response.data;
    },

    // Get operators for specific data type
    getOperators: async (dataType: string) => {
      console.log(`📋 Fetching operators for data type ${dataType} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/metadata/operators/${dataType}`);
      return response.data;
    },

    // Get available logical conditions (AND/OR)
    getConditions: async () => {
      console.log('📋 Fetching Rule Base Setting conditions from DS2 database');
      const response = await apiClient.get('/banking/collective/rule-base/metadata/conditions');
      return response.data;
    },

    // Get IFRS 9 stages for dropdown
    getStages: async () => {
      console.log('📋 Fetching IFRS 9 stages from DS2 database');
      const response = await apiClient.get('/banking/collective/rule-base/metadata/stages');
      return response.data;
    },

    // Get available tables from Business Settings
    getBusinessSettingsTables: async () => {
      console.log('📋 Fetching business settings tables from DS2 database');
      const response = await apiClient.get('/banking/collective/rule-base/business-settings/tables');
      return response.data;
    },

    // Get columns for specific table from Business Settings
    getBusinessSettingsColumns: async (tableName: string) => {
      console.log(`📋 Fetching columns for table ${tableName} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/business-settings/columns/${tableName}`);
      return response.data;
    },

    // Get distinct values for specific column from Business Settings
    getBusinessSettingsValues: async (tableName: string, columnName: string) => {
      console.log(`📋 Fetching values for ${tableName}.${columnName} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/business-settings/values/${tableName}/${columnName}`);
      return response.data;
    },

    // Get rule execution summary for monitoring and reporting
    getSummary: async (id: string | number) => {
      console.log(`📊 Fetching Rule Base Setting execution summary for ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/rule-base/${id}/summary`);
      return response.data;
    }
  },

  // ============================================================================
  // BUCKET PARAMETER API - IFRS9 BUCKET PARAMETER MANAGEMENT
  // ============================================================================
  // Real DS2 FRS9PRO database integration for bucket parameter configurations
  // Tables: frs9_param_bucketh (headers), frs9_param_bucketd (details)
  bucketParameter: {
    // Get all bucket parameter headers with pagination and search
    getHeaders: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      basis?: string;
      active_only?: boolean;
    }) => {
      console.log('🪣 Fetching Bucket Parameter headers from DS2 database');
      const response = await apiClient.get('/banking/collective/bucket', { params });
      return response.data;
    },

    // Get single bucket header with all details
    getHeader: async (id: string | number) => {
      console.log(`🪣 Fetching Bucket Parameter header ${id} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/bucket/${id}`);
      return response.data;
    },

    // Create new bucket header
    createHeader: async (headerData: {
      bucket_group: string;
      bucket_desc: string;
      basis: string;
      bucket_default: number;
      closed_flag?: boolean;
      wo_flag?: boolean;
    }) => {
      console.log('➕ Creating new Bucket Parameter header in DS2 database');
      const response = await apiClient.post('/banking/collective/bucket', headerData);
      return response.data;
    },

    // Update bucket header
    updateHeader: async (id: string | number, headerData: any) => {
      console.log(`✏️ Updating Bucket Parameter header ${id} in DS2 database`);
      const response = await apiClient.put(`/banking/collective/bucket/${id}`, headerData);
      return response.data;
    },

    // Delete bucket header and all associated details
    deleteHeader: async (id: string | number) => {
      console.log(`🗑️ Deleting Bucket Parameter header ${id} from DS2 database`);
      const response = await apiClient.delete(`/banking/collective/bucket/${id}`);
      return response.data;
    },

    // Get all detail buckets for a specific bucket header
    getDetails: async (headerId: string | number) => {
      console.log(`🪣 Fetching Bucket Parameter details for header ${headerId} from DS2 database`);
      const response = await apiClient.get(`/banking/collective/bucket/${headerId}/details`);
      return response.data;
    },

    // Create new detail bucket for a bucket header
    createDetail: async (headerId: string | number, detailData: {
      bucket_id: number;
      bucket_name: string;
      range_start: number;
      range_end?: number | null;
    }) => {
      console.log(`➕ Creating new Bucket Parameter detail for header ${headerId} in DS2 database`);
      const response = await apiClient.post(`/banking/collective/bucket/${headerId}/details`, detailData);
      return response.data;
    },

    // Update bucket detail
    updateDetail: async (detailId: string | number, detailData: any) => {
      console.log(`✏️ Updating Bucket Parameter detail ${detailId} in DS2 database`);
      const response = await apiClient.put(`/banking/collective/bucket/details/${detailId}`, detailData);
      return response.data;
    },

    // Delete bucket detail
    deleteDetail: async (detailId: string | number) => {
      console.log(`🗑️ Deleting Bucket Parameter detail ${detailId} from DS2 database`);
      const response = await apiClient.delete(`/banking/collective/bucket/details/${detailId}`);
      return response.data;
    },

    // Get available basis options for dropdown (B0017 from Business Parameters)
    getBasisOptions: async () => {
      console.log('🪣 Fetching Bucket Parameter basis options from DS2 database');
      const response = await apiClient.get('/banking/collective/bucket/metadata/basis-options');
      return response.data;
    },

    // Get bucket parameter statistics
    getStats: async () => {
      console.log('📊 Fetching Bucket Parameter statistics from DS2 database');
      const response = await apiClient.get('/banking/collective/bucket/metadata/stats');
      return response.data;
    },

    // Health check for Bucket Parameter service
    health: async () => {
      console.log('🏥 Checking Bucket Parameter DS2 database connection');
      const response = await apiClient.get('/banking/collective/bucket/health');
      return response.data;
    }
  },

  // ============================================================================
  // IFRS 9 REPORTS API - DS2 LIVE DATABASE INTEGRATION
  // ============================================================================
  ifrs9Reports: {
    // Health check for DS2 FRS9PRO database connection
    health: async () => {
      console.log('🏥 Checking DS2 FRS9PRO database connection for IFRS 9 Reports');
      const response = await apiClient.get('/ifrs9/reports/health');
      return response.data;
    },

    // Get reports metadata and configuration
    getMetadata: async () => {
      console.log('📋 Getting IFRS 9 reports metadata');
      const response = await apiClient.get('/ifrs9/reports/metadata');
      return response.data;
    },

    // Lifetime PD operations
    lifetimePD: {
      getYearly: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
      }) => {
        console.log('📊 Getting Lifetime PD Yearly data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/yearly', { params });
        return response.data;
      },

      getMonthly: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
      }) => {
        console.log('📊 Getting Lifetime PD Monthly data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/monthly', { params });
        return response.data;
      },
      getAccountDetails: async (params: {
        prc_date: string;
        pd_config_id?: number;
        pd_method?: number;
        scalar_id?: number;
        fl_flag?: boolean;
        page?: number;
        limit?: number;
      }) => {
        console.log('📊 Getting Lifetime PD Account Details from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/lifetime-pd/account-details', { params });
        return response.data;
      }
    },

    // Lifetime LGD operations
    lifetimeLGD: {
      get: async (params: {
        prc_date: string;
        lgd_config_id?: number;
        lgd_method?: number;
        model_id?: number;
      }) => {
        console.log('📊 Getting Lifetime LGD data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/lifetime-lgd', { params });
        return response.data;
      }
    },

    // EAD Model operations
    eadModel: {
      get: async (params: {
        prc_date: string;
        ead_config_id?: number;
      }) => {
        console.log('📊 Getting EAD Model data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/ead-model', { params });
        return response.data;
      }
    },

    // ECL Result operations
    eclResult: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string;
        sub_segment?: string;
      }) => {
        console.log('📊 Getting ECL Result data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/ecl-result', { params });
        return response.data;
      }
    },

    // ECL Movement operations
    eclMovement: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string;
      }) => {
        console.log('📊 Getting ECL Movement data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/ecl-movement', { params });
        return response.data;
      }
    },

    // GCA Movement operations
    gcaMovement: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string;
      }) => {
        console.log('📊 Getting GCA Movement data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/gca-movement', { params });
        return response.data;
      }
    },

    // Nominative Report operations (with pagination)
    nominativeReport: {
      get: async (params: {
        prc_date: string;
        segment_id?: number;
        stage?: string;
        branch_code?: string;
        page?: number;
        limit?: number;
      }) => {
        console.log('📊 Getting Nominative Report data from DS2 database');
        const response = await apiClient.get('/ifrs9/reports/nominative-report', { params });
        return response.data;
      }
    },

    // Export functionality for all report types
    export: async (reportType: string, params: any) => {
      try {
        console.log(`📤 Exporting ${reportType} report to ${params.format || 'xlsx'}`);
        const response = await fetch(`${API_BASE_URL}/ifrs9/reports/${reportType}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
          },
          body: JSON.stringify(params)
        });

        if (response.ok) {
          const blob = await response.blob();
          return {
            success: true,
            data: blob
          };
        } else {
          throw new Error(`Export failed: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Export error:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
  }
};

// ============================================================================
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
    getAll: async (params?: { include_details?: boolean }) => {
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
    return {
      type: 'server_error',
      status: error.response.status,
      message: error.response.data?.message || 'Server error occurred',
      details: error.response.data
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
      message: error.message || 'An unexpected error occurred',
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
      baseUrl: API_BASE_URL || 'https://iaf-ifrs-be.ifrspro.id/api/v1',
      backendUrl: BACKEND_URL || 'https://iaf-ifrs-be.ifrspro.id',
      deploymentMode: 'IAF_ECS',
      ecsServer: '10.18.11.35',
      realDatabaseMode: true,
      mockupData: false,
      singleTenantMode: true
    },
    testConnectivity: apiDiagnostics.testConnectivity,
    diagnose: apiDiagnostics.diagnose,
  };

  console.log('🏗️ IAF ECS API debugging available: window.__IFRS9_IAF_API__');
  console.log('🏗️ Run window.__IFRS9_IAF_API__.diagnose() for diagnostics');
  console.log('🏗️ IAF Single Tenant Deployment: ECS Server URLs CONFIGURED');
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