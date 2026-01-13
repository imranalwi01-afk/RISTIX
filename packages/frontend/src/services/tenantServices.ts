import { apiClient } from './apiClient';
import {
    PortfolioAccount,
    ECLCalculation,
    ModelConfiguration
} from '../admin/providers/data/multiStakeholderDataProvider';

export interface CreatePortfolioAccountRequest {
    account_number: string;
    customer_name: string;
    customer_id: string;
    product_type: string;
    product_code: string;
    outstanding_amount: number;
    original_amount: number;
    origination_date: string;
    maturity_date?: string;
    interest_rate: number;
    currency: string;
    ifrs9_stage: 'stage_1' | 'stage_2' | 'stage_3';
}

export interface ECLCalculationRequest {
    account_id: string;
    calculation_method: 'simplified' | 'general' | 'advanced';
    probability_of_default: number;
    loss_given_default: number;
    exposure_at_default: number;
    effective_interest_rate: number;
    time_horizon_months: number;
}

export interface ModelConfigurationRequest {
    model_type: 'pd_model' | 'lgd_model' | 'ead_model' | 'ecl_model';
    model_name: string;
    parameters: Record<string, any>;
    validation_status: 'draft' | 'pending_validation' | 'validated' | 'rejected';
    description: string;
}

export class TenantService {
    private getTenantId(): string {
        const tenantId = apiClient.getTenantId();
        if (!tenantId) {
            throw new Error('Tenant ID is required for tenant operations');
        }
        return tenantId;
    }

    // Portfolio Account Management
    async getPortfolioAccounts(params?: {
        page?: number;
        per_page?: number;
        ifrs9_stage?: string;
        product_type?: string;
        search?: string;
    }): Promise<{ data: PortfolioAccount[]; total: number }> {
        const tenantId = this.getTenantId();
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/tenants/${tenantId}/portfolio/accounts?${query}`);
    }

    async getPortfolioAccount(id: string): Promise<PortfolioAccount> {
        const tenantId = this.getTenantId();
        const response = await apiClient.get<{ data: PortfolioAccount }>(`/api/v1/tenants/${tenantId}/portfolio/accounts/${id}`);
        return response.data;
    }

    async createPortfolioAccount(accountData: CreatePortfolioAccountRequest): Promise<PortfolioAccount> {
        const tenantId = this.getTenantId();
        const response = await apiClient.post<{ data: PortfolioAccount }>(`/api/v1/tenants/${tenantId}/portfolio/accounts`, accountData);
        return response.data;
    }

    async updatePortfolioAccount(id: string, accountData: Partial<CreatePortfolioAccountRequest>): Promise<PortfolioAccount> {
        const tenantId = this.getTenantId();
        const response = await apiClient.put<{ data: PortfolioAccount }>(`/api/v1/tenants/${tenantId}/portfolio/accounts/${id}`, accountData);
        return response.data;
    }

    async deletePortfolioAccount(id: string): Promise<void> {
        const tenantId = this.getTenantId();
        await apiClient.delete(`/api/v1/tenants/${tenantId}/portfolio/accounts/${id}`);
    }

    async bulkImportPortfolioAccounts(file: File): Promise<{
        imported_count: number;
        failed_count: number;
        errors: any[];
    }> {
        const tenantId = this.getTenantId();
        const formData = new FormData();
        formData.append('file', file);

        // Note: This would need special handling for file uploads
        return apiClient.post(`/api/v1/tenants/${tenantId}/portfolio/accounts/bulk-import`, formData);
    }

    // ECL Calculation Management
    async getECLCalculations(params?: {
        page?: number;
        per_page?: number;
        account_id?: string;
        calculation_date_from?: string;
        calculation_date_to?: string;
        validation_status?: string;
    }): Promise<{ data: ECLCalculation[]; total: number }> {
        const tenantId = this.getTenantId();
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/tenants/${tenantId}/ecl/calculations?${query}`);
    }

    async getECLCalculation(id: string): Promise<ECLCalculation> {
        const tenantId = this.getTenantId();
        const response = await apiClient.get<{ data: ECLCalculation }>(`/api/v1/tenants/${tenantId}/ecl/calculations/${id}`);
        return response.data;
    }

    async performECLCalculation(calculationData: ECLCalculationRequest): Promise<ECLCalculation> {
        const tenantId = this.getTenantId();
        const response = await apiClient.post<{ data: ECLCalculation }>(`/api/v1/tenants/${tenantId}/ecl/calculations`, calculationData);
        return response.data;
    }

    async batchECLCalculation(accountIds: string[]): Promise<{
        job_id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        total_accounts: number;
    }> {
        const tenantId = this.getTenantId();
        return apiClient.post(`/api/v1/tenants/${tenantId}/ecl/calculations/batch`, {
            account_ids: accountIds,
        });
    }

    async getECLCalculationJob(jobId: string): Promise<{
        job_id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        progress_percentage: number;
        completed_accounts: number;
        total_accounts: number;
        results?: ECLCalculation[];
        errors?: any[];
    }> {
        const tenantId = this.getTenantId();
        return apiClient.get(`/api/v1/tenants/${tenantId}/ecl/calculations/jobs/${jobId}`);
    }

    // Model Configuration Management
    async getModelConfigurations(params?: {
        page?: number;
        per_page?: number;
        model_type?: string;
        validation_status?: string;
    }): Promise<{ data: ModelConfiguration[]; total: number }> {
        const tenantId = this.getTenantId();
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/tenants/${tenantId}/models/configurations?${query}`);
    }

    async getModelConfiguration(id: string): Promise<ModelConfiguration> {
        const tenantId = this.getTenantId();
        const response = await apiClient.get<{ data: ModelConfiguration }>(`/api/v1/tenants/${tenantId}/models/configurations/${id}`);
        return response.data;
    }

    async createModelConfiguration(modelData: ModelConfigurationRequest): Promise<ModelConfiguration> {
        const tenantId = this.getTenantId();
        const response = await apiClient.post<{ data: ModelConfiguration }>(`/api/v1/tenants/${tenantId}/models/configurations`, modelData);
        return response.data;
    }

    async updateModelConfiguration(id: string, modelData: Partial<ModelConfigurationRequest>): Promise<ModelConfiguration> {
        const tenantId = this.getTenantId();
        const response = await apiClient.put<{ data: ModelConfiguration }>(`/api/v1/tenants/${tenantId}/models/configurations/${id}`, modelData);
        return response.data;
    }

    async deleteModelConfiguration(id: string): Promise<void> {
        const tenantId = this.getTenantId();
        await apiClient.delete(`/api/v1/tenants/${tenantId}/models/configurations/${id}`);
    }
}

export const tenantService = new TenantService();
