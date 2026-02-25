// packages/frontend/src/services/api/product-segments.api.ts
import { apiClient } from '../api-setup';
import { getAuthToken } from '@/utils/auth-token';

export interface ProductSegment {
    id: string;
    tenantId: string;
    groupSegment: string;
    segment: string;
    subSegment: string;
    segmentType: 'EAD Segment' | 'LGD Segment' | 'PD Segment' | 'Portfolio Segment';
    isActive: boolean;
    description?: string;
    displayOrder: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductSegmentDto {
    groupSegment: string;
    segment: string;
    subSegment: string;
    segmentType: 'EAD Segment' | 'LGD Segment' | 'PD Segment' | 'Portfolio Segment';
    isActive?: boolean;
    description?: string;
    displayOrder?: number;
}

const BASE_URL = '/banking/parameters/product-segments';

export const productSegmentsApi = {
    getAll: async (): Promise<ProductSegment[]> => {
        const token = getAuthToken();
        const response = await apiClient.get(BASE_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data?.data ?? response.data;
    },

    getById: async (id: string): Promise<ProductSegment> => {
        const token = getAuthToken();
        const response = await apiClient.get(`${BASE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data?.data ?? response.data;
    },

    create: async (data: CreateProductSegmentDto): Promise<ProductSegment> => {
        const token = getAuthToken();
        const response = await apiClient.post(BASE_URL, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data?.data ?? response.data;
    },

    update: async (id: string, data: Partial<CreateProductSegmentDto>): Promise<ProductSegment> => {
        const token = getAuthToken();
        const response = await apiClient.put(`${BASE_URL}/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data?.data ?? response.data;
    },

    delete: async (id: string): Promise<void> => {
        const token = getAuthToken();
        await apiClient.delete(`${BASE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
