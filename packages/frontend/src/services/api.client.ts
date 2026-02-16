import { getAuthToken } from '../utils/auth-token';
import { ApiResponse } from '../types/api';

/**
 * Base API client configuration - Use centralized environment loader
 */
const getBaseUrl = (): string => {
  try {
    // Try to use centralized environment loader first
    const { frontendEnvironmentLoader } = require('../config/environment-loader-frontend');
    const config = frontendEnvironmentLoader.getConfiguration();
    console.log('✅ Using centralized API base URL:', config.api.base);
    return config.api.base;
  } catch (error) {
    console.warn('⚠️ Failed to load centralized API base URL, using fallback:', error);

    // Fallback to environment variables with hostname detection
    const isProductionDomain = typeof window !== 'undefined' && (window.location.hostname.includes('danafin.com') || window.location.hostname.includes('ifrspro.id'));
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let fallbackUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

    if (isLocalhost) {
      console.log('🔧 Localhost detected: Forcing local API URL');
      fallbackUrl = 'http://localhost:4232/api/v1';
    } else if (!fallbackUrl) {
      if (isProductionDomain) {
        fallbackUrl = 'https://iaf-ifrs-be.ifrspro.id/api/v1';
      } else {
        fallbackUrl = 'https://iaf-ifrs-be.ifrspro.id/api/v1';
      }
    }

    console.log('🔧 Resolved API Base URL:', fallbackUrl);
    return fallbackUrl;
  }
};

const BASE_URL = getBaseUrl();

/**
 * Generic API client class
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authentication token from localStorage or session
   */
  private getAuthToken(): string | null {
    return getAuthToken();
  }

  /**
   * Get tenant context from localStorage or session
   */
  private getTenantContext(): string | null {
    if (typeof window === 'undefined') return null;

    return localStorage.getItem('tenant_slug') || sessionStorage.getItem('tenant_slug');
  }

  /**
   * Build headers for API requests
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication token
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant context - Prioritize impersonation for admins
    const impersonatedSlug = typeof window !== 'undefined' ? localStorage.getItem('impersonated_tenant_slug') : null;
    const contextSlug = impersonatedSlug || this.getTenantContext();

    if (contextSlug) {
      headers['X-Tenant-Slug'] = contextSlug;
    }

    // Merge custom headers
    return { ...headers, ...customHeaders };
  }

  /**
   * Generic GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
      ...options,
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for URL: ${url}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} for URL ${url}`);
    }

    return response.json();
  }

  /**
   * Generic POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const formData = new FormData();
    formData.append('file', file);

    // Add additional form data
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const token = this.getAuthToken();
    const tenantSlug = this.getTenantContext();

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;
