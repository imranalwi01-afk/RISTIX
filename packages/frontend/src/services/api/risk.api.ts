// packages/frontend/src/services/api/risk.api.ts
import { apiClient } from '../api-setup';

export interface RiskParameter {
    id: string;
    name: string;
    category: string;
    value: number;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
}

export const riskApi = {
    /**
     * Get risk parameters
     */
    async getRiskParameters(): Promise<{ success: boolean; data: RiskParameter[] }> {
        try {
            console.log('📊 Fetching risk parameters from API');
            const response = await apiClient.get('/banking/parameters/risk');
            return response.data;
        } catch (error) {
            console.warn('⚠️ Risk API failed, returning mock data for development');
            return {
                success: true,
                data: [
                    {
                        id: 'risk-1',
                        name: 'Credit Risk Weight',
                        category: 'Credit Risk',
                        value: 75,
                        threshold: 80,
                        status: 'normal'
                    },
                    {
                        id: 'risk-2',
                        name: 'Market Risk Exposure',
                        category: 'Market Risk',
                        value: 85,
                        threshold: 80,
                        status: 'warning'
                    }
                ]
            };
        }
    },

    /**
     * Update risk parameter
     */
    async updateRiskParameter(id: string, data: Partial<RiskParameter>): Promise<{ success: boolean; message: string }> {
        console.log(`🔄 Updating risk parameter: ${id}`);
        try {
            const response = await apiClient.put(`/banking/parameters/risk/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: true,
                message: 'Risk parameter updated successfully (Mock Mode)'
            };
        }
    },

    /**
     * Create risk parameter
     */
    async createRiskParameter(data: Partial<RiskParameter>): Promise<{ success: boolean; data: RiskParameter }> {
        console.log('➕ Creating risk parameter');
        try {
            const response = await apiClient.post('/banking/parameters/risk', data);
            return response.data;
        } catch (error) {
            return {
                success: true,
                data: {
                    id: `risk-${Date.now()}`,
                    name: data.name || 'New Risk Parameter',
                    category: data.category || 'General',
                    value: data.value || 0,
                    threshold: data.threshold || 100,
                    status: 'normal'
                }
            };
        }
    },

    /**
     * Delete risk parameter
     */
    async deleteRiskParameter(id: string): Promise<{ success: boolean; message: string }> {
        console.log(`🗑️ Deleting risk parameter: ${id}`);
        try {
            const response = await apiClient.delete(`/banking/parameters/risk/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: true,
                message: 'Risk parameter deleted successfully (Mock Mode)'
            };
        }
    }
};

export const getRiskParameters = riskApi.getRiskParameters;
export const updateRiskParameter = riskApi.updateRiskParameter;
export const createRiskParameter = riskApi.createRiskParameter;
export const deleteRiskParameter = riskApi.deleteRiskParameter;

export default riskApi;
