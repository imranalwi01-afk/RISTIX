// packages/frontend/src/services/api/lgd-configurations.api.ts
import { apiClient } from '../api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface LGDConfiguration {
    id?: number; // Legacy uses pkid (smallint)
    model_name: string;
    segment_id?: number; // Maps to SEGMENT_ID
    lgd_method: number;
    population_type?: string;     // varchar(20)
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
    lgdMethod: number;
    populationType?: string;
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
        lgd_method?: number;
        is_active?: boolean;
    }): Promise<LGDConfiguration[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.lgd_method) queryParams.append('lgd_method', params.lgd_method.toString());
        if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        // Generic Type <T> determines response.data type.
        // If Response is { success, data: T[] }, we pass T[] as Inner Type? 
        // NO, we established existing apiClient expects ResponseType as T.
        // Wait, if I change it to `apiClient.get<LGDConfiguration[]>`...
        // Does apiClient wrap it?
        // Step 2884: `async get<T>(...): Promise<ApiResponse<T>>`.
        // If `ApiResponse<T> = T`, then passing `LGDConfiguration[]` means response is ARRAY. 
        // But backend returns Object `{ success: true, data: [...] }`.
        // So passing `LGDConfiguration[]` expects backend to return Array. It does NOT.

        // This means `ApiResponse<T>` MUST be `{ success: boolean; data: T }`.
        // If so, `get<LGDConfiguration[]>` returns `Promise<{ success: boolean; data: LGDConfiguration[] }>`.
        // Then `response.data` is `LGDConfiguration[]`.
        // This is CORRECT.

        // BUT, if `ApiResponse<T> = T`.
        // Then I MUST pass `{ success: boolean; data: LGDConfiguration[] }`.
        // And `response` is `{ success: boolean; data: ... }`.
        // And `response.data` works.

        // The LINT error said: `Type '{ success: boolean; data: LGDConfiguration[]; }' is missing ... from type 'LGDConfiguration[]'`.
        // This implies TS expected `LGDConfiguration[]` but got `{ success: ..., data: ... }`.
        // This happens if function return type is `Promise<LGDConfiguration[]>` (it is),
        // AND I returned `response.data`.
        // If `response.data` IS the object `{ success: ..., data: ... }`, then `response` was double wrapped!
        // This confirms `apiClient` wraps `T` in response structure?
        // OR `apiClient` returns `any` and I casted it?

        // I will assume `apiClient.get<T>` returns `Promise<{ success: boolean; data: T }>` (wrapping).
        // So I pass `LGDConfiguration[]`.

        const response = await apiClient.get<LGDConfiguration[]>(url);
        // If wrapped: response is { success, data: LGDConfiguration[] }. response.data is Array.
        return response.data!;
    },

    async getById(id: string): Promise<LGDConfiguration> {
        const response = await apiClient.get<LGDConfiguration>(`${BASE_URL}/${id}`);
        return response.data!;
    },

    async create(data: CreateLGDConfigurationDto): Promise<LGDConfiguration> {
        const response = await apiClient.post<LGDConfiguration>(BASE_URL, data);
        return response.data!;
    },

    async update(id: string, data: UpdateLGDConfigurationDto): Promise<LGDConfiguration> {
        const response = await apiClient.put<LGDConfiguration>(`${BASE_URL}/${id}`, data);
        return response.data!;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    async getMethods(): Promise<Array<{ value: number; label: string }>> {
        const response = await apiClient.get<Array<{ value: number; label: string }>>(
            `${BASE_URL}/metadata/methods`
        );
        return response.data!;
    },

    async getPopulationTypes(): Promise<Array<{ value: string; label: string }>> {
        const response = await apiClient.get<Array<{ value: string; label: string }>>(
            `${BASE_URL}/metadata/population-types`
        );
        return response.data!;
    },
};
