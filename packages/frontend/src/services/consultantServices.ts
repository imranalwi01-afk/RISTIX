import { apiClient } from './apiClient';
import {
    ConsultantProject,
    ConsultantValidation
} from '../admin/providers/data/multiStakeholderDataProvider';

export interface ConsultantValidationRequest {
    project_id: string;
    validation_type: 'model_validation' | 'backtesting' | 'stress_testing';
    model_type: string;
    validation_methodology: string;
    test_data_period_start: string;
    test_data_period_end: string;
    validation_criteria: Record<string, any>;
    expected_completion_date: string;
}

export interface ConsultantDeliverableRequest {
    project_id: string;
    deliverable_type: 'report' | 'model' | 'documentation' | 'training_material';
    title: string;
    description: string;
    file_attachments?: File[];
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export class ConsultantService {
    // Consultant Project Access
    async getMyProjects(params?: {
        page?: number;
        per_page?: number;
        status?: string;
        project_type?: string;
    }): Promise<{ data: ConsultantProject[]; total: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/consultant/projects?${query}`);
    }

    async getProjectDetails(projectId: string): Promise<ConsultantProject> {
        const response = await apiClient.get<{ data: ConsultantProject }>(`/api/v1/consultant/projects/${projectId}`);
        return response.data;
    }

    async updateProjectProgress(projectId: string, progressData: {
        progress_percentage: number;
        status_notes: string;
        current_phase: string;
        completed_milestones: string[];
        next_deliverable_date?: string;
    }): Promise<ConsultantProject> {
        const response = await apiClient.put<{ data: ConsultantProject }>(`/api/v1/consultant/projects/${projectId}/progress`, progressData);
        return response.data;
    }

    // Consultant Validation Services
    async getValidationAssignments(params?: {
        page?: number;
        per_page?: number;
        validation_type?: string;
        status?: string;
        project_id?: string;
    }): Promise<{ data: ConsultantValidation[]; total: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/consultant/validations?${query}`);
    }

    async getValidationDetails(validationId: string): Promise<ConsultantValidation> {
        const response = await apiClient.get<{ data: ConsultantValidation }>(`/api/v1/consultant/validations/${validationId}`);
        return response.data;
    }

    async createValidation(validationData: ConsultantValidationRequest): Promise<ConsultantValidation> {
        const response = await apiClient.post<{ data: ConsultantValidation }>('/api/v1/consultant/validations', validationData);
        return response.data;
    }

    async submitValidationResults(validationId: string, results: {
        validation_status: 'passed' | 'failed' | 'conditional_pass';
        findings: string;
        recommendations: string;
        test_results: Record<string, any>;
        supporting_documentation: File[];
        sign_off_notes: string;
    }): Promise<ConsultantValidation> {
        const response = await apiClient.put<{ data: ConsultantValidation }>(`/api/v1/consultant/validations/${validationId}/submit`, results);
        return response.data;
    }

    // Project Access Validation
    async validateProjectAccess(projectId: string): Promise<{
        has_access: boolean;
        access_level: 'full' | 'read_only' | 'restricted';
        accessible_modules: string[];
        restrictions: string[];
    }> {
        return apiClient.get(`/api/v1/consultant/projects/${projectId}/validate-access`);
    }

    async getTenantDataAccess(projectId: string, tenantId: string): Promise<{
        can_access_portfolio: boolean;
        can_access_calculations: boolean;
        can_access_models: boolean;
        data_restrictions: {
            date_range_start?: string;
            date_range_end?: string;
            account_filters?: string[];
            anonymization_level: 'none' | 'partial' | 'full';
        };
    }> {
        return apiClient.get(`/api/v1/consultant/projects/${projectId}/tenant-access/${tenantId}`);
    }

    // Consultant Deliverables
    async getDeliverables(projectId: string, params?: {
        page?: number;
        per_page?: number;
        deliverable_type?: string;
        status?: string;
    }): Promise<{ data: any[]; total: number }> {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/api/v1/consultant/projects/${projectId}/deliverables?${query}`);
    }

    async submitDeliverable(deliverableData: ConsultantDeliverableRequest): Promise<any> {
        const response = await apiClient.post<{ data: any }>('/api/v1/consultant/deliverables', deliverableData);
        return response.data;
    }

    async updateDeliverable(deliverableId: string, updates: Partial<ConsultantDeliverableRequest>): Promise<any> {
        const response = await apiClient.put<{ data: any }>(`/api/v1/consultant/deliverables/${deliverableId}`, updates);
        return response.data;
    }

    // Knowledge Transfer
    async getKnowledgeTransferSessions(projectId: string): Promise<{
        sessions: {
            id: string;
            session_type: 'training' | 'documentation_review' | 'hands_on' | 'assessment';
            title: string;
            description: string;
            scheduled_date: string;
            duration_minutes: number;
            attendees: string[];
            materials: string[];
            completion_status: 'scheduled' | 'completed' | 'cancelled';
        }[];
    }> {
        return apiClient.get(`/api/v1/consultant/projects/${projectId}/knowledge-transfer`);
    }

    async scheduleKnowledgeTransfer(projectId: string, sessionData: {
        session_type: 'training' | 'documentation_review' | 'hands_on' | 'assessment';
        title: string;
        description: string;
        scheduled_date: string;
        duration_minutes: number;
        attendee_ids: string[];
        required_materials: string[];
    }): Promise<any> {
        const response = await apiClient.post<{ data: any }>(`/api/v1/consultant/projects/${projectId}/knowledge-transfer`, sessionData);
        return response.data;
    }
}

export const consultantService = new ConsultantService();
