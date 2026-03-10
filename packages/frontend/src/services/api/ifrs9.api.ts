import { apiClient, API_BASE_URL } from '../api-setup';

// ============================================================================
// IFRS9 CALCULATION API - REAL DATABASE INTEGRATION
// ============================================================================
export const ifrs9API = {
    // Get IFRS9 calculation summary from real backend
    getCalculationsSummary: async (date?: string, mode?: string) => {
        console.log(`📊 Fetching IFRS9 calculation summary from real database${date ? ' for ' + date : ''} [Mode: ${mode || 'all'}]`);
        const response = await apiClient.get('/ifrs9/calculations/summary', { params: { date, mode } });
        return response.data;
    },

    // Get calculation batches from real backend
    getCalculationBatches: async (mode?: string) => {
        console.log('📋 Fetching IFRS9 calculation batches from real database');
        // ✅ NO FALLBACK: Let errors propagate for proper handling
        const response = await apiClient.get('/ifrs9/calculation-batches', { params: { mode } });
        return response.data;
    },

    // Get individual calculation results for a specific batch
    getCalculationResults: async (date: string, mode?: string) => {
        console.log(`📊 Fetching individual calculation results for ${date} [Mode: ${mode || 'all'}]`);
        const response = await apiClient.get('/ifrs9/calculations/batch-results', { params: { date, mode } });
        return response.data;
    },

    getPortfolioTrend: async (date?: string, mode?: string) => {
        console.log(`📉 Fetching portfolio trend from real database${date ? ' up to ' + date : ''} [Mode: ${mode || 'all'}]`);
        const response = await apiClient.get('/ifrs9/calculations/portfolio-trend', { params: { date, mode } });
        return response.data;
    },

    getAvailableDates: async (mode?: string) => {
        console.log('📅 Fetching available process dates from real database');
        const response = await apiClient.get('/ifrs9/available-dates', { params: { mode } });
        return response.data;
    },

    // Get portfolio summary from real backend
    getPortfolioSummary: async () => {
        console.log('📈 Fetching portfolio summary from real database');
        const response = await apiClient.get('/ifrs9/portfolio/summary');
        return response.data;
    },

    // Get recent activities from real backend
    getRecentActivities: async () => {
        console.log('📝 Fetching recent activities from real database');
        const response = await apiClient.get('/ifrs9/activities/recent');
        return response.data;
    },

    // Perform staging analysis on real backend
    performStagingAnalysis: async (data: any) => {
        console.log('🔍 Performing staging analysis on real data');
        const response = await apiClient.post('/ifrs9/staging/analyze', data);
        return response.data;
    },

    // Calculate PD on real backend
    calculatePD: async (data: any) => {
        console.log('📊 Calculating Probability of Default on real data');
        const response = await apiClient.post('/ifrs9/pd/calculate', data);
        return response.data;
    },

    // Calculate LGD on real backend
    calculateLGD: async (data: any) => {
        console.log('💰 Calculating Loss Given Default on real data');
        const response = await apiClient.post('/ifrs9/lgd/calculate', data);
        return response.data;
    },

    // Compute EAD on real backend
    computeEAD: async (data: any) => {
        console.log('💳 Computing Exposure at Default on real data');
        const response = await apiClient.post('/ifrs9/ead/compute', data);
        return response.data;
    },

    // Run ECL calculation on real backend
    runECLCalculation: async (config: any) => {
        console.log('🚀 Running real ECL calculation with config:', config);
        const response = await apiClient.post('/ifrs9/calculations/ecl', config);
        return response.data;
    },

    // Run ECL preview calculation (used by ECL configuration page)
    runECLPreviewCalculation: async (config: any) => {
        console.log('🧪 Running ECL preview calculation with config:', config);
        const response = await apiClient.post('/ifrs9/calculations/ecl/preview', config);
        return response.data;
    },

    // Export functionality for all report types
    export: async (reportType: string, params: any) => {
        try {
            console.log(`📤 Exporting ${reportType} report to ${params.format || 'xlsx'}`);
            const response = await fetch(`${API_BASE_URL}/ifrs9/reports/${reportType}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
                },
                body: JSON.stringify(params)
            });

            if (response.ok) {
                const blob = await response.blob();
                return {
                    success: true,
                    data: blob
                };
            } else {
                throw new Error(`Export failed: ${response.statusText}`);
            }
        } catch (error: any) {
            console.error('Export error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
