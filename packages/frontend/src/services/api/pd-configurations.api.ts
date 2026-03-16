// packages/frontend/src/services/api/pd-configurations.api.ts
import { apiClient } from '../api-setup';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PDConfiguration {
    id?: string;
    model_name: string;
    population_segment?: string | number;
    population_segment_id?: string;
    population_segment_desc?: string;
    selected_method: string | number;
    selected_method_desc?: string;
    migration_interval: number | null;
    population_type?: string | number | null;
    population_type_desc?: string;
    historical_month: number | null;
    first_historical_date?: string | null;
    first_historical_date_string?: string;
    multiplication?: number | null;
    multiplication_string?: string;
    fl_flag: boolean;
    fl_scalar_id?: number | null;
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
    population_segment?: string | number;
    population_segment_id?: string;
    population_segment_desc?: string;
    selected_method: string | number;
    selected_method_desc?: string;
    migration_interval?: number | null;
    population_type?: string | number | null;
    population_type_desc?: string;
    historical_month?: number | null;
    first_historical_date?: string | null;
    first_historical_date_string?: string;
    multiplication?: number | null;
    multiplication_string?: string;
    fl_flag?: boolean;
    fl_scalar_id?: number | null;
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
        selected_method?: string | number;
        bucket?: string;
        is_active?: boolean;
    }): Promise<PDConfiguration[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.selected_method) queryParams.append('selected_method', params.selected_method.toString());
        if (params?.bucket) queryParams.append('bucket', params.bucket);
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await apiClient.get<any>(url);
        return response.data?.data || [];
    },

    /**
     * Get single PD configuration by ID
     */
    async getById(id: string): Promise<PDConfiguration> {
        const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
        if (!response.data?.data) throw new Error('PD Configuration not found');
        return response.data.data;
    },

    /**
     * Create new PD configuration
     */
    async create(data: CreatePDConfigurationDto): Promise<PDConfiguration> {
        const response = await apiClient.post<any>(BASE_URL, data);
        if (!response.data?.data && !response.data?.approvalRequired && response.status !== 202) {
            throw new Error('Failed to create PD configuration');
        }
        return response.data?.approvalRequired || response.status === 202
            ? response.data
            : response.data.data;
    },

    /**
     * Update existing PD configuration
     */
    async update(id: string, data: UpdatePDConfigurationDto): Promise<PDConfiguration> {
        const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
        if (!response.data?.data && !response.data?.approvalRequired && response.status !== 202) {
            throw new Error('Failed to update PD configuration');
        }
        return response.data?.approvalRequired || response.status === 202
            ? response.data
            : response.data.data;
    },

    /**
     * Delete PD configuration
     */
    async delete(id: string): Promise<any> {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Get calculation methods metadata
     */
    async getMethods(): Promise<Array<{ value: string | number; label: string }>> {
        const response = await apiClient.get<any>(
            `${BASE_URL}/metadata/methods`
        );
        return response.data?.data || [];
    },

    /**
     * Get population types metadata
     */
    async getPopulationTypes(): Promise<Array<{ value: string | number; label: string }>> {
        const response = await apiClient.get<any>(
            `${BASE_URL}/metadata/population-types`
        );
        return response.data?.data || [];
    },
};
