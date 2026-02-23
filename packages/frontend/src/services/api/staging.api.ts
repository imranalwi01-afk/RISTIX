// packages/frontend/src/services/api/staging.api.ts
// ============================================================================
// IFRS9 Staging API Client
// ============================================================================

import { api } from '../api';

export interface StagingAnalysis {
  prcDate: string | null;
  stage: string | null;
  segmentId: number | null;
  totalOutstanding: number | null;
  totalECL: number | null;
  avgOutstanding: number | null;
}

export interface StagingSummary {
  totalOutstanding: number;
  totalECL: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  stage1ECL: number;
  stage2ECL: number;
  stage3ECL: number;
}

export const stagingApi = {
  // Get staging analysis data
  getStagingAnalysis: async (filters?: {
    startDate?: string;
    endDate?: string;
    stage?: string;
    segmentId?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.segmentId) params.append('segmentId', filters.segmentId.toString());

    const response = await api.client.get(`/banking/ifrs9/impairment-module/staging-analysis${params.toString() ? `?${params.toString()}` : ''}`);
    return response;
  },

  // Get staging summary
  getStagingSummary: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.client.get(`/banking/ifrs9/impairment-module/staging-summary${params}`);
    return response;
  },

  // Export staging data
  exportStagingData: async (filters?: {
    startDate?: string;
    endDate?: string;
    format?: 'excel' | 'csv';
  }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.format) params.append('format', filters.format);

    const response = await api.client.get(`/banking/ifrs9/impairment-module/staging-export${params.toString() ? `?${params.toString()}` : ''}`, {
      responseType: 'blob'
    });
    return response;
  }
};
