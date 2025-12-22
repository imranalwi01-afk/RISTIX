// packages/frontend/src/admin/providers/data/productParameterDataProvider.ts
// ============================================================================
// 🔧 PROD-006B: PRODUCT PARAMETER DATA PROVIDER - REACT ADMIN INTEGRATION
// ============================================================================
// ✅ IMPLEMENTS: React Admin data provider for Product Parameters
// ✅ PATTERN: React Admin DataProvider interface with API integration
// ✅ FEATURES: CRUD operations, filtering, pagination, sorting
// ✅ INTEGRATION: Product Parameter standalone CRUD API
// ============================================================================

import { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteParams } from 'react-admin';
import { api, handleAPIError } from '../../../services/api';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface ProductParameterData {
  pkid: number;
  data_source?: string;
  prd_group?: string;
  prd_type?: string;
  prd_code: string;
  prd_desc?: string;
  currency?: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bm_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag?: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

// ==========================================
// PRODUCT PARAMETER DATA PROVIDER
// ==========================================

export const productParameterDataProvider: DataProvider = {
  
  // ==========================================
  // GET LIST - WITH FILTERING & PAGINATION
  // ==========================================
  getList: async (resource: string, params: GetListParams) => {
    try {
      console.log('🔍 [PROD-006B] DataProvider.getList:', { resource, params });

      const { page = 1, perPage = 25 } = params.pagination || {};
      const { field = 'prd_code', order = 'ASC' } = params.sort || {};
      const { q: search, ...otherFilters } = params.filter || {};

      // Build query parameters
      const queryParams: any = {
        page,
        limit: perPage,
        sort_by: field,
        sort_order: order
      };

      // Add search if provided
      if (search) {
        queryParams.search = search;
      }

      // Add filters
      Object.keys(otherFilters).forEach(key => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== '') {
          queryParams[key] = otherFilters[key];
        }
      });

      // Call API
      const result = await api.banking.productParameters.getAll(queryParams);

      if (result.success && result.data) {
        const data = result.data.map((item: ProductParameterData) => ({
          ...item,
          id: item.pkid // React Admin requires 'id' field
        }));

        console.log('✅ [PROD-006B] DataProvider.getList success:', data.length, 'items');

        return {
          data,
          total: result.pagination?.total || data.length
        };
      } else {
        throw new Error(result.message || 'Failed to fetch product parameters');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.getList error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to fetch product parameters: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // GET ONE - SINGLE RECORD
  // ==========================================
  getOne: async (resource: string, params: GetOneParams) => {
    try {
      console.log('🔍 [PROD-006B] DataProvider.getOne:', { resource, id: params.id });

      const result = await api.banking.productParameters.getById(String(params.id));

      if (result.success && result.data) {
        const data = {
          ...result.data,
          id: result.data.pkid // React Admin requires 'id' field
        };

        console.log('✅ [PROD-006B] DataProvider.getOne success:', data.prd_code);

        return { data };
      } else {
        throw new Error(result.message || 'Product parameter not found');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.getOne error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to fetch product parameter: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // CREATE - NEW RECORD
  // ==========================================
  create: async (resource: string, params: CreateParams) => {
    try {
      console.log('✨ [PROD-006B] DataProvider.create:', { resource, data: params.data });

      // Extract data and remove React Admin 'id' if present
      const { id, ...createData } = params.data;

      const result = await api.banking.productParameters.create(createData);

      if (result.success && result.data) {
        const data = {
          ...result.data,
          id: result.data.pkid // React Admin requires 'id' field
        };

        console.log('✅ [PROD-006B] DataProvider.create success:', data.prd_code);

        return { data };
      } else {
        throw new Error(result.message || 'Failed to create product parameter');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.create error:', error);
      const errorInfo = handleAPIError(error);
      
      // Handle specific error cases
      if (errorInfo.message.includes('already exists')) {
        throw new Error('Product code already exists. Please use a different code.');
      }
      
      throw new Error(`Failed to create product parameter: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // UPDATE - EXISTING RECORD
  // ==========================================
  update: async (resource: string, params: UpdateParams) => {
    try {
      console.log('🔄 [PROD-006B] DataProvider.update:', { resource, id: params.id, data: params.data });

      // Extract data and remove React Admin 'id'
      const { id, ...updateData } = params.data;

      const result = await api.banking.productParameters.update(String(params.id), updateData);

      if (result.success && result.data) {
        const data = {
          ...result.data,
          id: result.data.pkid // React Admin requires 'id' field
        };

        console.log('✅ [PROD-006B] DataProvider.update success:', data.prd_code);

        return { data };
      } else {
        throw new Error(result.message || 'Failed to update product parameter');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.update error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to update product parameter: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // DELETE - REMOVE RECORD
  // ==========================================
  delete: async (resource: string, params: DeleteParams) => {
    try {
      console.log('🗑️ [PROD-006B] DataProvider.delete:', { resource, id: params.id });

      const result = await api.banking.productParameters.delete(String(params.id));

      if (result.success) {
        console.log('✅ [PROD-006B] DataProvider.delete success');

        return {
          data: { id: params.id } // React Admin expects the deleted record
        };
      } else {
        throw new Error(result.message || 'Failed to delete product parameter');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.delete error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to delete product parameter: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // GET MANY - MULTIPLE RECORDS BY IDS
  // ==========================================
  getMany: async (resource: string, params: { ids: any[] }) => {
    try {
      console.log('🔍 [PROD-006B] DataProvider.getMany:', { resource, ids: params.ids });

      // For now, get all and filter by IDs
      // In a real implementation, you might want a dedicated API endpoint
      const result = await api.banking.productParameters.getAll({
        limit: 1000 // Get a large number to ensure we get all requested IDs
      });

      if (result.success && result.data) {
        const allData = result.data.map((item: ProductParameterData) => ({
          ...item,
          id: item.pkid
        }));

        const data = allData.filter((item: any) => params.ids.includes(item.id));

        console.log('✅ [PROD-006B] DataProvider.getMany success:', data.length, 'items');

        return { data };
      } else {
        throw new Error(result.message || 'Failed to fetch product parameters');
      }

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.getMany error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to fetch product parameters: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // GET MANY REFERENCE - FOR REFERENCE FIELDS
  // ==========================================
  getManyReference: async (resource: string, params: any) => {
    try {
      console.log('🔍 [PROD-006B] DataProvider.getManyReference:', { resource, params });

      // For reference fields, just return getList with additional filtering
      return await productParameterDataProvider.getList(resource, {
        pagination: params.pagination,
        sort: params.sort,
        filter: {
          ...params.filter,
          [params.target]: params.id
        }
      });

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.getManyReference error:', error);
      const errorInfo = handleAPIError(error);
      throw new Error(`Failed to fetch product parameter references: ${errorInfo.message}`);
    }
  },

  // ==========================================
  // DELETE MANY - BULK DELETE
  // ==========================================
  deleteMany: async (resource: string, params: { ids: any[] }) => {
    try {
      console.log('🗑️ [PROD-006B] DataProvider.deleteMany:', { resource, ids: params.ids });

      // Delete each record individually
      // In a real implementation, you might want a bulk delete API endpoint
      const deletePromises = params.ids.map(id => 
        api.banking.productParameters.delete(String(id))
      );

      const results = await Promise.allSettled(deletePromises);

      // Check for failures
      const failures = results.filter((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to delete product ${params.ids[index]}:`, result.reason);
          return true;
        }
        if (result.status === 'fulfilled' && !result.value.success) {
          console.error(`❌ Failed to delete product ${params.ids[index]}:`, result.value.message);
          return true;
        }
        return false;
      });

      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} out of ${params.ids.length} product parameters`);
      }

      console.log('✅ [PROD-006B] DataProvider.deleteMany success:', params.ids.length, 'items deleted');

      return {
        data: params.ids
      };

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.deleteMany error:', error);
      throw new Error(`Bulk delete failed: ${error.message}`);
    }
  },

  // ==========================================
  // UPDATE MANY - BULK UPDATE
  // ==========================================
  updateMany: async (resource: string, params: { ids: any[]; data: any }) => {
    try {
      console.log('🔄 [PROD-006B] DataProvider.updateMany:', { resource, ids: params.ids, data: params.data });

      // Update each record individually
      // In a real implementation, you might want a bulk update API endpoint
      const updatePromises = params.ids.map(id => 
        api.banking.productParameters.update(String(id), params.data)
      );

      const results = await Promise.allSettled(updatePromises);

      // Check for failures
      const failures = results.filter((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Failed to update product ${params.ids[index]}:`, result.reason);
          return true;
        }
        if (result.status === 'fulfilled' && !result.value.success) {
          console.error(`❌ Failed to update product ${params.ids[index]}:`, result.value.message);
          return true;
        }
        return false;
      });

      if (failures.length > 0) {
        throw new Error(`Failed to update ${failures.length} out of ${params.ids.length} product parameters`);
      }

      console.log('✅ [PROD-006B] DataProvider.updateMany success:', params.ids.length, 'items updated');

      return {
        data: params.ids
      };

    } catch (error: any) {
      console.error('❌ [PROD-006B] DataProvider.updateMany error:', error);
      throw new Error(`Bulk update failed: ${error.message}`);
    }
  }
};

export default productParameterDataProvider;

console.log('✅ [PROD-006B] ProductParameterDataProvider loaded - React Admin data provider ready');