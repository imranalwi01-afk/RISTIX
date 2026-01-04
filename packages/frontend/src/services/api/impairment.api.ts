
import apiClient from '../api-client';

export interface ImpairmentCalculation {
    id: string;
    calculationName: string;
    calculationType: 'ECL' | 'PD' | 'LGD' | 'EAD' | 'STAGING';
    portfolioId: string;
    portfolioName: string;
    calculationDate: string;
    reportingDate: string;
    currency: string;
    totalExposure: number;
    totalECL: number;
    coverageRatio: number;
    stage1Exposure: number;
    stage2Exposure: number;
    stage3Exposure: number;
    stage1ECL: number;
    stage2ECL: number;
    stage3ECL: number;
    modelVersion: string;
    assumptions: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress: number;
    errorMessage?: string;
    createdBy: string;
    createdAt: string;
    completedAt?: string;
}

export interface ImpairmentConfiguration {
    id: string;
    configName: string;
    configType: 'ECL_MODEL' | 'PD_MODEL' | 'LGD_MODEL' | 'EAD_MODEL';
    isActive: boolean;
    parameters: Record<string, any>;
    modelVersion: string;
    lastUpdated: string;
    updatedBy: string;
}

export interface RunCalculationRequest {
    calculationName: string;
    calculationType: string;
    portfolioId: string;
    reportingDate: string;
    currency: string;
    assumptions?: string;
}

const BASE_URL = '/banking/ifrs9/impairment-module';

export const impairmentApi = {
    getCalculations: async (page = 1, limit = 10) => {
        const response = await apiClient.get<ImpairmentCalculation[]>(`${BASE_URL}/calculations?page=${page}&limit=${limit}`);
        return response;
    },

    getConfigurations: async () => {
        const response = await apiClient.get<ImpairmentConfiguration[]>(`${BASE_URL}/configurations`);
        return response;
    },

    runCalculation: async (data: RunCalculationRequest) => {
        const response = await apiClient.post<any>(`${BASE_URL}/run-calculation`, data);
        return response;
    }
};
