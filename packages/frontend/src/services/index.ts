// packages/frontend/src/services/index.ts
export * from './apiClient';
export * from './platformServices';
export * from './tenantServices';
export * from './authServices';
export * from './consultantServices';

// packages/frontend/src/services/apiClient.ts
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

// packages/frontend/src/services/authServices.ts
import { apiClient } from './apiClient';
import { User, AuthUser } from '../admin/providers/data/multiStakeholderDataProvider';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refresh_token: string;
  user: AuthUser;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirm_password: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
    if (response.success) {
      return response.user;
    }
    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout', {});
  }

  async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/api/v1/auth/me');
  }

  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/api/v1/auth/refresh', {});
    return response.token;
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post('/auth/password-reset/request', data);
  }

  async resetPassword(data: PasswordReset): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm', data);
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getStakeholderType(): string | null {
    return apiClient.getStakeholderType();
  }

  getTenantId(): string | null {
    return apiClient.getTenantId();
  }
}

export const authService = new AuthService();

// packages/frontend/src/services/platformServices.ts
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

// packages/frontend/src/services/tenantServices.ts
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

// packages/frontend/src/services/consultantServices.ts
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

// packages/frontend/src/utils/constants.ts
export const STAKEHOLDER_TYPES = {
  PLATFORM_ADMIN: 'platform_admin',
  BANK_ADMIN: 'bank_admin',
  BANK_USER: 'bank_user',
  CONSULTANT: 'consultant',
  REGULATOR: 'regulator',
} as const;

export const BANKING_TYPES = {
  CONVENTIONAL: 'conventional',
  SYARIAH: 'syariah',
  DUAL: 'dual',
} as const;

export const IFRS9_STAGES = {
  STAGE_1: 'stage_1',
  STAGE_2: 'stage_2',
  STAGE_3: 'stage_3',
} as const;

export const PROJECT_TYPES = {
  IMPLEMENTATION: 'implementation',
  VALIDATION: 'validation',
  AUDIT: 'audit',
  TRAINING: 'training',
} as const;

export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// packages/frontend/src/utils/permissions.ts
import { STAKEHOLDER_TYPES } from './constants';

export const PERMISSIONS = {
  // Platform Admin permissions
  PLATFORM_MANAGE_ALL: 'platform:manage:all',
  PLATFORM_VIEW_ALL_TENANTS: 'platform:view:all_tenants',
  PLATFORM_MANAGE_USERS: 'platform:manage:users',
  PLATFORM_MANAGE_INSTITUTIONS: 'platform:manage:institutions',
  PLATFORM_MANAGE_CONSULTANTS: 'platform:manage:consultants',

  // Bank Admin permissions
  TENANT_MANAGE_USERS: 'tenant:manage:users',
  TENANT_MANAGE_IFRS9: 'tenant:manage:ifrs9',
  TENANT_VIEW_REPORTS: 'tenant:view:reports',
  TENANT_MANAGE_CONSULTANTS: 'tenant:manage:consultants',

  // Bank User permissions
  TENANT_VIEW_PORTFOLIO: 'tenant:view:portfolio',
  TENANT_CALCULATE_ECL: 'tenant:calculate:ecl',
  TENANT_MANAGE_ACCOUNTS: 'tenant:manage:accounts',

  // Consultant permissions
  CONSULTANT_ACCESS_PROJECTS: 'consultant:access:projects',
  CONSULTANT_PERFORM_VALIDATION: 'consultant:perform:validation',
  CONSULTANT_SUBMIT_DELIVERABLES: 'consultant:submit:deliverables',
  CONSULTANT_ACCESS_TENANT_DATA: 'consultant:access:tenant_data',

  // Regulator permissions
  REGULATOR_VIEW_ALL_BANKS: 'regulator:view:all_banks',
  REGULATOR_AUDIT_COMPLIANCE: 'regulator:audit:compliance',
  REGULATOR_VIEW_CONSULTANT_WORK: 'regulator:view:consultant_work',
} as const;

export const STAKEHOLDER_PERMISSIONS = {
  [STAKEHOLDER_TYPES.PLATFORM_ADMIN]: [
    PERMISSIONS.PLATFORM_MANAGE_ALL,
    PERMISSIONS.PLATFORM_VIEW_ALL_TENANTS,
    PERMISSIONS.PLATFORM_MANAGE_USERS,
    PERMISSIONS.PLATFORM_MANAGE_INSTITUTIONS,
    PERMISSIONS.PLATFORM_MANAGE_CONSULTANTS,
  ],
  [STAKEHOLDER_TYPES.BANK_ADMIN]: [
    PERMISSIONS.TENANT_MANAGE_USERS,
    PERMISSIONS.TENANT_MANAGE_IFRS9,
    PERMISSIONS.TENANT_VIEW_REPORTS,
    PERMISSIONS.TENANT_MANAGE_CONSULTANTS,
    PERMISSIONS.TENANT_VIEW_PORTFOLIO,
    PERMISSIONS.TENANT_CALCULATE_ECL,
    PERMISSIONS.TENANT_MANAGE_ACCOUNTS,
  ],
  [STAKEHOLDER_TYPES.BANK_USER]: [
    PERMISSIONS.TENANT_VIEW_PORTFOLIO,
    PERMISSIONS.TENANT_CALCULATE_ECL,
    PERMISSIONS.TENANT_MANAGE_ACCOUNTS,
  ],
  [STAKEHOLDER_TYPES.CONSULTANT]: [
    PERMISSIONS.CONSULTANT_ACCESS_PROJECTS,
    PERMISSIONS.CONSULTANT_PERFORM_VALIDATION,
    PERMISSIONS.CONSULTANT_SUBMIT_DELIVERABLES,
    PERMISSIONS.CONSULTANT_ACCESS_TENANT_DATA,
  ],
  [STAKEHOLDER_TYPES.REGULATOR]: [
    PERMISSIONS.REGULATOR_VIEW_ALL_BANKS,
    PERMISSIONS.REGULATOR_AUDIT_COMPLIANCE,
    PERMISSIONS.REGULATOR_VIEW_CONSULTANT_WORK,
    PERMISSIONS.TENANT_VIEW_REPORTS,
    PERMISSIONS.TENANT_VIEW_PORTFOLIO,
  ],
} as const;

export function hasPermission(userStakeholderType: string, requiredPermission: string): boolean {
  const userPermissions = STAKEHOLDER_PERMISSIONS[userStakeholderType as keyof typeof STAKEHOLDER_PERMISSIONS];
  return userPermissions ? userPermissions.includes(requiredPermission as any) : false;
}

export function hasAnyPermission(userStakeholderType: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userStakeholderType, permission));
}

export function hasAllPermissions(userStakeholderType: string, requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userStakeholderType, permission));
}