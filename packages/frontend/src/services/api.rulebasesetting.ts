// packages/frontend/src/services/api.rulebasesetting.ts
// ============================================================================
// RULE BASE SETTING API SERVICE - PHASE 3 MODULE 3.2
// ============================================================================
// Frontend API service for Rule Base Setting operations
// Features: Complete CRUD, metadata operations, Business Settings integration
// Legacy compliance: ASP.NET MVC ParamScenarioRules API functionality
// ============================================================================

import { apiClient } from './api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface RuleBaseSettingHeader {
  id?: number;
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq?: number;
  active_flag: boolean;
  detail_count?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface RuleBaseSettingDetail {
  id?: number;
  rule_id?: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: string;
  detail_type?: number;
  stage_from?: number;
  stage_to?: number;
  created_by?: string;
  created_date?: string;
  updated_by?: string;
  updated_date?: string;
}

export interface RuleBaseSettingHeaderCreateData {
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value: string;
  seq?: number;
  active_flag?: boolean;
}

export interface RuleBaseSettingDetailCreateData {
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: string;
  detail_type?: number;
  stage_from?: number;
  stage_to?: number;
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
  metadata?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  rule_type?: string;
  active_flag?: boolean | string;
}

export interface DropdownOption {
  value: string;
  label: string;
}

export interface OperatorOption {
  value: string;
  label: string;
  supportsMultiple?: boolean;
  requiresValue2?: boolean;
  requiresNoValues?: boolean;
}

export interface StageOption {
  value: number;
  label: string;
}

export interface BusinessSettingsOption {
  value: string;
  label: string;
}

export interface RuleExecutionSummary {
  rule_name: string;
  rule_type: string;
  target_table: string;
  target_column: string;
  target_value: string;
  total_conditions: number;
  query_groups: number;
  has_staging: boolean;
  active: boolean;
}

// ============================================================================
// RULE BASE SETTING API SERVICE CLASS
// ============================================================================

export class RuleBaseSettingAPI {
  private readonly baseUrl = '/banking/collective/rule-base';

  // ==========================================================================
  // HEADER OPERATIONS
  // ==========================================================================

  /**
   * Get all rule base setting headers with pagination and search
   */
  async getHeaders(params?: PaginationParams): Promise<ApiResponse<RuleBaseSettingHeader[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.rule_type) queryParams.append('rule_type', params.rule_type);
      if (params?.active_flag !== undefined) queryParams.append('active_flag', params.active_flag.toString());

      const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching rule base setting headers:', error);
      throw error;
    }
  }

  /**
   * Get single rule base setting header with details
   */
  async getHeader(id: number): Promise<ApiResponse<RuleBaseSettingHeader>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule base setting header:', error);
      throw error;
    }
  }

  /**
   * Create new rule base setting header
   */
  async createHeader(data: RuleBaseSettingHeaderCreateData): Promise<ApiResponse<RuleBaseSettingHeader>> {
    try {
      const response = await apiClient.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating rule base setting header:', error);
      throw error;
    }
  }

  /**
   * Update rule base setting header
   */
  async updateHeader(id: number, data: Partial<RuleBaseSettingHeaderCreateData>): Promise<ApiResponse<RuleBaseSettingHeader>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating rule base setting header:', error);
      throw error;
    }
  }

  /**
   * Delete rule base setting header and all details
   */
  async deleteHeader(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting rule base setting header:', error);
      throw error;
    }
  }

  // ==========================================================================
  // DETAIL OPERATIONS
  // ==========================================================================

  /**
   * Get all details for a specific rule header
   */
  async getDetails(ruleId: number): Promise<ApiResponse<RuleBaseSettingDetail[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${ruleId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule base setting details:', error);
      throw error;
    }
  }

  /**
   * Create new detail for a rule header
   */
  async createDetail(ruleId: number, data: RuleBaseSettingDetailCreateData): Promise<ApiResponse<RuleBaseSettingDetail>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${ruleId}/details`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating rule base setting detail:', error);
      throw error;
    }
  }

  /**
   * Update rule base setting detail
   */
  async updateDetail(detailId: number, data: Partial<RuleBaseSettingDetailCreateData>): Promise<ApiResponse<RuleBaseSettingDetail>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/details/${detailId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating rule base setting detail:', error);
      throw error;
    }
  }

  /**
   * Delete rule base setting detail
   */
  async deleteDetail(detailId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/details/${detailId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting rule base setting detail:', error);
      throw error;
    }
  }

  // ==========================================================================
  // METADATA OPERATIONS
  // ==========================================================================

  /**
   * Get available rule types for dropdown
   */
  async getRuleTypes(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/rule-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule types:', error);
      throw error;
    }
  }

  /**
   * Get operators for specific data type
   */
  async getOperators(dataType: string): Promise<ApiResponse<OperatorOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/operators/${encodeURIComponent(dataType)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  }

  /**
   * Get available logical conditions (AND/OR)
   */
  async getConditions(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/conditions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  }

  /**
   * Get IFRS 9 stages for dropdown
   */
  async getStages(): Promise<ApiResponse<StageOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/metadata/stages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stages:', error);
      throw error;
    }
  }

  // ==========================================================================
  // BUSINESS SETTINGS INTEGRATION
  // ==========================================================================

  /**
   * Get available tables from Business Settings (B0012)
   */
  async getBusinessSettingsTables(): Promise<ApiResponse<BusinessSettingsOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/business-settings/tables`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business settings tables:', error);
      throw error;
    }
  }

  /**
   * Get columns for specific table from Business Settings (B0013)
   */
  async getBusinessSettingsColumns(tableName: string): Promise<ApiResponse<BusinessSettingsOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/business-settings/columns/${encodeURIComponent(tableName)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business settings columns:', error);
      throw error;
    }
  }

  /**
   * Get distinct values for specific column from Business Settings (B0016)
   */
  async getBusinessSettingsValues(tableName: string, columnName: string): Promise<ApiResponse<BusinessSettingsOption[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/business-settings/values/${encodeURIComponent(tableName)}/${encodeURIComponent(columnName)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business settings values:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY OPERATIONS
  // ==========================================================================

  /**
   * Get rule execution summary for monitoring and reporting
   */
  async getRuleExecutionSummary(ruleId: number): Promise<ApiResponse<RuleExecutionSummary>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${ruleId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rule execution summary:', error);
      throw error;
    }
  }

  // ==========================================================================
  // BATCH OPERATIONS (FUTURE ENHANCEMENT)
  // ==========================================================================

  /**
   * Bulk create rule details for a rule header
   */
  async bulkCreateDetails(ruleId: number, details: RuleBaseSettingDetailCreateData[]): Promise<ApiResponse<RuleBaseSettingDetail[]>> {
    try {
      // Note: This would require a new backend endpoint for bulk operations
      const results = await Promise.all(
        details.map(detail => this.createDetail(ruleId, detail))
      );
      
      const successResults = results.filter(r => r.success);
      const errors = results.filter(r => !r.success);
      
      if (errors.length > 0) {
        console.warn('Some details failed to create:', errors);
      }
      
      return {
        success: errors.length === 0,
        data: successResults.map(r => r.data!),
        message: `Created ${successResults.length} of ${details.length} details`
      };
    } catch (error) {
      console.error('Error bulk creating rule details:', error);
      throw error;
    }
  }

  /**
   * Validate rule configuration before saving
   */
  async validateRule(header: RuleBaseSettingHeaderCreateData, details: RuleBaseSettingDetailCreateData[]): Promise<ApiResponse<boolean>> {
    try {
      // Client-side validation
      const errors: string[] = [];
      
      // Header validation
      if (!header.rule_name?.trim()) {
        errors.push('Rule name is required');
      }
      
      if (!header.rule_type?.trim()) {
        errors.push('Rule type is required');
      }
      
      if (!header.updated_table?.trim()) {
        errors.push('Updated table is required');
      }
      
      if (!header.updated_column?.trim()) {
        errors.push('Updated column is required');
      }
      
      if (!header.value?.trim()) {
        errors.push('Value is required');
      }
      
      // Details validation
      if (!details || details.length === 0) {
        errors.push('At least one rule condition is required');
      }
      
      details.forEach((detail, index) => {
        if (!detail.table_name?.trim()) {
          errors.push(`Detail ${index + 1}: Table name is required`);
        }
        
        if (!detail.column_name?.trim()) {
          errors.push(`Detail ${index + 1}: Column name is required`);
        }
        
        if (!detail.operator?.trim()) {
          errors.push(`Detail ${index + 1}: Operator is required`);
        }
        
        if (!detail.condition?.trim()) {
          errors.push(`Detail ${index + 1}: Condition is required`);
        }
        
        // Operator-specific validation
        if (detail.operator === 'BETWEEN' && (!detail.value1 || !detail.value2)) {
          errors.push(`Detail ${index + 1}: BETWEEN operator requires both values`);
        }
        
        if (['IS NULL', 'IS NOT NULL'].includes(detail.operator) && (detail.value1 || detail.value2)) {
          errors.push(`Detail ${index + 1}: ${detail.operator} operator should not have values`);
        }
      });
      
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
      console.error('Error validating rule configuration:', error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const ruleBaseSettingAPI = new RuleBaseSettingAPI();
export default ruleBaseSettingAPI;