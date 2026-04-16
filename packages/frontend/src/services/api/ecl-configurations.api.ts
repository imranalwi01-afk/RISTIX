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

export interface ECLPreviewHeaderResult {
    prc_date?: string | null;
    account_id?: number | null;
    facility_number?: string | null;
    cif_number?: string | null;
    segment_id?: number | null;
    remaining_tenor?: number | null;
    stage?: number | null;
    bucket_group?: string | null;
    bucket_id?: number | null;
    currency?: string | null;
    dpd?: number | null;
    internal_rating_code?: string | null;
    ext_rating_code?: string | null;
    outstanding?: string | null;
    plafond?: string | null;
    fib_amt?: string | null;
    accrued_interest?: string | null;
    unamort_cost_amt?: string | null;
    unamort_fee_amt?: string | null;
    ecl_amount?: string | null;
    overlay_amount?: string | null;
    ecl_final?: string | null;
    ecl_model_id?: number | null;
}

export interface ECLPreviewDetailResult {
    prc_date?: string | null;
    account_id?: number | null;
    facility_number?: string | null;
    cif_number?: string | null;
    segment_id?: number | null;
    remaining_tenor?: number | null;
    stage?: number | null;
    scenario_no?: number | null;
    fl_seq?: number | null;
    fl_year?: number | null;
    fl_month?: number | null;
    bucket_group?: string | null;
    bucket_id?: number | null;
    currency?: string | null;
    dpd?: number | null;
    internal_rating_code?: string | null;
    ext_rating_code?: string | null;
    outstanding?: string | null;
    plafond?: string | null;
    fib_amt?: string | null;
    accrued_interest?: string | null;
    unamort_cost_amt?: string | null;
    unamort_fee_amt?: string | null;
    ead_balance?: string | null;
    principal_amt?: string | null;
    sum_principal_amt?: string | null;
    next_interest?: string | null;
    sum_next_interest?: string | null;
    ead?: string | null;
    pd?: number | null;
    lgd?: number | null;
    ecl_amount?: string | null;
    probability?: number | null;
    ecl_weighted?: string | null;
    ecl_model_id?: number | null;
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

    getPreviewResults: async (id: number | string) => {
        const response = await apiClient.get<ECLPreviewHeaderResult[]>(`${BASE_URL}/${id}/preview`);
        return response.data!;
    },

    getPreviewResultDetail: async (id: number | string, accountId: number | string) => {
        const response = await apiClient.get<ECLPreviewDetailResult[]>(`${BASE_URL}/${id}/preview/${accountId}`);
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
