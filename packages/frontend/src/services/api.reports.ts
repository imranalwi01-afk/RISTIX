import { apiClient } from './api-client';

export const reportsAPI = {
    nominativeReport: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/nominative-report', { params });
            return response.data;
        },
        getAvailableDates: async (params?: { download_start_date?: string; download_end_date?: string; limit?: number }) => {
            const response = await apiClient.get('/ifrs9/reports/nominative-report/available-dates', { params });
            return response.data;
        },
    },

    getProcessingDate: async () => {
        const response = await apiClient.get('/ifrs9/reports/processing-date');
        return response.data;
    },

    lifetimePD: {
        getYearly: async (params?: { prcDate?: string; pdModelId?: string; page?: string; limit?: string }) => {
            const response = await apiClient.get('/ifrs9/reports/lifetime-pd/yearly', { params });
            return response.data;
        },
        getMonthly: async (params?: { prcDate?: string; pdModelId?: string; page?: string; limit?: string }) => {
            const response = await apiClient.get('/ifrs9/reports/lifetime-pd/monthly', { params });
            return response.data;
        },
        getAccountDetails: async (params?: { prcDate?: string; pdModelId?: string; page?: string; limit?: string }) => {
            const response = await apiClient.get('/ifrs9/reports/lifetime-pd/account-details', { params });
            return response.data;
        }
    },

    lifetimeLGD: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/lifetime-lgd', { params });
            return response.data;
        },
        getSummary: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/lifetime-lgd/summary', { params });
            return response.data;
        }
    },

    eadModel: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/ead-model', { params });
            return response.data;
        }
    },

    eclResult: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/ecl-result', { params });
            return response.data;
        }
    },

    eclMovement: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/ecl-movement', { params });
            return response.data;
        }
    },

    gcaMovement: {
        get: async (params?: any) => {
            const response = await apiClient.get('/ifrs9/reports/gca-movement', { params });
            return response.data;
        }
    },

    export: async (reportType: string, params?: any) => {
        const response = await apiClient.post('/ifrs9/reports/export', { reportType, ...params }, { responseType: 'blob' });
        return response;
    }
};
