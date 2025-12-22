// packages/frontend/src/app/platform/providers/PlatformDataProvider.ts
// ============================================================================
// IFRS9 PLATFORM - REACT ADMIN DATA PROVIDER FOR PLATFORM ADMINISTRATION
// ============================================================================
// 🔄 Integrates React Admin with existing API service
// ✅ Uses real database data via existing api.ts patterns
// ✅ Supports multi-tenant platform operations
// ✅ Follows existing error handling and authentication
// ============================================================================

import { DataProvider } from 'react-admin'
import { api } from '@/services/api'

// ============================================================================
// PLATFORM API ENDPOINTS MAPPING
// ============================================================================

const PLATFORM_API_ENDPOINTS = {
  'tenants': '/platform/admin/tenants',
  'platform-users': '/platform/admin/users',
  'consultants': '/platform/admin/consultants',
  'infrastructure': '/platform/admin/infrastructure',
  'audit-logs': '/platform/admin/audit-logs',
  'support-tickets': '/platform/admin/support-tickets',
  'analytics': '/platform/admin/analytics'
}

// ============================================================================
// PLATFORM DATA PROVIDER IMPLEMENTATION
// ============================================================================

export const platformDataProvider: DataProvider = {
  
  // ============================================================================
  // GET LIST - Fetch paginated list of resources
  // ============================================================================
  getList: async (resource, params) => {
    console.log(`🔍 Platform Admin: Fetching ${resource} list`, params)
    
    const { page, perPage } = params.pagination || { page: 1, perPage: 25 }
    const { field, order } = params.sort || { field: 'id', order: 'ASC' }
    const filter = params.filter || {}

    try {
      // Map to platform admin API endpoints
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      // Build query parameters following existing API patterns
      const queryParams = {
        page: page,
        limit: perPage,
        sort: field,
        order: order.toLowerCase(),
        ...filter
      }

      // Use existing API client with platform admin context
      const response = await api.client.get(endpoint, { 
        params: queryParams,
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
        }
      })

      console.log(`✅ Platform Admin: ${resource} list fetched`, response.data)

      // Transform response to React Admin format
      return {
        data: response.data.data || response.data.items || [],
        total: response.data.total || response.data.pagination?.total || 0,
        pageInfo: {
          hasNextPage: response.data.pagination?.hasNext || false,
          hasPreviousPage: response.data.pagination?.hasPrevious || false,
        }
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to fetch ${resource}`, error)
      throw new Error(error.response?.data?.message || `Failed to fetch ${resource}`)
    }
  },

  // ============================================================================
  // GET ONE - Fetch single resource by ID
  // ============================================================================
  getOne: async (resource, params) => {
    console.log(`🔍 Platform Admin: Fetching ${resource} by ID`, params.id)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const response = await api.client.get(`${endpoint}/${params.id}`, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
        }
      })

      console.log(`✅ Platform Admin: ${resource} ${params.id} fetched`, response.data)

      return {
        data: response.data.data || response.data
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to fetch ${resource} ${params.id}`, error)
      throw new Error(error.response?.data?.message || `Failed to fetch ${resource}`)
    }
  },

  // ============================================================================
  // GET MANY - Fetch multiple resources by IDs
  // ============================================================================
  getMany: async (resource, params) => {
    console.log(`🔍 Platform Admin: Fetching multiple ${resource}`, params.ids)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const response = await api.client.get(endpoint, {
        params: {
          ids: params.ids.join(','),
          bulk: true
        },
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
        }
      })

      console.log(`✅ Platform Admin: Multiple ${resource} fetched`, response.data)

      return {
        data: response.data.data || response.data.items || []
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to fetch multiple ${resource}`, error)
      throw new Error(error.response?.data?.message || `Failed to fetch ${resource}`)
    }
  },

  // ============================================================================
  // GET MANY REFERENCE - Fetch resources related to another resource
  // ============================================================================
  getManyReference: async (resource, params) => {
    console.log(`🔍 Platform Admin: Fetching ${resource} reference`, params)

    const { page, perPage } = params.pagination || { page: 1, perPage: 25 }
    const { field, order } = params.sort || { field: 'id', order: 'ASC' }
    
    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const queryParams = {
        page: page,
        limit: perPage,
        sort: field,
        order: order.toLowerCase(),
        [params.target]: params.id,
        ...params.filter
      }

      const response = await api.client.get(endpoint, {
        params: queryParams,
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Reference-Target': params.target,
        }
      })

      console.log(`✅ Platform Admin: ${resource} reference fetched`, response.data)

      return {
        data: response.data.data || response.data.items || [],
        total: response.data.total || response.data.pagination?.total || 0,
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to fetch ${resource} reference`, error)
      throw new Error(error.response?.data?.message || `Failed to fetch ${resource}`)
    }
  },

  // ============================================================================
  // CREATE - Create new resource
  // ============================================================================
  create: async (resource, params) => {
    console.log(`➕ Platform Admin: Creating ${resource}`, params.data)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      // Add platform admin audit context
      const createData = {
        ...params.data,
        createdBy: 'platform_admin',
        createdAt: new Date().toISOString(),
        metadata: {
          ...params.data.metadata,
          createdVia: 'platform_admin_react_admin',
          source: 'platform_administration'
        }
      }

      const response = await api.client.post(endpoint, createData, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Action': 'create',
        }
      })

      console.log(`✅ Platform Admin: ${resource} created`, response.data)

      return {
        data: {
          ...response.data.data || response.data,
          id: response.data.data?.id || response.data.id || Date.now(),
        }
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to create ${resource}`, error)
      throw new Error(error.response?.data?.message || `Failed to create ${resource}`)
    }
  },

  // ============================================================================
  // UPDATE - Update existing resource
  // ============================================================================
  update: async (resource, params) => {
    console.log(`✏️ Platform Admin: Updating ${resource} ${params.id}`, params.data)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      // Add platform admin audit context
      const updateData = {
        ...params.data,
        updatedBy: 'platform_admin',
        updatedAt: new Date().toISOString(),
        metadata: {
          ...params.data.metadata,
          updatedVia: 'platform_admin_react_admin',
          source: 'platform_administration'
        }
      }

      const response = await api.client.put(`${endpoint}/${params.id}`, updateData, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Action': 'update',
        }
      })

      console.log(`✅ Platform Admin: ${resource} ${params.id} updated`, response.data)

      return {
        data: response.data.data || response.data
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to update ${resource} ${params.id}`, error)
      throw new Error(error.response?.data?.message || `Failed to update ${resource}`)
    }
  },

  // ============================================================================
  // UPDATE MANY - Update multiple resources
  // ============================================================================
  updateMany: async (resource, params) => {
    console.log(`✏️ Platform Admin: Bulk updating ${resource}`, params.ids, params.data)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const bulkData = {
        ids: params.ids,
        data: {
          ...params.data,
          updatedBy: 'platform_admin',
          updatedAt: new Date().toISOString(),
        }
      }

      const response = await api.client.put(`${endpoint}/bulk`, bulkData, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Action': 'bulk_update',
        }
      })

      console.log(`✅ Platform Admin: Bulk ${resource} update completed`, response.data)

      return {
        data: params.ids
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to bulk update ${resource}`, error)
      throw new Error(error.response?.data?.message || `Failed to bulk update ${resource}`)
    }
  },

  // ============================================================================
  // DELETE - Delete resource
  // ============================================================================
  delete: async (resource, params) => {
    console.log(`🗑️ Platform Admin: Deleting ${resource} ${params.id}`)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const response = await api.client.delete(`${endpoint}/${params.id}`, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Action': 'delete',
        },
        data: {
          deletedBy: 'platform_admin',
          deletedAt: new Date().toISOString(),
          reason: 'platform_admin_action'
        }
      })

      console.log(`✅ Platform Admin: ${resource} ${params.id} deleted`, response.data)

      return {
        data: response.data.data || { id: params.id }
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to delete ${resource} ${params.id}`, error)
      throw new Error(error.response?.data?.message || `Failed to delete ${resource}`)
    }
  },

  // ============================================================================
  // DELETE MANY - Delete multiple resources
  // ============================================================================
  deleteMany: async (resource, params) => {
    console.log(`🗑️ Platform Admin: Bulk deleting ${resource}`, params.ids)

    try {
      const endpoint = PLATFORM_API_ENDPOINTS[resource as keyof typeof PLATFORM_API_ENDPOINTS]
      if (!endpoint) {
        throw new Error(`Platform resource ${resource} not supported`)
      }

      const response = await api.client.delete(`${endpoint}/bulk`, {
        headers: {
          'X-Platform-Admin': 'true',
          'X-Resource-Type': resource,
          'X-Action': 'bulk_delete',
        },
        data: {
          ids: params.ids,
          deletedBy: 'platform_admin',
          deletedAt: new Date().toISOString(),
          reason: 'platform_admin_bulk_action'
        }
      })

      console.log(`✅ Platform Admin: Bulk ${resource} deletion completed`, response.data)

      return {
        data: params.ids
      }

    } catch (error: any) {
      console.error(`❌ Platform Admin: Failed to bulk delete ${resource}`, error)
      throw new Error(error.response?.data?.message || `Failed to bulk delete ${resource}`)
    }
  },

}

// ============================================================================
// PLATFORM DATA PROVIDER DIAGNOSTICS
// ============================================================================

export const platformDataProviderDiagnostics = {
  testConnection: async () => {
    try {
      console.log('🔧 Testing platform data provider connection...')
      const response = await api.client.get('/platform/admin/health', {
        headers: { 'X-Platform-Admin': 'true' }
      })
      console.log('✅ Platform data provider connection test passed', response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Platform data provider connection test failed', error)
      return { success: false, error }
    }
  },

  getSupportedResources: () => {
    return Object.keys(PLATFORM_API_ENDPOINTS)
  },

  getEndpointMapping: () => {
    return PLATFORM_API_ENDPOINTS
  }
}

export default platformDataProvider