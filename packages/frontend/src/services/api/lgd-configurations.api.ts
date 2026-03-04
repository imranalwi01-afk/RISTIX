// packages/frontend/src/services/api/lgd-configurations.api.ts
import { apiClient } from '../api-setup';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LGDConfiguration {
    id?: number; // Legacy uses pkid (smallint)
    model_name: string;
    segment_id?: number; // Maps to SEGMENT_ID
    lgd_method: string | number;
    population_type?: string | number;     // varchar(20)
    observation_period?: string;  // varchar(50)
    observation_start_date?: string; // date
    workout_period?: number;      // integer
    fl_flag?: boolean;
    fl_scalar_id?: number;
    lgd_rate?: number;
    is_active: boolean;
    created_by?: string;
    updated_by?: string;
    created_date?: string;
    updated_date?: string;
}

export interface CreateLGDConfigurationDto {
    modelName: string;
    segmentId?: number;
    lgdMethod: string | number;
    populationType?: string | number;
    observationPeriod?: string;
    // observationStartDate?: string; // Not in form yet? Should be added if needed, but backend supports it
    workoutPeriod?: number;
    flFlag?: boolean;
    flScalarId?: number;
    lgdRate?: number;
    isActive: boolean;
}

export interface UpdateLGDConfigurationDto extends Partial<CreateLGDConfigurationDto> { }

// ============================================================================
// API SERVICE
// ============================================================================

const BASE_URL = '/banking/collective/lgd-configurations';

export const lgdConfigurationsApi = {
    /**
     * Get all LGD configurations
     */
    async getAll(params?: {
        search?: string;
        lgd_method?: string | number;
        is_active?: boolean;
    }): Promise<LGDConfiguration[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.lgd_method) queryParams.append('lgd_method', params.lgd_method.toString());
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;

        const response = await apiClient.get<any>(url);
        return response.data?.data || [];
    },

    async getById(id: string): Promise<LGDConfiguration> {
        const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
        if (!response.data?.data) throw new Error('LGD Configuration not found');
        return response.data.data;
    },

    async create(data: CreateLGDConfigurationDto): Promise<LGDConfiguration> {
        const response = await apiClient.post<any>(BASE_URL, data);
        return response.data?.data;
    },

    async update(id: string, data: UpdateLGDConfigurationDto): Promise<LGDConfiguration> {
        const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
        return response.data?.data;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    async getMethods(): Promise<Array<{ value: string | number; label: string }>> {
        const response = await apiClient.get<any>(
            `${BASE_URL}/metadata/methods`
        );
        return response.data?.data || [];
    },

    async getPopulationTypes(): Promise<Array<{ value: string | number; label: string }>> {
        const response = await apiClient.get<any>(
            `${BASE_URL}/metadata/population-types`
        );
        return response.data?.data || [];
    },
};
