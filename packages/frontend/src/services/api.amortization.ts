import { apiClient } from './api-client';

export const amortizationAPI = {
    getAll: async (params?: { page: number; limit: number; search?: string }) => {
        // API returns { success: true, data: [...], pagination: {...} }
        // We return the full response object
        const response = await apiClient.get('/banking/ifrs9/amortization-module', { params });
        return response.data;
    },

    getContractDetails: async (accountNumber: string) => {
        const response = await apiClient.get('/banking/ifrs9/amortization-module/contract-details', {
            params: { accountNumber }
        });
        return response.data;
    },

    getEvents: async (accountId: string) => {
        const response = await apiClient.get('/banking/ifrs9/amortization-module/events', {
            params: { accountId }
        });
        return response.data;
    },

    getJournalDetails: async (accountId: string) => {
        const response = await apiClient.get('/banking/ifrs9/amortization-module/journal-details', {
            params: { accountId }
        });
        return response.data;
    }
};
