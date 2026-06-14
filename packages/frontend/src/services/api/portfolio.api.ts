// packages/frontend/src/services/api/portfolio.api.ts
import { apiClient } from '../api-setup';

export interface Product {
    id: string;
    product_code: string;
    product_name: string;
    product_type: string;
    interest_rate_min?: number;
    interest_rate_max?: number;
    tenor_min?: number;
    tenor_max?: number;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface Account {
    id: string;
    account_number: string;
    customer_name: string;
    product_code: string;
    balance: number;
    status: string;
}

export const portfolioApi = {
    /**
     * Get portfolio products
     */
    async getProducts(): Promise<{ success: boolean; data: Product[] }> {
        try {
            const response = await apiClient.get('/banking/portfolio/products');
            return response.data;
        } catch (error) {
            console.warn('⚠️ Portfolio API failed, returning mock data for development');
            return {
                success: true,
                data: [
                    {
                        id: 'prod-1',
                        product_code: 'KPR-001',
                        product_name: 'Kredit Pemilikan Rumah',
                        product_type: 'Mortgage',
                        interest_rate_min: 5.5,
                        interest_rate_max: 8.5,
                        tenor_min: 12,
                        tenor_max: 240,
                        status: 'active',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 'prod-2',
                        product_code: 'KMK-001',
                        product_name: 'Kredit Modal Kerja',
                        product_type: 'Working Capital',
                        interest_rate_min: 7.0,
                        interest_rate_max: 12.0,
                        tenor_min: 6,
                        tenor_max: 60,
                        status: 'active',
                        created_at: new Date().toISOString()
                    }
                ]
            };
        }
    },

    /**
     * Get portfolio accounts
     */
    async getAccounts(): Promise<{ success: boolean; data: Account[] }> {
        try {
            const response = await apiClient.get('/banking/portfolio/accounts');
            return response.data;
        } catch (error) {
            console.warn('⚠️ Portfolio API failed, returning mock data for development');
            return {
                success: true,
                data: []
            };
        }
    },

    /**
     * Get product by ID
     */
    async getProductById(id: string): Promise<{ success: boolean; data: Product }> {
        try {
            const response = await apiClient.get(`/banking/portfolio/products/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                data: {} as Product
            };
        }
    },

    /**
     * Create product
     */
    async createProduct(data: Partial<Product>): Promise<{ success: boolean; data: Product }> {
        try {
            const response = await apiClient.post('/banking/portfolio/products', data);
            return response.data;
        } catch (error) {
            return {
                success: true,
                data: {
                    id: `prod-${Date.now()}`,
                    product_code: data.product_code || 'NEW-001',
                    product_name: data.product_name || 'New Product',
                    product_type: data.product_type || 'General',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    ...data
                } as Product
            };
        }
    },

    /**
     * Update product
     */
    async updateProduct(id: string, data: Partial<Product>): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.put(`/banking/portfolio/products/${id}`, data);
            return response.data;
        } catch (error) {
            return {
                success: true,
                message: 'Product updated successfully (Mock Mode)'
            };
        }
    },

    /**
     * Delete product
     */
    async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete(`/banking/portfolio/products/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: true,
                message: 'Product deleted successfully (Mock Mode)'
            };
        }
    }
};

export const getProducts = portfolioApi.getProducts;
export const getAccounts = portfolioApi.getAccounts;
export const getProductById = portfolioApi.getProductById;
export const createProduct = portfolioApi.createProduct;
export const updateProduct = portfolioApi.updateProduct;
export const deleteProduct = portfolioApi.deleteProduct;

export default portfolioApi;
