import { apiClient } from '../api-client';

const BASE_URL = '/banking/collective/fl-scalar';

export interface FLScalarDetail {
    pkid: number;
    scalar_id: number;
    period: number;
    weighted_scalar: number;
    created_by: string;
    created_date: string;
    created_host: string;
    updated_by?: string;
    updated_date?: string;
    updated_host?: string;
}

export interface FLScalarHeader {
    pkid: number;
    scalar_name: string;
    active_flag: boolean;
    created_by: string;
    created_date: string;
    created_host: string;
    updated_by?: string;
    updated_date?: string;
    updated_host?: string;
}

export interface FLScalarWithDetails extends FLScalarHeader {
    details: FLScalarDetail[];
}

export interface CreateFLScalarRequest {
    scalar_name: string;
    active_flag: boolean;
    details: {
        period: number;
        weighted_scalar: number;
    }[];
}

export interface UpdateFLScalarRequest extends Partial<CreateFLScalarRequest> { }

export const flScalarAPI = {
    getAll: async () => {
        const response = await apiClient.get<any>(BASE_URL);
        return response.data?.data || [];
    },

    getById: async (id: string) => {
        const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
        return response.data?.data!;
    },

    create: async (data: CreateFLScalarRequest) => {
        const response = await apiClient.post<any>(BASE_URL, data);
        return response.data;
    },

    update: async (id: string, data: UpdateFLScalarRequest) => {
        const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },
    
    getDetails: async (id: string) => {
        const response = await apiClient.get<any>(`/banking/pd-setup/fl-scalars/${id}/details`);
        return response.data?.data || [];
    }
};
