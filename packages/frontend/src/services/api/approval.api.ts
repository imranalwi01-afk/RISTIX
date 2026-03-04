// packages/frontend/src/services/api/approval.api.ts
import { apiClient } from '../api-client';

export const approvalAPI = {
  // Get pending approvals for the current user
  getPendingApprovals: async () => {
    console.log('⏳ Fetching pending approvals');
    const response = await apiClient.get('/approvals/pending');
    return response.data;
  },

  // Get approval history (requests) with filters
  getApprovalHistory: async (params?: { entityType?: string; entityId?: string }) => {
    console.log('📜 Fetching approval history', params);
    const response = await apiClient.get('/approvals/requests', { params });
    return response.data;
  },

  // Get single request details
  getRequestDetails: async (id: string) => {
    console.log(`📄 Fetching approval request ${id}`);
    const response = await apiClient.get(`/approvals/requests/${id}`);
    return response.data;
  },

  // Create new approval request
  createRequest: async (data: {
    entityType: string;
    entityId?: string;
    title: string;
    description?: string;
    requestData?: any;
    impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    console.log('➕ Creating approval request', data.title);
    const response = await apiClient.post('/approvals/requests', data);
    return response.data;
  },

  // Approve a request
  approveRequest: async (id: string, data?: { comment?: string; conditions?: string; riskScore?: number }) => {
    console.log(`✅ Approving request ${id}`);
    const response = await apiClient.post(`/approvals/requests/${id}/approve`, data || {});
    return response.data;
  },

  // Reject a request
  rejectRequest: async (id: string, data?: { comment?: string }) => {
    console.log(`❌ Rejecting request ${id}`);
    const response = await apiClient.post(`/approvals/requests/${id}/reject`, data || {});
    return response.data;
  },

  // Cancel a request
  cancelRequest: async (id: string, data?: { reason?: string }) => {
    console.log(`🛑 Cancelling request ${id}`);
    const response = await apiClient.post(`/approvals/requests/${id}/cancel`, data || {});
    return response.data;
  },

  // Delegate a request
  delegateRequest: async (id: string, data: { delegatedTo: string; reason?: string }) => {
    console.log(`⏩ Delegating request ${id} to ${data.delegatedTo}`);
    const response = await apiClient.post(`/approvals/requests/${id}/delegate`, data);
    return response.data;
  },

  // Get approval matrices
  getMatrices: async () => {
    console.log('🕸️ Fetching approval matrices');
    const response = await apiClient.get('/approvals/matrices');
    return response.data;
  },

  // Create approval matrix
  createMatrix: async (data: any) => {
    console.log('➕ Creating approval matrix', data.name);
    const response = await apiClient.post('/approvals/matrices', data);
    return response.data;
  },

  // Update approval matrix
  updateMatrix: async (id: string, data: any) => {
    console.log(`✏️ Updating approval matrix ${id}`);
    const response = await apiClient.put(`/approvals/matrices/${id}`, data);
    return response.data;
  },

  // Get approval routing overview + candidate approvers
  getRoutingOverview: async (params?: {
    entityType?: string;
    operation?: 'create' | 'update' | 'delete';
    department?: string;
    bankingMode?: 'conventional' | 'syariah' | 'dual';
  }) => {
    console.log('🧭 Fetching approval routing overview', params);
    const response = await apiClient.get('/approvals/routing', { params });
    return response.data;
  },
};
