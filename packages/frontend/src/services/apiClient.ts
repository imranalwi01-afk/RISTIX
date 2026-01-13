import { multiStakeholderDataProvider } from '../admin/providers/data/multiStakeholderDataProvider';

export class ApiClient {
    private dataProvider = multiStakeholderDataProvider;

    // Generic API methods
    async get<T = any>(endpoint: string): Promise<T> {
        return this.dataProvider['apiClient'].request<T>(endpoint, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data: any): Promise<T> {
        return this.dataProvider['apiClient'].request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T = any>(endpoint: string, data: any): Promise<T> {
        return this.dataProvider['apiClient'].request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.dataProvider['apiClient'].request<T>(endpoint, { method: 'DELETE' });
    }

    // Authentication helpers
    isAuthenticated(): boolean {
        return this.dataProvider.isAuthenticated();
    }

    getStakeholderType(): string | null {
        return this.dataProvider.getStakeholderType();
    }

    getTenantId(): string | null {
        return this.dataProvider.getTenantId();
    }
}

export const apiClient = new ApiClient();
