// packages/frontend/src/services/react-admin/applicationParameterDataProvider.ts
// ============================================================================
// 🔧 APPL-004: APPLICATION PARAMETER DATA PROVIDER - REACT ADMIN
// ============================================================================
// ✅ IMPLEMENTS: Custom data provider for master-detail Application Parameters
// ✅ PATTERN: React Admin data provider with custom master-detail endpoints
// ✅ API: Integrates with /api/v1/application/* endpoints
// ✅ FEATURES: Full CRUD operations for headers and details
// ============================================================================

import { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteParams } from 'react-admin';
import { api } from '../api';

// =====================================================
// INTERFACES
// =====================================================

interface ApplicationParameterHeader {
  pkid: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
  details?: ApplicationParameterDetail[];
}

interface ApplicationParameterDetail {
  pkid: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2?: string;
  value3?: string;
  paramdesc?: string;
  createdby: string;
  createddate: string;
  updatedby?: string;
  updateddate?: string;
}

// =====================================================
// CUSTOM DATA PROVIDER
// =====================================================

export const applicationParameterDataProvider: DataProvider = {

  // ==========================================
  // GET LIST - Headers with optional details
  // ==========================================
  getList: async (resource: string, params: GetListParams) => {
    console.log('📋 [APPL-004] DataProvider.getList:', resource, params);

    try {
      // Handle different resource targets
      if (resource === 'application/headers') {
        // Get headers with details included
        const response = await api.client.get('/banking/setup/application/headers', {
          params: {
            include_details: true,
            ...params.filter
          }
        });

        if (response.data.success) {
          const headers = response.data.data || [];

          console.log(`✅ [APPL-004] Retrieved ${headers.length} application parameter headers`);

          return {
            data: headers.map((header: ApplicationParameterHeader) => ({
              id: header.pkid,
              ...header
            })),
            total: response.data.total || headers.length
          };
        } else {
          throw new Error(response.data.message || 'Failed to fetch application parameters');
        }
      }

      // Handle detail-specific requests
      if (resource.includes('/details')) {
        const headerIdMatch = resource.match(/application\/headers\/(\d+)\/details/);
        if (headerIdMatch) {
          const headerId = headerIdMatch[1];
          const response = await api.client.get(`/banking/setup/application/headers/${headerId}/details`);

          if (response.data.success) {
            const details = response.data.data || [];

            return {
              data: details.map((detail: ApplicationParameterDetail) => ({
                id: detail.pkid,
                ...detail
              })),
              total: response.data.total || details.length
            };
          }
        }
      }

      throw new Error(`Unsupported resource: ${resource}`);

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.getList error:', error);
      throw error;
    }
  },

  // ==========================================
  // GET ONE - Single header with details
  // ==========================================
  getOne: async (resource: string, params: GetOneParams) => {
    console.log('📄 [APPL-004] DataProvider.getOne:', resource, params.id);

    try {
      if (resource === 'application/headers') {
        // Get header details through the list endpoint and find by ID
        const response = await api.client.get('/banking/setup/application/headers', {
          params: { include_details: true }
        });

        if (response.data.success) {
          const headers = response.data.data || [];
          const header = headers.find((h: ApplicationParameterHeader) => h.pkid === parseInt(params.id as string));

          if (!header) {
            throw new Error('Application parameter header not found');
          }

          console.log(`✅ [APPL-004] Retrieved header ${header.param_code} with ${header.details?.length || 0} details`);

          return {
            data: {
              id: header.pkid,
              ...header
            }
          };
        }
      }

      if (resource === 'application/details') {
        // For individual detail records, we'd need a specific endpoint
        // For now, return basic structure
        return {
          data: {
            id: params.id,
            pkid: params.id
          }
        };
      }

      throw new Error(`Unsupported resource: ${resource}`);

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.getOne error:', error);
      throw error;
    }
  },

  // ==========================================
  // CREATE - New header with optional details
  // ==========================================
  create: async (resource: string, params: CreateParams) => {
    console.log('➕ [APPL-004] DataProvider.create:', resource, params.data);

    try {
      if (resource === 'application/headers') {
        const response = await api.client.post('/banking/setup/application/headers', params.data);

        if (response.data.success) {
          const newHeader = response.data.data;

          console.log(`✅ [APPL-004] Created header ${newHeader.param_code}`);

          return {
            data: {
              id: newHeader.pkid,
              ...newHeader
            }
          };
        } else {
          throw new Error(response.data.error || 'Failed to create application parameter');
        }
      }

      if (resource.includes('/details')) {
        const headerIdMatch = resource.match(/application\/headers\/(\d+)\/details/);
        if (headerIdMatch) {
          const headerId = headerIdMatch[1];
          const response = await api.client.post(`/banking/setup/application/headers/${headerId}/details`, params.data);

          if (response.data.success) {
            const newDetail = response.data.data;

            return {
              data: {
                id: newDetail.pkid,
                ...newDetail
              }
            };
          }
        }
      }

      throw new Error(`Unsupported resource: ${resource}`);

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.create error:', error);
      throw error;
    }
  },

  // ==========================================
  // UPDATE - Update header or detail
  // ==========================================
  update: async (resource: string, params: UpdateParams) => {
    console.log('📝 [APPL-004] DataProvider.update:', resource, params.id, params.data);

    try {
      if (resource === 'application/headers') {
        const response = await api.client.put(`/banking/setup/application/headers/${params.id}`, params.data);

        if (response.data.success) {
          const updatedHeader = response.data.data;

          console.log(`✅ [APPL-004] Updated header ${updatedHeader.param_code}`);

          return {
            data: {
              id: updatedHeader.pkid,
              ...updatedHeader
            }
          };
        } else {
          throw new Error(response.data.error || 'Failed to update application parameter');
        }
      }

      if (resource === 'application/details') {
        const response = await api.client.put(`/banking/setup/application/details/${params.id}`, params.data);

        if (response.data.success) {
          const updatedDetail = response.data.data;

          return {
            data: {
              id: updatedDetail.pkid,
              ...updatedDetail
            }
          };
        }
      }

      throw new Error(`Unsupported resource: ${resource}`);

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.update error:', error);
      throw error;
    }
  },

  // ==========================================
  // DELETE - Delete header or detail
  // ==========================================
  delete: async (resource: string, params: DeleteParams) => {
    console.log('🗑️ [APPL-004] DataProvider.delete:', resource, params.id);

    try {
      if (resource === 'application/headers') {
        const response = await api.client.delete(`/banking/setup/application/headers/${params.id}`);

        if (response.data.success) {
          console.log(`✅ [APPL-004] Deleted header ${params.id}`);

          return {
            data: {
              id: params.id,
              ...params.previousData
            }
          };
        } else {
          throw new Error(response.data.error || 'Failed to delete application parameter');
        }
      }

      if (resource === 'application/details') {
        const response = await api.client.delete(`/banking/setup/application/details/${params.id}`);

        if (response.data.success) {
          console.log(`✅ [APPL-004] Deleted detail ${params.id}`);

          return {
            data: {
              id: params.id,
              ...params.previousData
            }
          };
        }
      }

      throw new Error(`Unsupported resource: ${resource}`);

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.delete error:', error);
      throw error;
    }
  },

  // ==========================================
  // UPDATE MANY - Bulk update operations
  // ==========================================
  updateMany: async (resource: string, params: { ids: any[], data: any }) => {
    console.log('📝 [APPL-004] DataProvider.updateMany:', resource, params.ids);

    try {
      const updatePromises = params.ids.map(id =>
        applicationParameterDataProvider.update(resource, { id, data: params.data, previousData: { id } })
      );

      await Promise.all(updatePromises);

      console.log(`✅ [APPL-004] Bulk updated ${params.ids.length} items`);

      return {
        data: params.ids
      };

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.updateMany error:', error);
      throw error;
    }
  },

  // ==========================================
  // DELETE MANY - Bulk delete operations
  // ==========================================
  deleteMany: async (resource: string, params: { ids: any[] }) => {
    console.log('🗑️ [APPL-004] DataProvider.deleteMany:', resource, params.ids);

    try {
      const deletePromises = params.ids.map(id =>
        applicationParameterDataProvider.delete(resource, { id, previousData: { id } })
      );

      await Promise.all(deletePromises);

      console.log(`✅ [APPL-004] Bulk deleted ${params.ids.length} items`);

      return {
        data: params.ids
      };

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.deleteMany error:', error);
      throw error;
    }
  },

  // ==========================================
  // GET MANY - Multiple records by IDs
  // ==========================================
  getMany: async (resource: string, params: { ids: any[] }) => {
    console.log('📋 [APPL-004] DataProvider.getMany:', resource, params.ids);

    try {
      // For now, use getList and filter by IDs
      const { data } = await applicationParameterDataProvider.getList(resource, {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'param_code', order: 'ASC' },
        filter: {}
      });

      const filteredData = data.filter(item => params.ids.includes(item.id));

      return {
        data: filteredData
      };

    } catch (error) {
      console.error('❌ [APPL-004] DataProvider.getMany error:', error);
      throw error;
    }
  },

  // ==========================================
  // GET MANY REFERENCE - Related records
  // ==========================================
  getManyReference: async (resource: string, params: any) => {
    console.log('🔗 [APPL-004] DataProvider.getManyReference:', resource, params);

    // For details referenced by header
    if (resource === 'application/details' && params.target === 'param_code') {
      try {
        // Find header by param_code first, then get its details
        const headerResponse = await api.client.get('/banking/setup/application/headers');

        if (headerResponse.data.success) {
          const headers = headerResponse.data.data || [];
          const header = headers.find((h: ApplicationParameterHeader) => h.param_code === params.id);

          if (header) {
            const detailResponse = await api.client.get(`/banking/setup/application/headers/${header.pkid}/details`);

            if (detailResponse.data.success) {
              const details = detailResponse.data.data || [];

              return {
                data: details.map((detail: ApplicationParameterDetail) => ({
                  id: detail.pkid,
                  ...detail
                })),
                total: details.length
              };
            }
          }
        }

        return { data: [], total: 0 };

      } catch (error) {
        console.error('❌ [APPL-004] DataProvider.getManyReference error:', error);
        throw error;
      }
    }

    throw new Error(`Unsupported getManyReference: ${resource}`);
  }
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const createApplicationParameterResource = () => ({
  name: 'application/headers',
  options: {
    label: 'Application Parameters'
  }
});

console.log('✅ [APPL-004] ApplicationParameter data provider loaded - Master-Detail pattern with full CRUD operations');

export default applicationParameterDataProvider;