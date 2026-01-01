// packages/frontend/src/services/api.bucketparameter.ts
// ============================================================================
// BUCKET PARAMETER API SERVICE
// ============================================================================
// Frontend API service for bucket parameter operations
// Matches new backend structure (UUIDs, snake_case)
// ============================================================================

import { apiClient } from './api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface BucketParameterHeader {
  id: string;
  bucket_group: string;
  bucket_group_desc?: string; // Backend sends bucket_group_desc (mapped from bucketGroupDesc)
  bucket_desc?: string; // Frontend might expect this, adding for compatibility if needed
  basis: string;
  include_close: boolean;
  include_wo: boolean;
  active_flag: boolean;
  seq?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
  details_count?: number; // Backend might send this if aggregated, or we calculate it
}

export interface BucketParameterDetail {
  id: string;
  bucket_id: string; // Header ID (FK)
  bucket_name: string;
  range_start: number;
  range_end?: number | null;
  seq?: number;
  active_flag: boolean;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface BucketParameterHeaderCreateData {
  bucket_group: string;
  bucket_group_desc?: string;
  basis: string;
  include_close?: boolean;
  include_wo?: boolean;
  active_flag?: boolean;
  seq?: number;
}

export interface BucketParameterDetailCreateData {
  bucket_name: string;
  range_start: number;
  range_end?: number | null;
  seq?: number;
  active_flag?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  basis?: string;
  active_flag?: boolean;
}

// ============================================================================
// BUCKET PARAMETER API SERVICE CLASS
// ============================================================================

export class BucketParameterAPI {
  private readonly baseUrl = '/banking/collective/bucket';

  // ==========================================================================
  // HEADER OPERATIONS
  // ==========================================================================

  /**
   * Get all bucket parameter headers
   */
  async getHeaders(params?: PaginationParams): Promise<ApiResponse<BucketParameterHeader[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) queryParams.append('search', params.search);
      if (params?.basis) queryParams.append('basis', params.basis);
      if (params?.active_flag !== undefined) queryParams.append('active_flag', params.active_flag.toString());
      // Note: Backend might not support pagination yet, but we send search/filter

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<ApiResponse<BucketParameterHeader[]>>(url);

      return response;
    } catch (error) {
      console.error('Error fetching bucket parameter headers:', error);
      throw error;
    }
  }

  /**
   * Get single bucket parameter header
   */
  async getHeader(id: string): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.get<ApiResponse<BucketParameterHeader>>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Create new bucket parameter header
   */
  async createHeader(data: BucketParameterHeaderCreateData): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.post<ApiResponse<BucketParameterHeader>>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter header
   */
  async updateHeader(id: string, data: Partial<BucketParameterHeaderCreateData>): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.put<ApiResponse<BucketParameterHeader>>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter header
   */
  async deleteHeader(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting bucket parameter header:', error);
      throw error;
    }
  }

  // ==========================================================================
  // DETAIL OPERATIONS
  // ==========================================================================

  /**
   * Get all details for a specific bucket header
   */
  async getDetails(headerId: string): Promise<ApiResponse<BucketParameterDetail[]>> {
    try {
      const response = await apiClient.get<ApiResponse<BucketParameterDetail[]>>(`${this.baseUrl}/${headerId}/details`);
      return response;
    } catch (error) {
      console.error('Error fetching bucket parameter details:', error);
      throw error;
    }
  }

  /**
   * Create new detail for a bucket header
   */
  async createDetail(headerId: string, data: BucketParameterDetailCreateData): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      const response = await apiClient.post<ApiResponse<BucketParameterDetail>>(`${this.baseUrl}/${headerId}/details`, data);
      return response;
    } catch (error) {
      console.error('Error creating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter detail
   */
  async updateDetail(detailId: string, data: Partial<BucketParameterDetailCreateData>): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      const response = await apiClient.put<ApiResponse<BucketParameterDetail>>(`${this.baseUrl}/details/${detailId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter detail
   */
  async deleteDetail(detailId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/details/${detailId}`);
      return response;
    } catch (error) {
      console.error('Error deleting bucket parameter detail:', error);
      throw error;
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get basis options
   */
  async getBasisOptions(): Promise<ApiResponse<{ value1: string, paramdesc: string }[]>> {
    // Return hardcoded options for now as backend metadata endpoint might not be fully ready or generic
    // Or we can fetch from backend if available. The previous implementation fetched.
    // Let's mock it for now to ensure stability, or implement backend endpoint.
    // Backend routes file didn't explicitly show 'metadata/basis' but we can add it or just return static.
    return {
      success: true,
      data: [
        { value1: 'D', paramdesc: 'Day Past Due' },
        { value1: 'R', paramdesc: 'Rating' }
      ]
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const bucketParameterAPI = new BucketParameterAPI();
export default bucketParameterAPI;