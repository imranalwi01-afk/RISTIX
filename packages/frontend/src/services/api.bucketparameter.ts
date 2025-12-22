// packages/frontend/src/services/api.bucketparameter.ts
// ============================================================================
// BUCKET PARAMETER API SERVICE - PHASE 3 MODULE 3.3
// ============================================================================
// Frontend API service for bucket parameter operations
// Features: Complete CRUD, range validation, metadata operations
// Legacy compliance: ASP.NET MVC bucket parameter API functionality
// ============================================================================

import { apiClient } from './api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface BucketParameterHeader {
  id?: number;
  bucket_name: string;
  bucket_description?: string;
  bucket_type: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag: boolean;
  seq?: number;
  detail_count?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface BucketParameterDetail {
  id?: number;
  bucket_header_id?: number;
  range_from: number;
  range_to: number;
  bucket_label: string;
  bucket_code: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight: number;
  active_flag: boolean;
  seq: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface BucketParameterHeaderCreateData {
  bucket_name: string;
  bucket_description?: string;
  bucket_type: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag?: boolean;
  seq?: number;
}

export interface BucketParameterDetailCreateData {
  range_from: number;
  range_to: number;
  bucket_label: string;
  bucket_code: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight?: number;
  active_flag?: boolean;
  seq: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  bucket_type?: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  active_flag?: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

export interface RangeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  gaps: Array<{ from: number; to: number }>;
  overlaps: Array<{ 
    detail1: { id: number; range_from: number; range_to: number; bucket_label: string };
    detail2: { id: number; range_from: number; range_to: number; bucket_label: string };
  }>;
}

export interface ServiceHealth {
  database_connection: 'healthy' | 'unhealthy';
  models_loaded: boolean;
  last_check: string;
  bucket_count: number;
  detail_count: number;
}

// ============================================================================
// BUCKET PARAMETER API SERVICE CLASS
// ============================================================================

export class BucketParameterAPI {
  private readonly baseUrl = '/api/v1/banking/collective/bucket';

  // ==========================================================================
  // HEADER OPERATIONS
  // ==========================================================================

  /**
   * Get all bucket parameter headers with pagination and search
   */
  async getHeaders(params?: PaginationParams): Promise<ApiResponse<BucketParameterHeader[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.bucket_type) queryParams.append('bucket_type', params.bucket_type);
      if (params?.active_flag !== undefined) queryParams.append('active_flag', params.active_flag.toString());

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching bucket parameter headers:', error);
      throw error;
    }
  }

  /**
   * Get single bucket parameter header with details
   */
  async getHeader(id: number): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
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
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter header
   */
  async updateHeader(id: number, data: Partial<BucketParameterHeaderCreateData>): Promise<ApiResponse<BucketParameterHeader>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating bucket parameter header:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter header and all details
   */
  async deleteHeader(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
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
  async getDetails(headerId: number): Promise<ApiResponse<BucketParameterDetail[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${headerId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bucket parameter details:', error);
      throw error;
    }
  }

  /**
   * Create new detail for a bucket header
   */
  async createDetail(headerId: number, data: BucketParameterDetailCreateData): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${headerId}/details`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Update bucket parameter detail
   */
  async updateDetail(detailId: number, data: Partial<BucketParameterDetailCreateData>): Promise<ApiResponse<BucketParameterDetail>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/details/${detailId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating bucket parameter detail:', error);
      throw error;
    }
  }

  /**
   * Delete bucket parameter detail
   */
  async deleteDetail(detailId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/details/${detailId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting bucket parameter detail:', error);
      throw error;
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get available bucket types for dropdown
   */
  async getBucketTypes(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/bucket-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bucket types:', error);
      throw error;
    }
  }

  /**
   * Get available range units for dropdown
   */
  async getRangeUnits(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/range-units`);
      return response.data;
    } catch (error) {
      console.error('Error fetching range units:', error);
      throw error;
    }
  }

  // ==========================================================================
  // VALIDATION & UTILITY OPERATIONS
  // ==========================================================================

  /**
   * Validate bucket ranges for gaps and overlaps
   */
  async validateRanges(headerId: number): Promise<ApiResponse<RangeValidation>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${headerId}/validate-ranges`);
      return response.data;
    } catch (error) {
      console.error('Error validating bucket ranges:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<ApiResponse<ServiceHealth>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service health:', error);
      throw error;
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS
  // ==========================================================================

  /**
   * Bulk create bucket details for a header
   */
  async bulkCreateDetails(headerId: number, details: BucketParameterDetailCreateData[]): Promise<ApiResponse<BucketParameterDetail[]>> {
    try {
      // Note: This would require a new backend endpoint for bulk operations
      const results = await Promise.all(
        details.map(detail => this.createDetail(headerId, detail))
      );
      
      const successResults = results.filter(r => r.success);
      const errors = results.filter(r => !r.success);
      
      if (errors.length > 0) {
        console.warn('Some details failed to create:', errors);
      }
      
      return {
        success: errors.length === 0,
        data: successResults.map(r => r.data!),
        message: `Created ${successResults.length} of ${details.length} bucket details`
      };
    } catch (error) {
      console.error('Error bulk creating bucket details:', error);
      throw error;
    }
  }

  /**
   * Validate bucket configuration before saving
   */
  async validateBucketConfiguration(
    header: BucketParameterHeaderCreateData, 
    details: BucketParameterDetailCreateData[]
  ): Promise<ApiResponse<boolean>> {
    try {
      // Client-side validation
      const errors: string[] = [];
      
      // Header validation
      if (!header.bucket_name?.trim()) {
        errors.push('Bucket name is required');
      }
      
      if (!header.bucket_type) {
        errors.push('Bucket type is required');
      }
      
      if (header.min_range !== undefined && header.max_range !== undefined) {
        if (header.min_range >= header.max_range) {
          errors.push('Minimum range must be less than maximum range');
        }
      }
      
      // Details validation
      if (!details || details.length === 0) {
        errors.push('At least one bucket range is required');
      }
      
      details.forEach((detail, index) => {
        if (!detail.bucket_label?.trim()) {
          errors.push(`Detail ${index + 1}: Bucket label is required`);
        }
        
        if (!detail.bucket_code?.trim()) {
          errors.push(`Detail ${index + 1}: Bucket code is required`);
        }
        
        if (detail.range_from >= detail.range_to) {
          errors.push(`Detail ${index + 1}: Range from must be less than range to`);
        }
        
        if (detail.pd_rate !== undefined && (detail.pd_rate < 0 || detail.pd_rate > 1)) {
          errors.push(`Detail ${index + 1}: PD rate must be between 0 and 1`);
        }
        
        if (detail.lgd_rate !== undefined && (detail.lgd_rate < 0 || detail.lgd_rate > 1)) {
          errors.push(`Detail ${index + 1}: LGD rate must be between 0 and 1`);
        }
        
        if (detail.weight < 0 || detail.weight > 1) {
          errors.push(`Detail ${index + 1}: Weight must be between 0 and 1`);
        }
      });
      
      // Check for duplicate bucket codes
      const bucketCodes = details.map(d => d.bucket_code);
      const duplicateCodes = bucketCodes.filter((code, index) => bucketCodes.indexOf(code) !== index);
      if (duplicateCodes.length > 0) {
        errors.push(`Duplicate bucket codes found: ${duplicateCodes.join(', ')}`);
      }
      
      // Check for range overlaps
      for (let i = 0; i < details.length; i++) {
        for (let j = i + 1; j < details.length; j++) {
          const detail1 = details[i];
          const detail2 = details[j];
          
          // Check if ranges overlap
          if (!(detail1.range_to <= detail2.range_from || detail2.range_to <= detail1.range_from)) {
            errors.push(`Range overlap detected between '${detail1.bucket_label}' and '${detail2.bucket_label}'`);
          }
        }
      }
      
      if (errors.length > 0) {
        return {
          success: false,
          error: errors.join('; ')
        };
      }
      
      return {
        success: true,
        data: true,
        message: 'Validation passed'
      };
    } catch (error) {
      console.error('Error validating bucket configuration:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  /**
   * Generate bucket code based on type and sequence
   */
  generateBucketCode(bucketType: string, sequence: number): string {
    const prefix = {
      'AGING': 'AGE',
      'RATING': 'RTG',
      'AMOUNT': 'AMT',
      'CUSTOM': 'CST'
    }[bucketType] || 'BKT';
    
    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate bucket label based on type and range
   */
  generateBucketLabel(
    bucketType: string, 
    rangeFrom: number, 
    rangeTo: number, 
    rangeUnit?: string
  ): string {
    const unit = rangeUnit ? ` ${rangeUnit.toLowerCase()}` : '';
    
    if (bucketType === 'AGING') {
      if (rangeFrom === 0) {
        return `Current (0${unit})`;
      } else if (rangeTo >= 999999) {
        return `${rangeFrom}+${unit}`;
      } else {
        return `${rangeFrom}-${rangeTo}${unit}`;
      }
    } else if (bucketType === 'RATING') {
      return `Rating ${rangeFrom}-${rangeTo}`;
    } else if (bucketType === 'AMOUNT') {
      return `${rangeFrom.toLocaleString()}-${rangeTo.toLocaleString()}`;
    } else {
      return `Range ${rangeFrom}-${rangeTo}`;
    }
  }

  /**
   * Check if two ranges overlap
   */
  rangesOverlap(from1: number, to1: number, from2: number, to2: number): boolean {
    return !(to1 <= from2 || to2 <= from1);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const bucketParameterAPI = new BucketParameterAPI();
export default bucketParameterAPI;