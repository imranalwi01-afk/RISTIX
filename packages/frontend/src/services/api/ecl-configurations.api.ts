import { apiClient } from '../api-client';

const BASE_URL = '/banking/collective/ecl-config';

export interface ECLConfigurationDetail {
    id?: number;
    pf_segment_id?: number;
    stage_rule_id?: number;
    pd_model_id?: number;
    lgd_model_id?: number;
    ead_model_id?: number;
    overlay_rate?: number;
    period_type?: number;
    period_date?: string;
}

export interface ECLConfigurationHeader {
    id: number;
    model_name: string;
    module?: string;
    effective_date: string;
    active_flag: boolean;
    last_run_period?: string;
    last_run_status?: string;
    last_run_date?: string;
    created_by: string;
    created_date: string;
}

export interface ECLConfigurationWithDetails extends ECLConfigurationHeader {
    details: ECLConfigurationDetail[];
}

export interface CreateECLConfigurationRequest {
    modelName: string;
    module?: string;
    effectiveDate: string;
    activeFlag: boolean;
    details?: {
        pfSegmentId?: number;
        stageRuleId?: number;
        pdModelId?: number;
        lgdModelId?: number;
        eadModelId?: number;
        overlayRate?: number;
        periodType?: number;
        periodDate?: string;
    }[];
}

export interface UpdateECLConfigurationRequest extends Partial<CreateECLConfigurationRequest> { }

export const eclConfigurationsApi = {
    getAll: async () => {
        const response = await apiClient.get<ECLConfigurationHeader[]>(BASE_URL);
        return response.data!;
    },

    getById: async (id: number | string) => {
        const response = await apiClient.get<ECLConfigurationWithDetails>(`${BASE_URL}/${id}`);
        return response.data!;
    },

    create: async (data: CreateECLConfigurationRequest) => {
        const response = await apiClient.post<ECLConfigurationWithDetails>(BASE_URL, data);
        return response.data!;
    },

    update: async (id: number | string, data: UpdateECLConfigurationRequest) => {
        const response = await apiClient.put<ECLConfigurationWithDetails>(`${BASE_URL}/${id}`, data);
        return response.data!;
    },

    delete: async (id: number | string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data!;
    }
};
