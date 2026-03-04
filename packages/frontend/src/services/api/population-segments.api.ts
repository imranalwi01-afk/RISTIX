// packages/frontend/src/services/api/population-segments.api.ts
import { apiClient } from '../api-setup';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PopulationSegment {
    id?: string;
    segment_name: string;
    description?: string;
    segment_type?: string;
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

const normalizeSegmentToken = (value?: string | null): string => (value || '').trim().toUpperCase();

export const matchesPopulationSegmentType = (
    segment: PopulationSegment,
    expectedType: string
): boolean => {
    const target = normalizeSegmentToken(expectedType).replace(/\s+SEGMENT$/, '');
    if (!target) return true;

    const segmentType = normalizeSegmentToken(segment.segment_type);
    if (segmentType) {
        if (segmentType === target) return true;
        if (segmentType === `${target} SEGMENT`) return true;
        if (segmentType.startsWith(`${target} `)) return true;
    }

    const segmentName = normalizeSegmentToken(segment.segment_name);
    return segmentName === target || segmentName.startsWith(`${target} `);
};

export const filterPopulationSegmentsByType = (
    segments: PopulationSegment[],
    expectedType: string
): PopulationSegment[] => segments.filter((segment) => matchesPopulationSegmentType(segment, expectedType));

export const populationSegmentsApi = {
    async getAll(params?: {
        search?: string;
        active_flag?: boolean;
        segment_type?: string;
    }): Promise<PopulationSegment[]> {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.active_flag !== undefined) {
            const activeFlag = params.active_flag.toString();
            queryParams.append('active_flag', activeFlag);
            queryParams.append('activeFlag', activeFlag); // Compatibility with endpoints using camelCase
        }
        if (params?.segment_type) {
            queryParams.append('segment_type', params.segment_type);
            queryParams.append('segmentType', params.segment_type); // Compatibility with endpoints using camelCase
        }

        const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;
        const response = await apiClient.get<any>(url);
        return response.data?.data || [];
    },

    async getById(id: string): Promise<PopulationSegment | undefined> {
        // Handle potential definition mismatch if API returns 404 as error vs null
        try {
            const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
            return response.data?.data;
        } catch (error) {
            return undefined;
        }
    },

    async create(data: CreatePopulationSegmentDto): Promise<PopulationSegment> {
        const response = await apiClient.post<any>(BASE_URL, data);
        return response.data?.data!;
    },

    async update(id: string, data: UpdatePopulationSegmentDto): Promise<PopulationSegment> {
        const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
        return response.data?.data!;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },
};
