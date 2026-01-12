// packages/frontend/src/services/api/pd-configurations.api.ts
import { apiClient } from '../api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PDConfiguration {
    id?: string;
    model_name: string;
    population_segment?: number;
    population_segment_id?: string;
    population_segment_desc?: string;
    selected_method: number;
    selected_method_desc?: string;
    migration_interval: number;
    population_type?: number;
    population_type_desc?: string;
    historical_month: number;
    first_historical_date?: string;
    first_historical_date_string?: string;
    multiplication?: number;
    multiplication_string?: string;
    fl_flag: boolean;
    fl_scalar_id?: string;
    fl_scalar?: string;
    ia_flag: boolean;
    bucket: string;
    bucket_desc?: string;
    is_active: boolean;
    seq?: number;
    created_by?: string;
    updated_by?: string;
    created_date?: string;
    updated_date?: string;
    created_host?: string;
    updated_host?: string;
}

export interface CreatePDConfigurationDto {
    model_name: string;
    population_segment?: number;
    population_segment_id?: string;
    population_segment_desc?: string;
    selected_method: number;
    selected_method_desc?: string;
    migration_interval?: number;
    population_type?: number;
    population_type_desc?: string;
    historical_month?: number;
    first_historical_date?: string;
    first_historical_date_string?: string;
    multiplication?: number;
    multiplication_string?: string;
    fl_flag?: boolean;
    fl_scalar_id?: string;
    fl_scalar?: string;
    ia_flag?: boolean;
    bucket: string;
    bucket_desc?: string;
    is_active?: boolean;
    seq?: number;
}

export interface UpdatePDConfigurationDto extends Partial<CreatePDConfigurationDto> { }

// ============================================================================
// API SERVICE
// ============================================================================

const BASE_URL = '/banking/collective/pd-configurations';

export const pdConfigurationsApi = {
    /**
     * Get all PD configurations
     */
    async getAll(params?: {
        search?: string;
        selected_method?: number;
        bucket?: string;
        is_active?: boolean;
    }): Promise<PDConfiguration[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.selected_method) queryParams.append('selected_method', params.selected_method.toString());
        if (params?.bucket) queryParams.append('bucket', params.bucket);
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await apiClient.get<PDConfiguration[]>(url);
        return response.data || [];
    },

    /**
     * Get single PD configuration by ID
     */
    async getById(id: string): Promise<PDConfiguration> {
        const response = await apiClient.get<PDConfiguration>(`${BASE_URL}/${id}`);
        if (!response.data) throw new Error('PD Configuration not found');
        return response.data;
    },

    /**
     * Create new PD configuration
     */
    async create(data: CreatePDConfigurationDto): Promise<PDConfiguration> {
        const response = await apiClient.post<PDConfiguration>(BASE_URL, data);
        if (!response.data) throw new Error('Failed to create PD configuration');
        return response.data;
    },

    /**
     * Update existing PD configuration
     */
    async update(id: string, data: UpdatePDConfigurationDto): Promise<PDConfiguration> {
        const response = await apiClient.put<PDConfiguration>(`${BASE_URL}/${id}`, data);
        if (!response.data) throw new Error('Failed to update PD configuration');
        return response.data;
    },

    /**
     * Delete PD configuration
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Get calculation methods metadata
     */
    async getMethods(): Promise<Array<{ value: number; label: string }>> {
        const response = await apiClient.get<Array<{ value: number; label: string }>>(
            `${BASE_URL}/metadata/methods`
        );
        return response.data || [];
    },

    /**
     * Get population types metadata
     */
    async getPopulationTypes(): Promise<Array<{ value: number; label: string }>> {
        const response = await apiClient.get<Array<{ value: number; label: string }>>(
            `${BASE_URL}/metadata/population-types`
        );
        return response.data || [];
    },
};
