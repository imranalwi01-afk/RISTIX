import { apiClient } from '../api-client';

export interface BucketHeader {
  id?: number;
  bucket_group: string;
  bucket_group_desc: string;
  basis: string;
  include_close: boolean;
  include_wo: boolean;
  active_flag?: boolean;
  created_date?: string;
  updated_date?: string;
}

export interface BucketDetail {
  id?: number;
  bucket_id?: number;
  bucket_name: string;
  range_start: number;
  range_end?: number | null;
  seq?: number;
  active_flag?: boolean;
}

export const bucketConfigurationsApi = {
  getAll: async (params?: { search?: string; basis?: string }) => {
    const response = await apiClient.get('/banking/collective/bucket', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/banking/collective/bucket/${id}`);
    return response.data;
  },

  create: async (data: BucketHeader) => {
    const response = await apiClient.post('/banking/collective/bucket', data);
    return response.data;
  },

  update: async (id: number, data: Partial<BucketHeader>) => {
    const response = await apiClient.put(`/banking/collective/bucket/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/banking/collective/bucket/${id}`);
    return response.data;
  },

  // Details
  getDetails: async (id: number) => {
    const response = await apiClient.get(`/banking/collective/bucket/${id}/details`);
    return response.data;
  },

  createDetail: async (id: number, data: BucketDetail) => {
    const response = await apiClient.post(`/banking/collective/bucket/${id}/details`, data);
    return response.data;
  },

  updateDetail: async (detailId: number, data: Partial<BucketDetail>) => {
    const response = await apiClient.put(`/banking/collective/bucket/details/${detailId}`, data);
    return response.data;
  },

  deleteDetail: async (detailId: number) => {
    const response = await apiClient.delete(`/banking/collective/bucket/details/${detailId}`);
    return response.data;
  }
};
