// packages/frontend/src/services/api/ead-configurations.api.ts
import { apiClient } from '../api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface EADConfiguration {
    id?: number;
    model_name: string;
    segment_id: number;
    ead_method: string;
    calc_method: string;
    is_active: boolean;
    created_by?: string;
    updated_by?: string;
    created_date?: string;
    updated_date?: string;
}

export interface CreateEADConfigurationDto {
    modelName: string;
    segmentId: number;
    eadMethod: string;
    calcMethod: string;
    isActive: boolean;
}

export interface UpdateEADConfigurationDto extends Partial<CreateEADConfigurationDto> { }

// ============================================================================
// API SERVICE
// ============================================================================

const BASE_URL = '/banking/collective/ead-configurations';

export const eadConfigurationsApi = {
    /**
     * Get all EAD configurations
     */
    async getAll(params?: {
        search?: string;
        ead_method?: string;
        is_active?: boolean;
    }): Promise<EADConfiguration[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.ead_method) queryParams.append('ead_method', params.ead_method);
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await apiClient.get<EADConfiguration[]>(url);
        return response.data!;
    },

    async getById(id: string): Promise<EADConfiguration> {
        const response = await apiClient.get<EADConfiguration>(`${BASE_URL}/${id}`);
        return response.data!;
    },

    async create(data: CreateEADConfigurationDto): Promise<any> {
        const response = await apiClient.post<any>(BASE_URL, data);
        return response as any;
    },

    async update(id: string, data: UpdateEADConfigurationDto): Promise<any> {
        const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
        return response as any;
    },

    async delete(id: string): Promise<any> {
        const response = await apiClient.delete<any>(`${BASE_URL}/${id}`);
        return response as any;
    },

    async getMethods(): Promise<Array<{ value: string; label: string }>> {
        const response = await apiClient.get<Array<{ value: string; label: string }>>(
            `${BASE_URL}/metadata/methods`
        );
        return response.data!;
    },

    async getCalcMethods(): Promise<Array<{ value: string; label: string }>> {
        const response = await apiClient.get<Array<{ value: string; label: string }>>(
            `${BASE_URL}/metadata/calc-methods`
        );
        return response.data!;
    },
};
