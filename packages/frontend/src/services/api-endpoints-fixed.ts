// packages/frontend/src/services/api-endpoints-fixed.ts
// ============================================================================
// 🚨 CRITICAL FIX: API Endpoint Path Standardization
// ============================================================================
// PROBLEM: Base URL already includes /api/v1, but individual services are adding it again
// SOLUTION: Remove duplicate /api/v1 prefixes from all endpoint paths
// ============================================================================

// 🎯 The Fix: All routes should NOT include /api/v1 prefix since it's in the base URL
// BEFORE: https://iaf-ifrs-be.ifrspro.id/api/v1 + /api/v1/auth/login = ❌ WRONG (duplicate)
// AFTER:  https://iaf-ifrs-be.ifrspro.id/api/v1 + /auth/login = ✅ CORRECT

// ============================================================================
// 🚀 ENDPOINT MAPPING FOR SERVICES - USE THESE INSTEAD OF /api/v1/ PREFIXES
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password'
  },

  // User endpoints
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ENABLE: (id: string) => `/users/${id}/enable`,
    DISABLE: (id: string) => `/users/${id}/disable`
  },

  // Platform endpoints (admin functionality)
  PLATFORM: {
    USERS: {
      LIST: '/platform/users',
      GET: (id: string) => `/platform/users/${id}`,
      CREATE: '/platform/users',
      UPDATE: (id: string) => `/platform/users/${id}`,
      DELETE: (id: string) => `/platform/users/${id}`,
      ACTIVATE: (id: string) => `/platform/users/${id}/activate`,
      DEACTIVATE: (id: string) => `/platform/users/${id}/deactivate`
    },
    BANKING_INSTITUTIONS: {
      LIST: '/platform/banking-institutions',
      GET: (id: string) => `/platform/banking-institutions/${id}`,
      CREATE: '/platform/banking-institutions',
      UPDATE: (id: string) => `/platform/banking-institutions/${id}`,
      DELETE: (id: string) => `/platform/banking-institutions/${id}`,
      PROVISION_DATABASE: (institutionId: string) => `/platform/banking-institutions/${institutionId}/provision-database`
    },
    CONSULTANT_PROJECTS: {
      LIST: '/platform/consultant-projects',
      GET: (id: string) => `/platform/consultant-projects/${id}`,
      CREATE: '/platform/consultant-projects',
      UPDATE: (id: string) => `/platform/consultant/projects/${id}`,
      DELETE: (id: string) => `/platform/consultant/projects/${id}`,
      ASSIGN_CONSULTANT: (projectId: string) => `/platform/consultant/projects/${projectId}/assign-consultant`
    },
    METRICS: '/platform/metrics',
    HEALTH: '/platform/health',
    USAGE: (tenantId?: string) => tenantId ? `/platform/usage/${tenantId}` : '/platform/usage'
  },

  // Tenant-specific endpoints
  TENANT: (tenantId: string) => ({
    // Portfolio endpoints
    PORTFOLIO: {
      ACCOUNTS: {
        LIST: `/tenants/${tenantId}/portfolio/accounts`,
        GET: (id: string) => `/tenants/${tenantId}/portfolio/accounts/${id}`,
        CREATE: `/tenants/${tenantId}/portfolio/accounts`,
        UPDATE: (id: string) => `/tenants/${tenantId}/portfolio/accounts/${id}`,
        DELETE: (id: string) => `/tenants/${tenantId}/portfolio/accounts/${id}`,
        BULK_IMPORT: `/tenants/${tenantId}/portfolio/accounts/bulk-import`
      }
    },

    // ECL calculation endpoints
    ECL: {
      CALCULATIONS: {
        LIST: `/tenants/${tenantId}/ecl/calculations`,
        GET: (id: string) => `/tenants/${tenantId}/ecl/calculations/${id}`,
        CREATE: `/tenants/${tenantId}/ecl/calculations`,
        BATCH: `/tenants/${tenantId}/ecl/calculations/batch`,
        JOB: (jobId: string) => `/tenants/${tenantId}/ecl/calculations/jobs/${jobId}`
      }
    },

    // Model configuration endpoints
    MODELS: {
      CONFIGURATIONS: {
        LIST: `/tenants/${tenantId}/models/configurations`,
        GET: (id: string) => `/tenants/${tenantId}/models/configurations/${id}`,
        CREATE: `/tenants/${tenantId}/models/configurations`,
        UPDATE: (id: string) => `/tenants/${tenantId}/models/configurations/${id}`,
        DELETE: (id: string) => `/tenants/${tenantId}/models/configurations/${id}`
      }
    }
  }),

  // Consultant endpoints
  CONSULTANT: {
    PROJECTS: {
      LIST: '/consultant/projects',
      GET: (id: string) => `/consultant/projects/${id}`,
      UPDATE_PROGRESS: (id: string) => `/consultant/projects/${id}/progress`,
      VALIDATE_ACCESS: (projectId: string, tenantId: string) => `/consultant/projects/${projectId}/tenant-access/${tenantId}`,
      DELIVERABLES: {
        LIST: (projectId: string) => `/consultant/projects/${projectId}/deliverables`,
        CREATE: '/consultant/deliverables',
        UPDATE: (id: string) => `/consultant/deliverables/${id}`
      },
      KNOWLEDGE_TRANSFER: (projectId: string) => `/consultant/projects/${projectId}/knowledge-transfer`,
      CREATE_SESSION: (projectId: string) => `/consultant/projects/${projectId}/knowledge-transfer`
    },
    VALIDATIONS: {
      LIST: '/consultant/validations',
      GET: (id: string) => `/consultant/validations/${id}`,
      CREATE: '/consultant/validations',
      SUBMIT: (id: string) => `/consultant/validations/${id}/submit`
    }
  },

  // User activity endpoints
  USER_ACTIVITY: '/user-activity',

  // Individual impairment endpoints
  INDIVIDUAL_IMPAIRMENT: '/banking/individual/impairment',

  // Rule base setting endpoints
  RULE_BASE_SETTING: '/banking/collective/rule-base',

  // Bucket parameter endpoints
  BUCKET_PARAMETER: '/banking/collective/bucket',

  // Banking API endpoints
  BANKING: {
    HEALTH: '/banking/health',
    SETUP: {
      APPLICATION: '/banking/setup/application',
      BUSINESS: '/banking/setup/business'
    },
    PARAMETERS: {
      PRODUCT: '/banking/parameters/product',
      JOURNAL: '/banking/parameters/journal'
    },
    SEGMENTATION: '/banking/segmentation',
    PD_SETUP: '/banking/pd-setup',
    BUSINESS_SETTINGS: '/banking/business-settings',
    COLLECTIVE: {
      FL_SCALAR: '/banking/collective/fl-scalar',
      LGD_SETUP: '/banking/collective/lgd-setup'
    }
  },

  // IFRS9 calculation endpoints
  IFRS9: {
    CALCULATIONS: '/ifrs9/calculations',
    CALCULATION_BATCHES: '/ifrs9/calculation-batches',
    PORTFOLIO_SUMMARY: '/ifrs9/portfolio/summary',
    ACTIVITIES_RECENT: '/ifrs9/activities/recent',
    STAGING_ANALYZE: '/ifrs9/staging/analyze',
    PD_CALCULATE: '/ifrs9/pd/calculate',
    LGD_CALCULATE: '/ifrs9/lgd/calculate',
    EAD_COMPUTE: '/ifrs9/ead/compute',

    REPORTS: '/ifrs9/reports'
  },

  // File upload endpoints
  UPLOAD: '/upload',

  // Health check endpoints
  HEALTH: '/health'
};

export default API_ENDPOINTS;

// ============================================================================
// ✅ USAGE EXAMPLES:
//
// Instead of:
// await apiClient.post('/api/v1/auth/login', credentials)  // ❌ Wrong (duplicate)
//
// Use:
// await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)  // ✅ Correct
//
// Or use the path directly:
// await apiClient.post('/auth/login', credentials)  // ✅ Also correct
//
// Both approaches will result in: https://iaf-ifrs-be.ifrspro.id/api/v1/auth/login
// ============================================================================