
import { individualImpairmentScopedClient as apiClient } from './individual-impairment-scoped-client';

export interface AuditTrail {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  performedAt: string;
  performedBy?: string;
}

export interface HistoryParams {
  entityType?: string;
  limit?: number;
  offset?: number;
}

export const individualImpairmentAPI = {
  // WATCHLIST
  getWatchlist: async (params?: {
    segment?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/banking/individual/impairment/watchlist', { params });
    return response.data;
  },
  getCustomerList: async (params?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/banking/individual/impairment/watchlist/customers', { params });
    return response.data;
  },
  addToWatchlist: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/watchlist', data);
    return response.data;
  },
  removeFromWatchlist: async (id: string) => {
    const response = await apiClient.delete(`/banking/individual/impairment/watchlist/${id}`);
    return response.data;
  },

  // ASSESSMENT
  getAssessment: async (accountId: string) => {
    const response = await apiClient.get(`/banking/individual/impairment/${accountId}`);
    return response.data;
  },
  createAssessment: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/assessment', data);
    return response.data;
  },
  submitAssessment: async (id: string, comments: string) => {
    const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/submit`, { comments });
    return response.data;
  },
  approveAssessment: async (id: string, comments: string) => {
    const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/approve`, { comments });
    return response.data;
  },
  rejectAssessment: async (id: string, reason: string) => {
    const response = await apiClient.post(`/banking/individual/impairment/assessment/${id}/reject`, { reason });
    return response.data;
  },

  // OVERRIDES
  getOverrides: async (params?: { status?: string; accountId?: string | number; accountNumber?: string; limit?: number; offset?: number }) => {
    const response = await apiClient.get('/banking/individual/impairment/overrides', { params });
    return response.data;
  },
  createOverride: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/overrides', data);
    return response.data;
  },

  // HISTORY
  getHistory: async (params: HistoryParams) => {
    const response = await apiClient.get('/banking/individual/impairment/history', { params });
    return response.data;
  },

  // REPORTS
  getReports: async (params?: {
    reportPeriod?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    page?: number;
    limit?: number;
    offset?: number;
    paginationMode?: 'offset' | 'cursor';
  }) => {
    const response = await apiClient.get('/banking/individual/impairment/reports', { params });
    return response.data;
  },
  createReport: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/reports', data);
    return response.data;
  },

  // SCENARIOS
  getScenarios: async (params?: { status?: string; accountId?: string | number }) => {
    const response = await apiClient.get('/banking/individual/impairment/scenarios', { params });
    return response.data;
  },
  createScenario: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/scenarios', data);
    return response.data;
  },
  updateScenarioStatus: async (id: string, status: string) => {
    const response = await apiClient.put(`/banking/individual/impairment/scenarios/${id}/status`, { status });
    return response.data;
  },

  // DCF
  getDcfUploads: async () => {
    const response = await apiClient.get('/banking/individual/impairment/dcf-uploads');
    return response.data;
  },
  getDcfCashflows: async (uploadId: string) => {
    const response = await apiClient.get(`/banking/individual/impairment/dcf-uploads/${uploadId}/cashflows`);
    return response.data;
  },
  createBatchUpload: async (data: any) => {
    const response = await apiClient.post('/banking/individual/impairment/dcf-uploads', data);
    return response.data;
  },
  getIaResultDetail: async (params: { accountId?: string | number; accountNumber?: string }) => {
    const response = await apiClient.get('/banking/individual/impairment/ia-results/detail', { params });
    return response.data;
  },
  getDcfCalculations: async () => {
    const response = await apiClient.get('/banking/individual/impairment/dcf-calculations');
    return response.data;
  }
};
