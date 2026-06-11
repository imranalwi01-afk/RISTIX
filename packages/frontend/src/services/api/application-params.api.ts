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
      console.log('📋 Fetching application parameter headers from real database', params);
      const response = await apiClient.get('/banking/setup/application', { params });
      return response.data;
    },

    getById: async (id: string) => {
      console.log(`📄 Fetching application parameter header ${id} from real database`);
      const response = await apiClient.get(`/banking/setup/application/${id}`);
      return response.data;
    },

    create: async (headerData: any) => {
      console.log('➕ Creating application parameter header in real database');
      const response = await apiClient.post('/banking/setup/application', headerData);
      return response.data;
    },

    update: async (id: string, headerData: any) => {
      console.log(`✏️ Updating application parameter header ${id} in real database`);
      const response = await apiClient.put(`/banking/setup/application/${id}`, headerData);
      return response.data;
    },

    delete: async (id: string) => {
      console.log(`🗑️ Deleting application parameter header ${id} from real database`);
      const response = await apiClient.delete(`/banking/setup/application/${id}`);
      return response.data;
    }
  },

  // Detail operations
  details: {
    getForHeader: async (headerId: string) => {
      console.log(`📋 Fetching details for application parameter header ${headerId}`);
      const response = await apiClient.get(`/banking/setup/application/${headerId}/details`);
      return response.data;
    },

    create: async (headerId: string, detailData: any) => {
      console.log(`➕ Creating detail for application parameter header ${headerId}`);
      const response = await apiClient.post(`/banking/setup/application/${headerId}/details`, detailData);
      return response.data;
    },

    update: async (detailId: string, detailData: any) => {
      console.log(`✏️ Updating application parameter detail ${detailId}`);
      const response = await apiClient.put(`/banking/setup/application/details/${detailId}`, detailData);
      return response.data;
    },

    delete: async (detailId: string) => {
      console.log(`🗑️ Deleting application parameter detail ${detailId}`);
      const response = await apiClient.delete(`/banking/setup/application/details/${detailId}`);
      return response.data;
    }
  },

  // Utility operations
  health: async () => {
    console.log('🏥 Checking application parameter service health');
    const response = await apiClient.get('/banking/health');
    return response.data;
  },

  metadata: async () => {
    console.log('📋 Getting application parameter metadata');
    const response = await apiClient.get('/banking/metadata');
    return response.data;
  }
};