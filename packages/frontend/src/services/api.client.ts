import { getAuthToken } from '../utils/auth-token';
import { ApiResponse } from '../types/api';
import { frontendEnvironmentLoader } from '../config/environment-loader-frontend';

/**
 * Base API client configuration - Use centralized environment loader
 */
const getBaseUrl = (): string => {
  try {
    const config = frontendEnvironmentLoader.getConfiguration();
    return config.api.base;
  } catch {
    return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '/api/v1';
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
    let token = this.getAuthToken();
    
    // ✅ SURGICAL FIX: Add demo token fallback for development
    if (!token && process.env.NODE_ENV === 'development') {
      token = 'demo_token_PLATFORM_SUPER_ADMIN';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add tenant context - Prioritize impersonation for admins
    const impersonatedSlug = typeof window !== 'undefined' ? localStorage.getItem('impersonated_tenant_slug') : null;
    const contextSlug = impersonatedSlug || this.getTenantContext();

    if (contextSlug) {
      headers['X-Tenant-Slug'] = contextSlug;
    } else if (!token?.startsWith('demo_token_') && process.env.NODE_ENV === 'development') {
      // Fallback for demo mode if no slug present
      headers['X-Tenant-Slug'] = 'iaf';
    }

    // Merge custom headers
    return { ...headers, ...customHeaders };
  }

  /**
   * Parse API response safely.
   * Handles 201/204 responses with empty bodies without throwing JSON parse errors.
   */
  private async parseResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
    const rawBody = await response.text();
    if (!rawBody || rawBody.trim().length === 0) {
      return {
        success: true,
        data: null as T,
      };
    }

    try {
      return JSON.parse(rawBody) as ApiResponse<T>;
    } catch {
      return {
        success: true,
        data: rawBody as T,
      };
    }
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

    return this.parseResponse<T>(response);
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

    return this.parseResponse<T>(response);
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

    return this.parseResponse<T>(response);
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

    return this.parseResponse<T>(response);
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

    return this.parseResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default
export default apiClient;
