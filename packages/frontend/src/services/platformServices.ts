import { apiClient } from './apiClient';
import {
    User,
    BankingInstitution,
    ConsultantProject,
    SystemMetrics
} from '../admin/providers/data/multiStakeholderDataProvider';

export interface CreateUserRequest {
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    stakeholder_type: 'platform_admin' | 'bank_admin' | 'bank_user' | 'consultant' | 'regulator';
    role: string;
    tenant_id?: string;
    banking_institution_id?: string;
    consultant_specialization?: string;
    send_welcome_email?: boolean;
}

export interface CreateBankingInstitutionRequest {
    institution_name: string;
    institution_code: string;
    banking_type: 'conventional' | 'syariah' | 'dual';
    license_type: string;
    country: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    website?: string;
}

export interface CreateConsultantProjectRequest {
    banking_institution_id: string;
    consultant_user_id: string;
    project_name: string;
    project_type: 'implementation' | 'validation' | 'audit' | 'training';
    description: string;
    start_date: string;
    estimated_end_date?: string;
    budget_allocated?: number;
    scope_of_work: string;
}

export class PlatformService {
    // User Management
    async getUsers(params?: {
        page?: number;
        per_page?: number;
        stakeholder_type?: string;
        tenant_id?: string;
        search?: string;
    }): Promise<{ data: User[]; total: number; page: number; per_page: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/platform/users?${query}`);
    }

    async getUser(id: string): Promise<User> {
        const response = await apiClient.get<{ data: User }>(`/api/v1/platform/users/${id}`);
        return response.data;
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        const response = await apiClient.post<{ data: User }>('/api/v1/platform/users', userData);
        return response.data;
    }

    async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User> {
        const response = await apiClient.put<{ data: User }>(`/api/v1/platform/users/${id}`, userData);
        return response.data;
    }

    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/platform/users/${id}`);
    }

    async activateUser(id: string): Promise<User> {
        const response = await apiClient.post<{ data: User }>(`/api/v1/platform/users/${id}/activate`, {});
        return response.data;
    }

    async deactivateUser(id: string): Promise<User> {
        const response = await apiClient.post<{ data: User }>(`/api/v1/platform/users/${id}/deactivate`, {});
        return response.data;
    }

    // Banking Institution Management
    async getBankingInstitutions(params?: {
        page?: number;
        per_page?: number;
        banking_type?: string;
        status?: string;
        country?: string;
    }): Promise<{ data: BankingInstitution[]; total: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/platform/banking-institutions?${query}`);
    }

    async getBankingInstitution(id: string): Promise<BankingInstitution> {
        const response = await apiClient.get<{ data: BankingInstitution }>(`/api/v1/platform/banking-institutions/${id}`);
        return response.data;
    }

    async createBankingInstitution(institutionData: CreateBankingInstitutionRequest): Promise<BankingInstitution> {
        const response = await apiClient.post<{ data: BankingInstitution }>('/api/v1/platform/banking-institutions', institutionData);
        return response.data;
    }

    async updateBankingInstitution(id: string, institutionData: Partial<CreateBankingInstitutionRequest>): Promise<BankingInstitution> {
        const response = await apiClient.put<{ data: BankingInstitution }>(`/api/v1/platform/banking-institutions/${id}`, institutionData);
        return response.data;
    }

    async deleteBankingInstitution(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/platform/banking-institutions/${id}`);
    }

    async provisionTenantDatabase(institutionId: string): Promise<{ database_name: string; status: string }> {
        return apiClient.post(`/api/v1/platform/banking-institutions/${institutionId}/provision-database`, {});
    }

    // Consultant Project Management
    async getConsultantProjects(params?: {
        page?: number;
        per_page?: number;
        banking_institution_id?: string;
        consultant_id?: string;
        project_type?: string;
        status?: string;
    }): Promise<{ data: ConsultantProject[]; total: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/platform/consultant-projects?${query}`);
    }

    async getConsultantProject(id: string): Promise<ConsultantProject> {
        const response = await apiClient.get<{ data: ConsultantProject }>(`/api/v1/platform/consultant-projects/${id}`);
        return response.data;
    }

    async createConsultantProject(projectData: CreateConsultantProjectRequest): Promise<ConsultantProject> {
        const response = await apiClient.post<{ data: ConsultantProject }>('/api/v1/platform/consultant-projects', projectData);
        return response.data;
    }

    async updateConsultantProject(id: string, projectData: Partial<CreateConsultantProjectRequest>): Promise<ConsultantProject> {
        const response = await apiClient.put<{ data: ConsultantProject }>(`/api/v1/platform/consultant-projects/${id}`, projectData);
        return response.data;
    }

    async deleteConsultantProject(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/platform/consultant-projects/${id}`);
    }

    async assignConsultantToProject(projectId: string, consultantId: string): Promise<ConsultantProject> {
        const response = await apiClient.post<{ data: ConsultantProject }>(`/api/v1/platform/consultant-projects/${projectId}/assign-consultant`, {
            consultant_id: consultantId,
        });
        return response.data;
    }

    // System Metrics and Monitoring
    async getSystemMetrics(): Promise<SystemMetrics> {
        return apiClient.get('/api/v1/platform/metrics');
    }

    async getSystemHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'down';
        services: Record<string, { status: string; response_time_ms: number }>;
        uptime: string;
        version: string;
    }> {
        return apiClient.get('/api/v1/platform/health');
    }

    async getTenantUsage(tenantId?: string): Promise<{
        tenant_id: string;
        storage_used_gb: number;
        api_calls_count: number;
        calculations_count: number;
        users_active_count: number;
        last_updated: string;
    }[]> {
        const endpoint = tenantId ? `/api/v1/platform/usage/${tenantId}` : '/api/v1/platform/usage';
        return apiClient.get(endpoint);
    }
}

export const platformService = new PlatformService();
