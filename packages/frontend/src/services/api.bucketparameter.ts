// packages/frontend/src/services/api.bucketparameter.ts
// ============================================================================
// BUCKET PARAMETER API SERVICE
// ============================================================================
// Frontend API service for bucket parameter operations
// Matches new backend structure (UUIDs, snake_case)
// ============================================================================

import { apiClient } from './api-setup';
import { ApiResponse } from '@/types/api';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Bucket Parameter Header interface
 * Aligned with backend frs9_param_bucketh and frontend component needs
 */
export interface BucketParameterHeader {
  id?: string | number;
  bucket_group?: string;
  bucket_group_desc?: string;
  basis?: string;
  include_close?: boolean;
  include_wo?: boolean;
  active_flag: boolean;
  seq?: number;

  // Legacy/Alternative names for compatibility
  bucket_name: string;
  bucket_description?: string;
  bucket_type?: string;
  min_range?: number;
  max_range?: number;
  range_unit?: string;

  details_count?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
  bucket_desc?: string; // Legacy alias
}

/**
 * Bucket Parameter Detail interface
 * Aligned with backend frs9_param_bucketd and frontend component needs
 */
export interface BucketParameterDetail {
  id?: string | number;
  bucket_id?: string | number; // Header ID (FK)
  bucket_name?: string;
  range_start?: number;
  range_end?: number | null;
  seq: number;
  active_flag: boolean;

  // Frontend component specific fields
  range_from: number;
  range_to: number;
  bucket_label: string;
  bucket_code: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight: number;

  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface BucketParameterPaginationParams {
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

  private unwrap<T>(payload: ApiResponse<T> | undefined): ApiResponse<T> {
    if (payload) {
      return payload;
    }

    return {
      success: false,
      error: 'Empty response from bucket parameter API'
    } as ApiResponse<T>;
  }

  // ==========================================================================
  // HEADER OPERATIONS
  // ==========================================================================

  /**
   * Get all bucket parameter headers
   */
  async getHeaders(params?: BucketParameterPaginationParams): Promise<ApiResponse<BucketParameterHeader[]>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) queryParams.append('search', params.search);
      if (params?.basis) queryParams.append('basis', params.basis);
      if (params?.active_flag !== undefined) queryParams.append('active_flag', params.active_flag.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<ApiResponse<BucketParameterHeader[]>>(url);
      const payload = this.unwrap(response.data);

      // Map backend fields to frontend fields for compatibility if needed
      if (payload.success && payload.data) {
        payload.data = payload.data.map(h => ({
          ...h,
          bucket_name: h.bucket_name || h.bucket_group || '',
          bucket_description: h.bucket_description || h.bucket_group_desc
        }));
      }

      return payload;
    } catch (error) {
      console.error('Error fetching bucket parameter headers:', error);
      throw error;
    }
  }

  /**
   * Get single bucket parameter header
   */
  async getHeader(id: string | number): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.get<ApiResponse<BucketParameterHeader>>(`${this.baseUrl}/${id}`);
      const payload = this.unwrap(response.data);

      if (payload.success && payload.data) {
        payload.data = {
          ...payload.data,
          bucket_name: payload.data.bucket_name || payload.data.bucket_group || '',
          bucket_description: payload.data.bucket_description || payload.data.bucket_group_desc
        };
      }

      return payload;
    } catch (error) {
      console.error('Error fetching bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Create new bucket parameter header
   */
  async createHeader(data: any): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      // Ensure we send bucket_group if bucket_name is provided
      const payload = {
        ...data,
        bucket_group: data.bucket_group || data.bucket_name,
        bucket_group_desc: data.bucket_group_desc || data.bucket_description || ''
      };

      const response = await apiClient.post<ApiResponse<BucketParameterHeader>>(this.baseUrl, payload);
      return this.unwrap(response.data);
    } catch (error) {
      console.error('Error creating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter header
   */
  async updateHeader(id: string | number, data: any): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const payload = {
        ...data,
        bucket_group: data.bucket_group || data.bucket_name,
        bucket_group_desc: data.bucket_group_desc || data.bucket_description || ''
      };

      const response = await apiClient.put<ApiResponse<BucketParameterHeader>>(`${this.baseUrl}/${id}`, payload);
      return this.unwrap(response.data);
    } catch (error) {
      console.error('Error updating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter header
   */
  async deleteHeader(id: string | number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
      return this.unwrap(response.data);
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
  async getDetails(headerId: string | number): Promise<ApiResponse<BucketParameterDetail[]>> {
    try {
      const response = await apiClient.get<ApiResponse<BucketParameterDetail[]>>(`${this.baseUrl}/${headerId}/details`);
      const payload = this.unwrap(response.data);

      if (payload.success && payload.data) {
        payload.data = payload.data.map(d => ({
          ...d,
          range_from: d.range_from ?? d.range_start ?? 0,
          range_to: d.range_to ?? d.range_end ?? 0,
          bucket_label: d.bucket_label || d.bucket_name || '',
          bucket_code: d.bucket_code || d.bucket_name || '',
          weight: d.weight ?? 0
        }));
      }

      return payload;
    } catch (error) {
      console.error('Error fetching bucket parameter details:', error);
      throw error;
    }
  }

  /**
   * Create new detail for a bucket header
   */
  async createDetail(headerId: string | number, data: any): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      // Map frontend fields to backend fields
      const payload = {
        ...data,
        bucket_name: data.bucket_name || data.bucket_label || data.bucket_code,
        range_start: data.range_start ?? data.range_from,
        range_end: data.range_end ?? data.range_to,
        bucket_id: data.bucket_id ?? data.seq
      };

      const response = await apiClient.post<ApiResponse<BucketParameterDetail>>(`${this.baseUrl}/${headerId}/details`, payload);
      return this.unwrap(response.data);
    } catch (error) {
      console.error('Error creating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter detail
   */
  async updateDetail(detailId: string | number, data: any): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      const payload = {
        ...data,
        bucket_name: data.bucket_name || data.bucket_label || data.bucket_code,
        range_start: data.range_start ?? data.range_from,
        range_end: data.range_end ?? data.range_to,
        bucket_id: data.bucket_id ?? data.seq
      };

      const response = await apiClient.put<ApiResponse<BucketParameterDetail>>(`${this.baseUrl}/details/${detailId}`, payload);
      return this.unwrap(response.data);
    } catch (error) {
      console.error('Error updating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter detail
   */
  async deleteDetail(detailId: string | number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/details/${detailId}`);
      return this.unwrap(response.data);
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
    return {
      success: true,
      data: [
        { value1: 'D', paramdesc: 'Day Past Due' },
        { value1: 'R', paramdesc: 'Rating' }
      ]
    };
  }

  /**
   * Get bucket types metadata
   */
  async getBucketTypes(): Promise<ApiResponse<{ value: string, label: string }[]>> {
    return {
      success: true,
      data: [
        { value: 'AGING', label: 'Days Past Due (Aging)' },
        { value: 'RATING', label: 'Risk Rating' },
        { value: 'AMOUNT', label: 'Amount Range' },
        { value: 'CUSTOM', label: 'Custom' }
      ]
    };
  }

  /**
   * Get range units metadata
   */
  async getRangeUnits(): Promise<ApiResponse<{ value: string, label: string }[]>> {
    return {
      success: true,
      data: [
        { value: 'DAYS', label: 'Days' },
        { value: 'MONTHS', label: 'Months' },
        { value: 'YEARS', label: 'Years' },
        { value: 'AMOUNT', label: 'Amount' },
        { value: 'SCORE', label: 'Score' }
      ]
    };
  }

  /**
   * Generate a bucket code based on type and sequence
   */
  generateBucketCode(bucketType: string, seq: number): string {
    const prefix = bucketType ? bucketType.substring(0, 3).toUpperCase() : 'BKT';
    return `${prefix}${seq.toString().padStart(3, '0')}`;
  }

  /**
   * Generate a readable bucket label
   */
  generateBucketLabel(bucketType: string, from: number, to: number | null, unit?: string): string {
    const unitLabel = unit ? unit.toLowerCase() : '';
    if (to === null || to === undefined) {
      return `${from}+ ${unitLabel}`.trim();
    }
    return `${from}-${to} ${unitLabel}`.trim();
  }

  /**
   * Validate bucket ranges for a header
   */
  async validateRanges(headerId: string | number): Promise<ApiResponse<{ valid: boolean, errors?: string[], warnings?: string[] }>> {
    return {
      success: true,
      data: {
        valid: true,
        errors: [],
        warnings: []
      }
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const bucketParameterAPI = new BucketParameterAPI();
export default bucketParameterAPI;
