import { apiClient } from '../api-client';

export const applicationParameterAPI = {
  // Header operations
  headers: {
    getAll: async (params?: {
      include_details?: boolean;
      page?: number;
      offset?: number;
      limit?: number;
      search?: string;
      filters?: string;
      sort?: string;
      paginationMode?: 'client' | 'offset' | 'cursor';
    }) => {
      const response = await apiClient.get('/banking/setup/application', { params });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/banking/setup/application/${id}`);
      return response.data;
    },

    create: async (headerData: any) => {
      const response = await apiClient.post('/banking/setup/application', headerData);
      return response.data;
    },

    update: async (id: string, headerData: any) => {
      const response = await apiClient.put(`/banking/setup/application/${id}`, headerData);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/banking/setup/application/${id}`);
      return response.data;
    }
  },

  // Detail operations
  details: {
    getForHeader: async (headerId: string) => {
      const response = await apiClient.get(`/banking/setup/application/${headerId}/details`);
      return response.data;
    },

    create: async (headerId: string, detailData: any) => {
      const response = await apiClient.post(`/banking/setup/application/${headerId}/details`, detailData);
      return response.data;
    },

    update: async (detailId: string, detailData: any) => {
      const response = await apiClient.put(`/banking/setup/application/details/${detailId}`, detailData);
      return response.data;
    },

    delete: async (detailId: string) => {
      const response = await apiClient.delete(`/banking/setup/application/details/${detailId}`);
      return response.data;
    }
  },

  // Utility operations
  health: async () => {
    const response = await apiClient.get('/banking/health');
    return response.data;
  },

  metadata: async () => {
    const response = await apiClient.get('/banking/metadata');
    return response.data;
  }
};