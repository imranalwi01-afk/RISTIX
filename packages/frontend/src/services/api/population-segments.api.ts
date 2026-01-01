// packages/frontend/src/services/api/population-segments.api.ts
import { apiClient } from '../api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PopulationSegment {
    id?: string;
    segment_name: string;
    description?: string;
    active_flag: boolean;
    created_by?: string;
    updated_by?: string;
    created_date?: string;
    updated_date?: string;
}

export interface CreatePopulationSegmentDto {
    segmentName: string;
    description?: string;
    activeFlag?: boolean;
}

export interface UpdatePopulationSegmentDto extends Partial<CreatePopulationSegmentDto> { }

// ============================================================================
// API SERVICE
// ============================================================================

const BASE_URL = '/banking/parameters/population-segments';

export const populationSegmentsApi = {
    async getAll(params?: {
        search?: string;
        active_flag?: boolean;
    }): Promise<PopulationSegment[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.active_flag !== undefined) queryParams.append('active_flag', params.active_flag.toString());

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await apiClient.get<PopulationSegment[]>(url);
        return response.data!;
    },

    async getById(id: string): Promise<PopulationSegment | undefined> {
        // Handle potential definition mismatch if API returns 404 as error vs null
        try {
            const response = await apiClient.get<PopulationSegment>(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            return undefined;
        }
    },

    async create(data: CreatePopulationSegmentDto): Promise<PopulationSegment> {
        const response = await apiClient.post<PopulationSegment>(BASE_URL, data);
        return response.data!;
    },

    async update(id: string, data: UpdatePopulationSegmentDto): Promise<PopulationSegment> {
        const response = await apiClient.put<PopulationSegment>(`${BASE_URL}/${id}`, data);
        return response.data!;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};
