import { apiClient } from '../api-client';

export interface RuleHeader {
  id?: number;
  rule_name: string;
  rule_type: string;
  updated_table: string;
  updated_column: string;
  value?: string;
  seq?: number;
  active_flag?: boolean;
}

export interface RuleDetail {
  id?: number;
  rule_id?: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator?: string;
  value1?: string;
  value2?: string;
  condition?: string;
  detail_type?: string;
  stage_from?: string;
  stage_to?: string;
}

export const ruleBaseSettingsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; rule_type?: string; active_flag?: boolean }) => {
    const response = await apiClient.get('/banking/collective/rule-base', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/banking/collective/rule-base/${id}`);
    return response.data;
  },

  create: async (data: RuleHeader) => {
    const response = await apiClient.post('/banking/collective/rule-base', data);
    return response.data;
  },

  update: async (id: number, data: Partial<RuleHeader>) => {
    const response = await apiClient.put(`/banking/collective/rule-base/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/banking/collective/rule-base/${id}`);
    return response.data;
  },

  // Details
  getDetails: async (ruleId: number) => {
    const response = await apiClient.get(`/banking/collective/rule-base/${ruleId}/details`);
    return response.data;
  },

  createDetail: async (ruleId: number, data: RuleDetail) => {
    const response = await apiClient.post(`/banking/collective/rule-base/${ruleId}/details`, data);
    return response.data;
  },

  updateDetail: async (detailId: number, data: Partial<RuleDetail>) => {
    const response = await apiClient.put(`/banking/collective/rule-base/details/${detailId}`, data);
    return response.data;
  },

  deleteDetail: async (detailId: number) => {
    const response = await apiClient.delete(`/banking/collective/rule-base/details/${detailId}`);
    return response.data;
  },

  // Metadata
  getRuleTypes: async () => {
    const response = await apiClient.get('/banking/collective/rule-base/metadata/rule-types');
    return response.data;
  },

  getOperators: async (dataType: string) => {
    const response = await apiClient.get(`/banking/collective/rule-base/metadata/operators/${dataType}`);
    return response.data;
  },

  getConditions: async () => {
    const response = await apiClient.get('/banking/collective/rule-base/metadata/conditions');
    return response.data;
  },

  getStages: async () => {
    const response = await apiClient.get('/banking/collective/rule-base/metadata/stages');
    return response.data;
  }
};
