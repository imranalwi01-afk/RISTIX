// packages/frontend/src/app/platform/admin/segmentation/SegmentationDataProvider.ts
// ============================================================================
// 🔧 REACT ADMIN DATA PROVIDER - SEGMENTATION API INTEGRATION (FIXED VERSION)
// ============================================================================
// ✅ INTEGRATION: Connects React Admin to existing segmentation API endpoints
// ✅ FEATURES: Full CRUD operations, pagination, sorting, filtering  
// ✅ API: Uses api.banking.segmentation service from existing implementation
// ✅ ERROR HANDLING: Enhanced error handling with proper fallback logic
// ============================================================================

import { DataProvider, GetListParams, GetListResult, GetOneParams, GetOneResult, CreateParams, CreateResult, UpdateParams, UpdateResult, DeleteParams, DeleteResult } from 'react-admin';
import { api } from '../../../../services/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SegmentationHeader {
  id: number; // React Admin expects 'id' field
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq?: number;
  active_flag: boolean;
  detail_count?: number;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

interface SegmentationDetail {
  id: number;
  pkid: number;
  param_code: string;
  param_seq: number;
  table_name?: string;
  column_name?: string;
  data_type?: string;
  operator?: string;
  value1?: string;
  value2?: string;
  value3?: string;
  is_active: boolean;
  header_id: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform API response to React Admin format
 * React Admin expects 'id' field, our API uses 'pkid'
 */
const transformHeaderForReactAdmin = (header: any): SegmentationHeader => ({
  id: header.pkid || header.id,
  pkid: header.pkid || header.id,
  group_segment: header.group_segment || '',
  segment: header.segment || '',
  sub_segment: header.sub_segment || '',
  segment_type: header.segment_type || '',
  seq: header.seq || undefined,
  active_flag: Boolean(header.active_flag),
  detail_count: header.detail_count || 0,
  createdby: header.created_by || header.createdby,
  createddate: header.created_date || header.createddate,
  updatedby: header.updated_by || header.updatedby,
  updateddate: header.updated_date || header.updateddate,
});

/**
 * Transform React Admin data to API format
 */
const transformHeaderForApi = (header: any) => ({
  group_segment: header.group_segment,
  segment: header.segment,
  sub_segment: header.sub_segment || null,
  segment_type: header.segment_type,
  seq: header.seq || 1,
  active_flag: Boolean(header.active_flag),
});

// ============================================================================
// MINIMAL FALLBACK DATA (Only for extreme network issues)
// ============================================================================

const minimalFallbackHeaders: SegmentationHeader[] = [
  {
    id: 1,
    pkid: 1,
    group_segment: 'API Connection Error',
    segment: 'Please check network connection',
    sub_segment: 'Fallback mode active',
    segment_type: 'ERROR',
    seq: 1,
    active_flag: false,
    detail_count: 0,
  }
];

// ============================================================================
// ENHANCED SEGMENTATION DATA PROVIDER
// ============================================================================

const SegmentationDataProvider: DataProvider = {
  
  // ============================================================================
  // GET LIST - Fetch paginated list with enhanced error handling
  // ============================================================================
  getList: async (resource: string, params: GetListParams): Promise<GetListResult> => {
    if (resource !== 'segmentation') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    console.log('📋 SegmentationDataProvider.getList called with params:', params);

    try {
      // Build API parameters
      const apiParams: any = {
        page: params.pagination.page,
        limit: params.pagination.perPage,
      };

      // Add search parameter
      if (params.filter.q) {
        apiParams.search = params.filter.q;
      }

      // Add sort parameters
      if (params.sort) {
        apiParams.sortBy = params.sort.field;
        apiParams.sortOrder = params.sort.order === 'ASC' ? 'asc' : 'desc';
      }

      // Add other filters
      const otherFilters = { ...params.filter };
      delete otherFilters.q; // Remove search filter as it's handled separately
      Object.keys(otherFilters).forEach(key => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== '') {
          apiParams[key] = otherFilters[key];
        }
      });

      console.log('📤 Calling api.banking.segmentation.getHeaders with params:', apiParams);

      // Call the existing API with enhanced error catching
      const response = await api.banking.segmentation.getHeaders(apiParams);
      
      console.log('📥 API Response received:', {
        success: response.success,
        dataLength: response.data?.length,
        total: response.pagination?.total || response.total,
        hasData: !!response.data
      });

      if (response.success && response.data) {
        // Transform API response for React Admin
        const transformedData = response.data.map(transformHeaderForReactAdmin);
        
        const result: GetListResult = {
          data: transformedData,
          total: response.pagination?.total || response.total || transformedData.length,
        };

        console.log('✅ SegmentationDataProvider.getList success:', {
          recordCount: result.data.length,
          totalRecords: result.total,
          page: params.pagination.page
        });
        
        return result;
      } else {
        console.error('❌ API returned unsuccessful response:', response);
        throw new Error(response.message || 'API returned unsuccessful response');
      }

    } catch (error: any) {
      console.error('❌ SegmentationDataProvider.getList error:', error);
      
      // Enhanced error analysis
      const errorDetails = {
        message: error.message,
        status: error.status,
        name: error.name,
        timestamp: new Date().toISOString()
      };
      
      console.error('🔍 Detailed error analysis:', errorDetails);
      
      // Check for specific error types
      if (error.message?.includes('401') || error.message?.includes('Authentication') || error.message?.includes('token')) {
        console.error('🔐 Authentication error detected');
        throw new Error('Authentication required. Please refresh the page and log in again.');
      }
      
      if (error.message?.includes('403') || error.message?.includes('Forbidden') || error.message?.includes('permission')) {
        console.error('🚫 Permission error detected');
        throw new Error('Insufficient permissions to access segmentation data.');
      }
      
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.error('🔍 Endpoint not found error');
        throw new Error('Segmentation API endpoint not found. Please check the backend configuration.');
      }
      
      // Only use minimal fallback for severe network issues
      if (error.message?.includes('Network') || error.message?.includes('fetch') || error.name === 'TypeError') {
        console.warn('🌐 Network error detected - using minimal fallback');
        
        return {
          data: minimalFallbackHeaders,
          total: minimalFallbackHeaders.length,
        };
      }
      
      // For all other errors, throw them to surface the real issue
      throw error;
    }
  },

  // ============================================================================
  // GET ONE - Fetch single record
  // ============================================================================
  getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
    if (resource !== 'segmentation') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    console.log('📄 SegmentationDataProvider.getOne called with id:', params.id);

    try {
      const response = await api.banking.segmentation.getHeader(Number(params.id));

      if (response.success && response.data) {
        const transformedData = transformHeaderForReactAdmin(response.data);
        console.log('✅ SegmentationDataProvider.getOne success');
        return { data: transformedData };
      } else {
        throw new Error(response.message || `Header ${params.id} not found`);
      }

    } catch (error: any) {
      console.error('❌ SegmentationDataProvider.getOne error:', error);
      throw new Error(`Failed to fetch segmentation header ${params.id}: ${error.message}`);
    }
  },

  // ============================================================================
  // CREATE - Create new record
  // ============================================================================
  create: async (resource: string, params: CreateParams): Promise<CreateResult> => {
    if (resource !== 'segmentation') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    console.log('➕ SegmentationDataProvider.create called with data:', params.data);

    try {
      const apiData = transformHeaderForApi(params.data);
      const response = await api.banking.segmentation.createHeader(apiData);

      if (response.success && response.data) {
        const transformedData = transformHeaderForReactAdmin(response.data);
        console.log('✅ SegmentationDataProvider.create success');
        return { data: transformedData };
      } else {
        throw new Error(response.message || 'Failed to create segmentation header');
      }

    } catch (error: any) {
      console.error('❌ SegmentationDataProvider.create error:', error);
      throw new Error(`Failed to create segmentation header: ${error.message}`);
    }
  },

  // ============================================================================
  // UPDATE - Update existing record
  // ============================================================================
  update: async (resource: string, params: UpdateParams): Promise<UpdateResult> => {
    if (resource !== 'segmentation') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    console.log('✏️ SegmentationDataProvider.update called with id:', params.id, 'data:', params.data);

    try {
      const apiData = transformHeaderForApi(params.data);
      const response = await api.banking.segmentation.updateHeader(Number(params.id), apiData);

      if (response.success && response.data) {
        const transformedData = transformHeaderForReactAdmin(response.data);
        console.log('✅ SegmentationDataProvider.update success');
        return { data: transformedData };
      } else {
        throw new Error(response.message || `Failed to update header ${params.id}`);
      }

    } catch (error: any) {
      console.error('❌ SegmentationDataProvider.update error:', error);
      throw new Error(`Failed to update segmentation header ${params.id}: ${error.message}`);
    }
  },

  // ============================================================================
  // DELETE - Delete record
  // ============================================================================
  delete: async (resource: string, params: DeleteParams): Promise<DeleteResult> => {
    if (resource !== 'segmentation') {
      throw new Error(`Unknown resource: ${resource}`);
    }

    console.log('🗑️ SegmentationDataProvider.delete called with id:', params.id);

    try {
      const response = await api.banking.segmentation.deleteHeader(Number(params.id));

      if (response.success) {
        console.log('✅ SegmentationDataProvider.delete success');
        return { data: { id: params.id } as any };
      } else {
        throw new Error(response.message || `Failed to delete header ${params.id}`);
      }

    } catch (error: any) {
      console.error('❌ SegmentationDataProvider.delete error:', error);
      throw new Error(`Failed to delete segmentation header ${params.id}: ${error.message}`);
    }
  },

  // ============================================================================
  // ADDITIONAL METHODS (Required by React Admin)
  // ============================================================================
  getMany: async (resource: string, params: { ids: any[] }) => {
    console.log('📋 SegmentationDataProvider.getMany called with ids:', params.ids);
    const promises = params.ids.map(id => 
      SegmentationDataProvider.getOne(resource, { id })
        .then(result => result.data)
        .catch(error => {
          console.error(`Failed to fetch ${resource} ${id}:`, error);
          return null;
        })
    );
    const results = await Promise.all(promises);
    return { data: results.filter(Boolean) };
  },

  getManyReference: async (resource: string, params: any) => {
    console.log('📋 SegmentationDataProvider.getManyReference called');
    return SegmentationDataProvider.getList(resource, params);
  },

  deleteMany: async (resource: string, params: { ids: any[] }) => {
    console.log('🗑️ SegmentationDataProvider.deleteMany called with ids:', params.ids);
    const promises = params.ids.map(id => 
      SegmentationDataProvider.delete(resource, { id })
        .catch(error => {
          console.error(`Failed to delete ${resource} ${id}:`, error);
          return null;
        })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },

  updateMany: async (resource: string, params: { ids: any[], data: any }) => {
    console.log('✏️ SegmentationDataProvider.updateMany called');
    const promises = params.ids.map(id => 
      SegmentationDataProvider.update(resource, { id, data: params.data, previousData: {} })
        .catch(error => {
          console.error(`Failed to update ${resource} ${id}:`, error);
          return null;
        })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};

export default SegmentationDataProvider;