import { DataProvider, GetListParams, GetOneParams, GetManyParams, GetManyReferenceParams, CreateParams, UpdateParams, UpdateManyParams, DeleteParams, DeleteManyParams } from 'react-admin';
import { getAuthToken } from '../../../utils/auth-token';

// =============================================================================
// TYPESCRIPT INTERFACES
// =============================================================================

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash?: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  stakeholder_type: 'platform_admin' | 'bank_admin' | 'bank_user' | 'consultant' | 'regulator';
  tenant_id?: string;
  banking_institution_id?: string;
  consultant_specialization?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface BankingInstitution {
  id: string;
  institution_name: string;
  institution_code: string;
  banking_type: 'conventional' | 'syariah' | 'dual';
  license_type: string;
  country: string;
  database_name: string;
  tenant_database: string;
  status: 'active' | 'inactive' | 'pending';
  is_active: boolean;
  consultant_project_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultantProject {
  id: string;
  bank_id: string;
  banking_institution_id: string;
  consultant_id: string;
  consultant_user_id: string;
  project_name: string;
  project_type: 'model_validation' | 'data_implementation' | 'compliance_review' | 'implementation' | 'validation' | 'audit' | 'training';
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  deliverables: string;
  description: string;
  budget_allocated?: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultantValidation {
  id: string;
  project_id: string;
  validation_type: 'model_validation' | 'backtesting' | 'stress_testing';
  model_type: string;
  status: 'pending' | 'consultant_approved' | 'rejected';
  sign_off_date?: string;
  consultant_notes: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioAccount {
  id: string;
  account_number: string;
  customer_name: string;
  product_type: string;
  outstanding_amount: number;
  ifrs9_stage: 'stage_1' | 'stage_2' | 'stage_3';
  consultant_validated: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface ECLCalculation {
  id: string;
  account_id: string;
  calculation_date: string;
  ecl_amount: number;
  consultant_validation_id?: string;
  validation_status: 'pending' | 'consultant_approved' | 'rejected';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface ModelConfiguration {
  id: string;
  model_type: string;
  parameters: Record<string, any>;
  consultant_approved: boolean;
  approval_date?: string;
  consultant_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetrics {
  total_users: number;
  active_banking_institutions: number;
  active_consultant_projects: number;
  total_tenants: number;
  system_uptime: string;
  platform_version: string;
  last_updated: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  stakeholder_type: string;
  tenant_id?: string;
  permissions: string[];
  token: string;
}

// =============================================================================
// API CONFIGURATION
// =============================================================================

const getApiBaseUrl = (): string => {
  // Use centralized dual-mode configuration
  if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
    return 'https://iaf-ifrs-be.danafin.com';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://bifrs9-iaf.ifrspro.id';
};

const API_BASE_URL = getApiBaseUrl();

const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH: '/api/v1/auth/refresh'
  },

  // Platform Admin APIs (Cross-tenant)
  PLATFORM: {
    USERS: '/api/v1/platform/users',
    BANKING_INSTITUTIONS: '/api/v1/platform/banking-institutions',
    CONSULTANT_PROJECTS: '/api/v1/platform/consultant-projects',
    CONSULTANT_VALIDATIONS: '/api/v1/platform/consultant-validations',
    METRICS: '/api/v1/platform/metrics',
    TENANTS: '/api/v1/platform/tenants',
    SYSTEM_CONFIG: '/api/v1/platform/system-config'
  },

  // Tenant-specific APIs
  TENANT: {
    PORTFOLIO_ACCOUNTS: (tenantId: string) => `/api/v1/tenants/${tenantId}/portfolio/accounts`,
    ECL_CALCULATIONS: (tenantId: string) => `/api/v1/tenants/${tenantId}/ecl/calculations`,
    MODEL_CONFIGURATIONS: (tenantId: string) => `/api/v1/tenants/${tenantId}/models/configurations`,
    CONVENTIONAL: (tenantId: string) => `/api/v1/tenants/${tenantId}/conventional`,
    SYARIAH: (tenantId: string) => `/api/v1/tenants/${tenantId}/syariah`,
    SHARED: (tenantId: string) => `/api/v1/tenants/${tenantId}/shared`
  }
} as const;

// =============================================================================
// HTTP CLIENT WITH AUTHENTICATION
// =============================================================================

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private userStakeholderType: string | null = null;
  private tenantId: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadAuthFromStorage();
  }

  private loadAuthFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.authToken = getAuthToken();
      // Get current user token from localStorage
      const token = getAuthToken();
      if (!token) {
        // If no token, clear other auth related items to ensure clean state
        this.clearAuthFromStorage();
        return;
      }
      this.refreshToken = localStorage.getItem('refresh_token');
      this.userStakeholderType = localStorage.getItem('user_stakeholder_type');
      this.tenantId = localStorage.getItem('user_tenant_id');
    }
  }

  private saveAuthToStorage(token: string, refreshToken: string, user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_stakeholder_type', user.stakeholder_type);
      localStorage.setItem('user_tenant_id', user.tenant_id || '');
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    this.authToken = token;
    this.refreshToken = refreshToken;
    this.userStakeholderType = user.stakeholder_type;
    this.tenantId = user.tenant_id || null;
  }

  private clearAuthFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_stakeholder_type');
      localStorage.removeItem('user_tenant_id');
      localStorage.removeItem('user_data');
    }
    this.authToken = null;
    this.refreshToken = null;
    this.userStakeholderType = null;
    this.tenantId = null;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.tenantId && this.userStakeholderType !== 'platform_admin') {
      headers['X-Tenant-ID'] = this.tenantId;
    }

    return headers;
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearAuthFromStorage();
      throw new Error('Failed to refresh authentication token');
    }

    const data = await response.json();
    this.authToken = data.token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token refresh for 401 responses
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAuthToken();
        // Retry with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${this.authToken}`,
          },
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        this.clearAuthFromStorage();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await this.request<{
      success: boolean;
      token: string;
      refresh_token: string;
      user: AuthUser;
    }>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      this.saveAuthToStorage(response.token, response.refresh_token, response.user);
      return response.user;
    }

    throw new Error('Login failed');
  }

  async logout(): Promise<void> {
    if (this.authToken) {
      try {
        await this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
    }
    this.clearAuthFromStorage();
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.request<AuthUser>(API_ENDPOINTS.AUTH.ME);
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getStakeholderType(): string | null {
    return this.userStakeholderType;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }
}

// =============================================================================
// MULTI-STAKEHOLDER DATA PROVIDER
// =============================================================================

class MultiStakeholderDataProvider implements DataProvider {
  private apiClient: ApiClient;

  constructor(apiBaseUrl?: string) {
    this.apiClient = new ApiClient(apiBaseUrl);
  }

  // React Admin DataProvider interface implementation
  async getList(resource: string, params: GetListParams) {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort_field: field,
      sort_order: order.toLowerCase(),
      ...params.filter,
    });

    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{
      data: any[];
      total: number;
      page: number;
      per_page: number;
    }>(`${endpoint}?${query}`);

    return {
      data: response.data,
      total: response.total,
    };
  }

  async getOne(resource: string, params: GetOneParams) {
    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{ data: any }>(`${endpoint}/${params.id}`);
    return { data: response.data };
  }

  async getMany(resource: string, params: GetManyParams) {
    const endpoint = this.getResourceEndpoint(resource);
    const query = new URLSearchParams({
      ids: params.ids.join(','),
    });
    const response = await this.apiClient.request<{ data: any[] }>(`${endpoint}?${query}`);
    return { data: response.data };
  }

  async getManyReference(resource: string, params: GetManyReferenceParams) {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      sort_field: field,
      sort_order: order.toLowerCase(),
      [params.target]: params.id.toString(),
      ...params.filter,
    });

    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{
      data: any[];
      total: number;
    }>(`${endpoint}?${query}`);

    return {
      data: response.data,
      total: response.total,
    };
  }

  async create(resource: string, params: CreateParams) {
    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{ data: any }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });
    return { data: response.data };
  }

  async update(resource: string, params: UpdateParams) {
    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{ data: any }>(`${endpoint}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: response.data };
  }

  async updateMany(resource: string, params: UpdateManyParams) {
    const endpoint = this.getResourceEndpoint(resource);
    const response = await this.apiClient.request<{ data: any[] }>(`${endpoint}/bulk`, {
      method: 'PUT',
      body: JSON.stringify({
        ids: params.ids,
        data: params.data,
      }),
    });
    return { data: params.ids };
  }

  async delete(resource: string, params: DeleteParams) {
    const endpoint = this.getResourceEndpoint(resource);
    await this.apiClient.request(`${endpoint}/${params.id}`, {
      method: 'DELETE',
    });
    return { data: params.previousData };
  }

  async deleteMany(resource: string, params: DeleteManyParams) {
    const endpoint = this.getResourceEndpoint(resource);
    await this.apiClient.request(`${endpoint}/bulk`, {
      method: 'DELETE',
      body: JSON.stringify({ ids: params.ids }),
    });
    return { data: params.ids };
  }

  // Custom methods for multi-stakeholder operations
  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.apiClient.request<SystemMetrics>(API_ENDPOINTS.PLATFORM.METRICS);
  }

  async createConsultantProject(projectData: Partial<ConsultantProject>): Promise<ConsultantProject> {
    const response = await this.apiClient.request<{ data: ConsultantProject }>(
      API_ENDPOINTS.PLATFORM.CONSULTANT_PROJECTS,
      {
        method: 'POST',
        body: JSON.stringify(projectData),
      }
    );
    return response.data;
  }

  async validateConsultantAccess(projectId: string, consultantId: string): Promise<boolean> {
    try {
      const response = await this.apiClient.request<{ has_access: boolean }>(
        `/api/v1/platform/consultant-projects/${projectId}/validate-access/${consultantId}`
      );
      return response.has_access;
    } catch (error) {
      return false;
    }
  }

  async getTenantData(tenantId: string, resource: string): Promise<any[]> {
    const stakeholderType = this.apiClient.getStakeholderType();

    // Only platform admins and authorized users can access tenant data
    if (stakeholderType !== 'platform_admin' && this.apiClient.getTenantId() !== tenantId) {
      throw new Error('Unauthorized access to tenant data');
    }

    const endpoint = this.getTenantResourceEndpoint(tenantId, resource);
    const response = await this.apiClient.request<{ data: any[] }>(endpoint);
    return response.data;
  }

  // Helper methods
  private getResourceEndpoint(resource: string): string {
    const stakeholderType = this.apiClient.getStakeholderType();
    const tenantId = this.apiClient.getTenantId();

    // Map resources to endpoints based on stakeholder type
    switch (resource) {
      case 'users':
        return stakeholderType === 'platform_admin'
          ? API_ENDPOINTS.PLATFORM.USERS
          : `/api/v1/tenants/${tenantId}/users`;

      case 'banking_institutions':
        return API_ENDPOINTS.PLATFORM.BANKING_INSTITUTIONS;

      case 'consultant_projects':
        return API_ENDPOINTS.PLATFORM.CONSULTANT_PROJECTS;

      case 'consultant_validations':
        return API_ENDPOINTS.PLATFORM.CONSULTANT_VALIDATIONS;

      case 'portfolio_accounts':
        if (!tenantId) throw new Error('Tenant ID required for portfolio accounts');
        return API_ENDPOINTS.TENANT.PORTFOLIO_ACCOUNTS(tenantId);

      case 'ecl_calculations':
        if (!tenantId) throw new Error('Tenant ID required for ECL calculations');
        return API_ENDPOINTS.TENANT.ECL_CALCULATIONS(tenantId);

      case 'model_configurations':
        if (!tenantId) throw new Error('Tenant ID required for model configurations');
        return API_ENDPOINTS.TENANT.MODEL_CONFIGURATIONS(tenantId);

      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private getTenantResourceEndpoint(tenantId: string, resource: string): string {
    switch (resource) {
      case 'portfolio_accounts':
        return API_ENDPOINTS.TENANT.PORTFOLIO_ACCOUNTS(tenantId);
      case 'ecl_calculations':
        return API_ENDPOINTS.TENANT.ECL_CALCULATIONS(tenantId);
      case 'model_configurations':
        return API_ENDPOINTS.TENANT.MODEL_CONFIGURATIONS(tenantId);
      case 'conventional':
        return API_ENDPOINTS.TENANT.CONVENTIONAL(tenantId);
      case 'syariah':
        return API_ENDPOINTS.TENANT.SYARIAH(tenantId);
      case 'shared':
        return API_ENDPOINTS.TENANT.SHARED(tenantId);
      default:
        throw new Error(`Unknown tenant resource: ${resource}`);
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthUser> {
    return this.apiClient.login(email, password);
  }

  async logout(): Promise<void> {
    return this.apiClient.logout();
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.apiClient.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.apiClient.isAuthenticated();
  }

  getStakeholderType(): string | null {
    return this.apiClient.getStakeholderType();
  }

  getTenantId(): string | null {
    return this.apiClient.getTenantId();
  }
}

// =============================================================================
// AUTHENTICATION PROVIDER
// =============================================================================

export const multiStakeholderAuthProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const dataProvider = new MultiStakeholderDataProvider();
    try {
      const user = await dataProvider.login(email, password);
      return Promise.resolve(user);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  logout: async () => {
    const dataProvider = new MultiStakeholderDataProvider();
    await dataProvider.logout();
    return Promise.resolve();
  },

  checkAuth: async () => {
    const dataProvider = new MultiStakeholderDataProvider();
    if (dataProvider.isAuthenticated()) {
      try {
        await dataProvider.getCurrentUser();
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error('Not authenticated'));
  },

  checkError: async (error: any) => {
    if (error.status === 401 || error.status === 403) {
      return Promise.reject(error);
    }
    return Promise.resolve();
  },

  getIdentity: async () => {
    const dataProvider = new MultiStakeholderDataProvider();
    if (dataProvider.isAuthenticated()) {
      try {
        const user = await dataProvider.getCurrentUser();
        return Promise.resolve({
          id: user.id,
          fullName: user.full_name,
          avatar: undefined,
        });
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(new Error('Not authenticated'));
  },

  getPermissions: async () => {
    const dataProvider = new MultiStakeholderDataProvider();
    const stakeholderType = dataProvider.getStakeholderType();

    // Define permissions based on stakeholder type
    const permissions = {
      platform_admin: ['all'],
      bank_admin: ['tenant_admin', 'ifrs9_manage', 'users_manage'],
      bank_user: ['ifrs9_view', 'ifrs9_calculate', 'portfolio_manage'],
      consultant: ['project_access', 'validation_perform', 'reports_generate'],
      regulator: ['all_banks_view', 'compliance_audit', 'reports_view'],
    };

    return Promise.resolve(permissions[stakeholderType as keyof typeof permissions] || []);
  },
};

// =============================================================================
// EXPORT DEFAULT DATA PROVIDER INSTANCE
// =============================================================================

export const multiStakeholderDataProvider = new MultiStakeholderDataProvider();
export default multiStakeholderDataProvider;