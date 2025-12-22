// packages/frontend/src/admin/providers/data/bankingResourceDataProvider.ts
// ============================================================================
// Enhanced Banking Resource Data Provider for React Admin
// ============================================================================
// Generated: 2025-01-11
// Purpose: Data provider for banking resource CRUD operations in React Admin
// Methodology: React Admin v4 data provider with multi-tenant and dual banking support
// Dependencies: Enhanced banking resource API, authentication context
// ============================================================================

import { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteParams, GetManyParams, GetManyReferenceParams } from 'react-admin';

export interface BankingResourceDataProviderConfig {
  apiUrl: string;
  httpClient?: (url: string, options?: any) => Promise<any>;
}

export interface BankingResourceContext {
  tenantId: string;
  bankingType: 'conventional' | 'syariah';
  userType: string;
  permissions: string[];
}

export class BankingResourceDataProvider implements DataProvider {
  private apiUrl: string;
  private httpClient: (url: string, options?: any) => Promise<any>;
  private context: BankingResourceContext | null = null;

  constructor(config: BankingResourceDataProviderConfig) {
    // Use centralized dual-mode configuration
    this.apiUrl = config.apiUrl || this.getApiBaseUrl();
    this.httpClient = config.httpClient || this.defaultHttpClient;
  }

  // Centralized dual-mode API URL configuration - Use environment loader
  private getApiBaseUrl(): string {
    try {
      // Try to use centralized environment loader first
      const { frontendEnvironmentLoader } = require('../../../config/environment-loader-frontend');
      const config = frontendEnvironmentLoader.getConfiguration();
      console.log('✅ Banking Resource Provider: Using centralized API base URL:', config.api.base);
      return config.api.base;
    } catch (error) {
      console.warn('⚠️ Banking Resource Provider: Failed to load centralized API base URL, using fallback:', error);

      // Fallback to environment variables with hostname detection
      const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com');
      const fallbackUrl = process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        (isProductionDomain ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://bifrs9-iaf.ifrspro.id/api/v1');

      console.log('🔧 Banking Resource Provider: Using fallback API base URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  // Set banking context (called from auth provider)
  setBankingContext(context: BankingResourceContext) {
    this.context = context;
  }

  private defaultHttpClient = async (url: string, options: any = {}) => {
    const { method = 'GET', body, headers = {} } = options;

    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant context if available
    if (this.context?.tenantId) {
      headers['X-Tenant-ID'] = this.context.tenantId;
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Convert React Admin filters to API query parameters
  private buildQueryParams(params: any): URLSearchParams {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params.pagination) {
      queryParams.set('page', String(params.pagination.page));
      queryParams.set('limit', String(params.pagination.perPage));
    }

    // Sorting
    if (params.sort) {
      queryParams.set('sort', params.sort.field);
      queryParams.set('order', params.sort.order);
    }

    // Filtering
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.set(key, String(value));
        }
      });
    }

    return queryParams;
  }

  // Transform API response to React Admin format
  private transformResponse(response: any, total?: number) {
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: total || response.pagination?.total || response.data.length,
        pageInfo: response.pagination && {
          hasNextPage: response.pagination.page < response.pagination.totalPages,
          hasPreviousPage: response.pagination.page > 1,
        },
      };
    }

    if (response.data) {
      return { data: response.data };
    }

    return { data: response };
  }

  // Generic API call method
  private async apiCall(resource: string, method: string, params: any = {}) {
    const resourceMap: { [key: string]: string } = {
      'portfolio-accounts': 'portfolio-accounts',
      'customers': 'customers',
      'banking-products': 'products',
      'transactions': 'transactions',
      'collateral': 'collateral'
    };

    const apiResource = resourceMap[resource] || resource;
    let url = `${this.apiUrl}/banking/resources/${apiResource}`;

    switch (method) {
      case 'GET_LIST':
        const queryParams = this.buildQueryParams(params);
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
        break;

      case 'GET_ONE':
        url += `/${params.id}`;
        break;

      case 'CREATE':
        // POST to base URL
        break;

      case 'UPDATE':
        url += `/${params.id}`;
        break;

      case 'DELETE':
        url += `/${params.id}`;
        break;

      case 'GET_MANY':
        if (params.ids && params.ids.length > 0) {
          const ids = params.ids.join(',');
          url += `?ids=${ids}`;
        }
        break;

      case 'GET_MANY_REFERENCE':
        const refQueryParams = this.buildQueryParams(params);
        refQueryParams.set(params.target, params.id);
        url += `?${refQueryParams.toString()}`;
        break;
    }

    const options: any = {};

    switch (method) {
      case 'GET_LIST':
      case 'GET_ONE':
      case 'GET_MANY':
      case 'GET_MANY_REFERENCE':
        options.method = 'GET';
        break;

      case 'CREATE':
        options.method = 'POST';
        options.body = params.data;
        break;

      case 'UPDATE':
        options.method = 'PUT';
        options.body = params.data;
        break;

      case 'DELETE':
        options.method = 'DELETE';
        break;
    }

    try {
      console.log(`Banking Resource API: ${method} ${url}`, { params, options });
      const response = await this.httpClient(url, options);
      console.log(`Banking Resource API Response:`, response);
      return response;
    } catch (error) {
      console.error(`Banking Resource API Error: ${method} ${url}`, error);
      throw error;
    }
  }

  async getList(resource: string, params: GetListParams) {
    try {
      const response = await this.apiCall(resource, 'GET_LIST', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error fetching ${resource} list:`, error);
      throw error;
    }
  }

  async getOne(resource: string, params: GetOneParams) {
    try {
      const response = await this.apiCall(resource, 'GET_ONE', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error fetching ${resource} with id ${params.id}:`, error);
      throw error;
    }
  }

  async getMany(resource: string, params: GetManyParams) {
    try {
      const response = await this.apiCall(resource, 'GET_MANY', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error fetching multiple ${resource}:`, error);
      throw error;
    }
  }

  async getManyReference(resource: string, params: GetManyReferenceParams) {
    try {
      const response = await this.apiCall(resource, 'GET_MANY_REFERENCE', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error fetching ${resource} references:`, error);
      throw error;
    }
  }

  async create(resource: string, params: CreateParams) {
    try {
      const response = await this.apiCall(resource, 'CREATE', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  }

  async update(resource: string, params: UpdateParams) {
    try {
      const response = await this.apiCall(resource, 'UPDATE', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error updating ${resource} with id ${params.id}:`, error);
      throw error;
    }
  }

  async updateMany(resource: string, params: any) {
    try {
      // Use bulk update endpoint if available
      const url = `${this.apiUrl}/banking/resources/${resource}/bulk-update`;
      const response = await this.httpClient(url, {
        method: 'POST',
        body: {
          accountIds: params.ids,
          updateData: params.data,
        },
      });

      return {
        data: params.ids,
        total: params.ids.length,
      };
    } catch (error) {
      console.error(`Error bulk updating ${resource}:`, error);
      throw error;
    }
  }

  async delete(resource: string, params: DeleteParams) {
    try {
      const response = await this.apiCall(resource, 'DELETE', params);
      return this.transformResponse(response);
    } catch (error) {
      console.error(`Error deleting ${resource} with id ${params.id}:`, error);
      throw error;
    }
  }

  async deleteMany(resource: string, params: any) {
    try {
      const deletePromises = params.ids.map((id: string) =>
        this.apiCall(resource, 'DELETE', { id })
      );

      await Promise.all(deletePromises);

      return {
        data: params.ids,
        total: params.ids.length,
      };
    } catch (error) {
      console.error(`Error bulk deleting ${resource}:`, error);
      throw error;
    }
  }

  // Custom method for portfolio analytics
  async getPortfolioAnalytics(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.set('dateTo', params.dateTo);
      if (params.groupBy) queryParams.set('groupBy', params.groupBy);

      const url = `${this.apiUrl}/banking/resources/analytics/portfolio-summary?${queryParams.toString()}`;
      const response = await this.httpClient(url, { method: 'GET' });

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
      throw error;
    }
  }

  // Custom method for data export
  async exportData(resource: string, params: any = {}) {
    try {
      const url = `${this.apiUrl}/banking/resources/${resource}/export`;
      const response = await this.httpClient(url, {
        method: 'POST',
        body: {
          format: params.format || 'xlsx',
          filters: params.filters || {},
        },
      });

      return { data: response.data };
    } catch (error) {
      console.error(`Error exporting ${resource}:`, error);
      throw error;
    }
  }

  // Health check method
  async checkHealth() {
    try {
      const url = `${this.apiUrl}/banking/resources/health`;
      const response = await this.httpClient(url, { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Banking resource health check failed:', error);
      throw error;
    }
  }
}

// Factory function to create the data provider
export const createBankingResourceDataProvider = (config: BankingResourceDataProviderConfig): BankingResourceDataProvider => {
  return new BankingResourceDataProvider(config);
};

// Default data provider instance with centralized configuration
export const bankingResourceDataProvider = createBankingResourceDataProvider({
  apiUrl: (() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
      return 'https://iaf-ifrs-be.danafin.com/api/v1';
    }
    return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bifrs9-iaf.ifrspro.id/api/v1';
  })()
});

export default bankingResourceDataProvider;