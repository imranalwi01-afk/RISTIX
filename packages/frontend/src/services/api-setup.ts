// packages/frontend/src/services/api-setup.ts
// ============================================================================
// API SETUP & CONFIGURATION
// ============================================================================
// Purpose: Lightweight setup for API client (Interceptors, URL init)
// Used by: api.ts, menu.api.ts, and other services that need configured client
// without pulling in the entire API domain tree.
// ============================================================================

import { AxiosResponse, AxiosError } from 'axios';
import { frontendEnvironmentLoader } from '../config/environment-loader-frontend';
import { apiClient } from './api-client';
import { sessionControlService } from './session-control.service';
import { getAuthToken } from '../utils/auth-token';
import { getErrorMessage } from '@/utils/error-message';

// Re-export apiClient for convenience
export { apiClient };

// ============================================================================
// 🏗️ URL INITIALIZATION
// ============================================================================
export let API_BASE_URL: string = '';
export let BACKEND_URL: string = '';

export const initializeUrls = () => {
    try {
        const config = frontendEnvironmentLoader.getConfiguration();

        // Always use config values
        API_BASE_URL = config?.api?.base || config?.api?.backend || '';
        BACKEND_URL = config?.urls?.backend || config?.api?.backend || '';

        // Update axios client
        if (API_BASE_URL) {
            apiClient.defaults.baseURL = API_BASE_URL;
        }
    } catch (error) {
        console.warn('⚠️ Failed to initialize URLs', error);
    }
};

// Initialize immediately
initializeUrls();

export const ensureCurrentUrls = () => {
    initializeUrls();
};

// ============================================================================
// RATE LIMITING
// ============================================================================
interface PendingRequest {
    timestamp: number;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

const pendingRequests = new Map<string, PendingRequest[]>();
const RATE_LIMIT_WINDOW = 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 3;

const getRequestKey = (config: any) => {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

const shouldThrottle = (url: string): boolean => {
    const skipThrottle = [
        '/health',
        '/auth/me',
        '/auth/me/permissions',
        '/auth/refresh',
        '/api/v1/auth/me',
        '/api/v1/auth/me/permissions',
        '/api/v1/auth/refresh'
    ];
    return !skipThrottle.some(endpoint => url.includes(endpoint));
};

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================
apiClient.interceptors.request.use(
    async (config) => {
        // 1. Environment Logging (Dev only or specific domains)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            // Keep logs minimal to avoid performance hit
        }

        // 2. Rate Limiting
        if (shouldThrottle(config.url || '')) {
            const now = Date.now();

            // Cleanup old requests
            for (const [key, requests] of pendingRequests.entries()) {
                const validRequests = requests.filter(req => now - req.timestamp < RATE_LIMIT_WINDOW);
                if (validRequests.length === 0) pendingRequests.delete(key);
                else pendingRequests.set(key, validRequests);
            }

            const urlPattern = config.url?.split('?')[0] || '';
            const similarRequests = Array.from(pendingRequests.keys())
                .filter(key => key.includes(urlPattern))
                .reduce((total, key) => total + (pendingRequests.get(key)?.length || 0), 0);

            if (similarRequests >= MAX_REQUESTS_PER_WINDOW) {
                const waitTime = RATE_LIMIT_WINDOW - (now % RATE_LIMIT_WINDOW);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        // 3. Auth Headers
        if (typeof window !== 'undefined') {
            const token = getAuthToken();
            
            // Enhanced logging for debugging
            const cookieToken = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1] : null;
            const localToken = localStorage.getItem('auth_token');
            const allCookies = typeof document !== 'undefined' ? document.cookie : 'N/A';
            
            console.log('🔑 [API Setup] Token check:', {
                hasToken: !!token,
                tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
                tokenSource: cookieToken ? 'cookie' : (localToken ? 'localStorage' : 'none'),
                cookieExists: !!cookieToken,
                localStorageExists: !!localToken,
                withCredentials: config.withCredentials,
                allCookies: allCookies.substring(0, 100),
                url: config.url
            });
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                // Development demo token fallback
                if (process.env.NODE_ENV === 'development') {
                    const demoToken = 'demo_token_PLATFORM_SUPER_ADMIN';
                    config.headers.Authorization = `Bearer ${demoToken}`;
                    console.log('🎭 [API Setup] Using demo token for development:', config.url);
                } else {
                    console.warn('⚠️ [API Setup] No token available for request:', config.url);
                    console.warn('   → Cookie token:', cookieToken ? 'exists' : 'missing');
                    console.warn('   → LocalStorage token:', localToken ? 'exists' : 'missing');
                    console.warn('   → All cookies:', allCookies);
                }
            }

            // Tenant Context
            const impersonatedTenantSlug = localStorage.getItem('impersonated_tenant_slug');
            if (impersonatedTenantSlug && impersonatedTenantSlug !== 'system') {
                config.headers['X-Tenant-Slug'] = impersonatedTenantSlug;
                config.headers['X-Impersonation-Mode'] = 'true';
            } else {
                const userData = localStorage.getItem('user_data');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user.tenantSlug) {
                            config.headers['X-Tenant-Slug'] = user.tenantSlug;
                        } else if (user.tenantId) {
                            config.headers['X-Tenant-ID'] = user.tenantId;
                        } else if ((user.userType === 'platform' || user.role?.includes('PLATFORM_')) && config.url?.includes('/ifrs9/')) {
                            config.headers['X-Tenant-Slug'] = 'iaf';
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }

        config.headers['X-Request-Time'] = new Date().toISOString();
        config.headers['X-Client'] = 'ifrs9-frontend';

        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        try {
            const friendlyMessage = getErrorMessage(error, error.message || 'Request failed');
            if (friendlyMessage && friendlyMessage !== error.message) {
                error.message = friendlyMessage;
            }
        } catch {
            // Keep original axios message if formatting fails.
        }

        // 1. Rate Limit Retry (429)
        if (error.response?.status === 429) {
            if (!originalRequest._retryCount) originalRequest._retryCount = 0;

            if (originalRequest._retryCount < MAX_RETRIES) {
                originalRequest._retryCount++;
                let retryDelay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
                const retryAfter = error.response.headers['retry-after'];
                if (retryAfter) retryDelay = parseInt(retryAfter) * 1000;

                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return apiClient(originalRequest);
            }
        }

        // 2. Session Control - LENIENT MODE
        if (typeof window !== 'undefined') {
            if (error.response?.status) {
                // 🔧 LENIENT: Don't immediately fail on 401, try refresh first
                if (error.response.status === 401 && originalRequest && !originalRequest._retryCount) {
                    originalRequest._retryCount = 0;
                }
                
                if (error.response.status === 401 && originalRequest._retryCount < 3) {
                    originalRequest._retryCount++;
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
                    
                    const newToken = getAuthToken();
                    if (newToken) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                }
                
                // Only handle error after retries exhausted
                if (error.response.status !== 401 || originalRequest._retryCount >= 3) {
                    const errorHandled = await sessionControlService.handleHttpError(error.response.status, error);
                    if (errorHandled) {
                        return Promise.reject(error);
                    }
                }
            } else if (!error.response) {
                await sessionControlService.handleNetworkError(error);
            }
        }

        return Promise.reject(error);
    }
);
