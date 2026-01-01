import { apiClient } from '../api.client';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AppSettingsHeader {
    pkid: number;
    paramCode: string;
    paramName?: string;
    paramUsage?: string;
    paramType?: string;
    bankingType?: string;
    isActive: boolean;
    requiresApproval: boolean;
}

export interface AppSettingsDetail {
    pkid: number;
    paramCode: string; // link to header
    paramSeq: number;
    value1: string;
    value2: string;
    value3: string;
    paramdesc: string;
    createdby?: string;
    updatedby?: string;
    createddate?: string;
    updateddate?: string;
}

export interface CreateAppSettingsDetailDto {
    paramCode: string;
    paramSeq: number;
    value1: string;
    value2: string;
    value3: string;
    paramdesc: string;
}

export interface UpdateAppSettingsDetailDto extends Partial<CreateAppSettingsDetailDto> { }

// ============================================================================
// API SERVICE
// ============================================================================

const BASE_URL = '/banking/parameters/app-settings';

export const appSettingsApi = {
    /**
     * Get all app settings (headers with details)
     * Note: Backend returns headers with 'details' relation loaded
     */
    async getAll(): Promise<Array<AppSettingsHeader & { details: AppSettingsDetail[] }>> {
        const response = await apiClient.get<Array<AppSettingsHeader & { details: AppSettingsDetail[] }>>(BASE_URL);
        return response.data!;
    },

    /**
     * Get details for a specific param code
     */
    async getByCode(code: string): Promise<AppSettingsHeader & { details: AppSettingsDetail[] }> {
        const response = await apiClient.get<AppSettingsHeader & { details: AppSettingsDetail[] }>(`${BASE_URL}/${code}`);
        return response.data!;
    },

    /**
     * Create a new detail
     */
    async createDetail(data: CreateAppSettingsDetailDto): Promise<AppSettingsDetail> {
        const response = await apiClient.post<AppSettingsDetail>(BASE_URL, data);
        return response.data!;
    },

    /**
     * Update a detail
     */
    async updateDetail(id: number, data: UpdateAppSettingsDetailDto): Promise<AppSettingsDetail> {
        const response = await apiClient.put<AppSettingsDetail>(`${BASE_URL}/details/${id}`, data);
        return response.data!;
    },

    /**
     * Delete a detail
     */
    async deleteDetail(id: number): Promise<void> {
        await apiClient.delete(`${BASE_URL}/details/${id}`);
    },
};
