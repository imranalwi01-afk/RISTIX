// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/providers/auth/authProvider.ts
// Status: ✅ WORKING - Authentication fully functional
// Issue Fixed: Backend sends "token" field, not "accessToken"
// Integration: Frontend ↔ Backend authentication working perfectly
// Test Status: Login successful with admin@ifrs9.demo / admin123
// ============================================================================

import { AuthProvider } from 'react-admin';

// Types for authentication
interface LoginParams {
  username: string;
  password: string;
  tenantId?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
}

interface UserIdentity {
  id: string;
  fullName: string;
  email: string;
  tenantId: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  roles: string[];
  permissions: string[];
  avatar?: string;
}

/**
 * Multi-tenant Authentication Provider for IFRS 9 Platform
 * Supports both conventional and Syariah banking authentication
 * ✅ Status: Fully working with backend integration
 */
export const authProvider: AuthProvider = {
  // Login method with multi-tenant support
  login: async ({ username, password, tenantId, bankingType }: LoginParams) => {
    try {
      // Validate input parameters
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // API endpoint for authentication - Use centralized configuration
      let apiUrl: string;
      try {
        const { frontendEnvironmentLoader } = require('../../../config/environment-loader-frontend');
        const config = frontendEnvironmentLoader.getConfiguration();
        apiUrl = config.api.base;
        console.log('✅ React Admin Auth Provider: Using centralized API URL:', apiUrl);
      } catch (error) {
        console.warn('⚠️ React Admin Auth Provider: Failed to load centralized API URL, using fallback:', error);

        // Fallback to environment variables with hostname detection
        const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com');
        apiUrl = process.env.NEXT_PUBLIC_API_URL ||
          (isProductionDomain ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1');
        console.log('🔧 React Admin Auth Provider: Using fallback API URL:', apiUrl);
      }
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          tenantId,
          bankingType: bankingType || 'conventional'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const data = await response.json();
      
      // ✅ FIXED: Backend sends "token" field (not "accessToken")
      if (data.success && data.data && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken || '');
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('tenantId', data.data.user.tenantId || 'demo-bank');
        localStorage.setItem('bankingType', data.data.user.bankingType || 'conventional');
        
        // Store tenant configuration
        if (data.data.tenantConfig) {
          localStorage.setItem('tenantConfig', JSON.stringify(data.data.tenantConfig));
        }
        
        console.log('✅ LOGIN SUCCESS: Token stored successfully');
        return Promise.resolve();
      } else {
        console.error('❌ LOGIN FAILED: No authentication token in response');
        throw new Error('No authentication token received');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return Promise.reject(error);
    }
  },

  // Logout method
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Call logout API to invalidate token
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://iaf-ifrs-be.danafin.com/api/v1';
        
        try {
          await fetch(`${apiUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }
      
      // Clear all stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('bankingType');
      localStorage.removeItem('tenantConfig');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    }
  },

  // Check authentication status
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return Promise.reject(new Error('No authentication token found'));
      }

      // Verify token with backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://iaf-ifrs-be.danafin.com/api/v1';
      
      const response = await fetch(`${apiUrl}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              
              // ✅ FIXED: Use correct field name for token
              if (refreshData.success && refreshData.data && refreshData.data.token) {
                localStorage.setItem('token', refreshData.data.token);
                localStorage.setItem('refreshToken', refreshData.data.refreshToken || refreshToken);
                return Promise.resolve();
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return Promise.reject(new Error('Authentication token is invalid'));
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Auth check error:', error);
      return Promise.reject(error);
    }
  },

  // Check error responses for authentication issues
  checkError: async (error: any) => {
    const status = error.status;
    
    if (status === 401 || status === 403) {
      // Clear authentication data on auth errors
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('bankingType');
      localStorage.removeItem('tenantConfig');
      
      return Promise.reject(error);
    }
    
    return Promise.resolve();
  },

  // Get user identity
  getIdentity: async (): Promise<UserIdentity> => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        throw new Error('No user data found');
      }

      const user = JSON.parse(userStr);
      
      return Promise.resolve({
        id: user.id,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
        tenantId: user.tenantId || 'demo-bank',
        bankingType: user.bankingType || 'conventional',
        roles: user.roles || [],
        permissions: user.permissions || [],
        avatar: user.avatar
      });
    } catch (error) {
      console.error('Get identity error:', error);
      return Promise.reject(error);
    }
  },

  // Get permissions for a resource
  getPermissions: async () => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        return Promise.resolve([]);
      }

      const user = JSON.parse(userStr);
      const permissions = user.permissions || [];
      
      return Promise.resolve(permissions);
    } catch (error) {
      console.error('Get permissions error:', error);
      return Promise.resolve([]);
    }
  },
};

// Helper functions for authentication state
export const authHelpers = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: (): UserIdentity | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Get current tenant ID
  getCurrentTenantId: (): string | null => {
    return localStorage.getItem('tenantId');
  },

  // Get current banking type
  getCurrentBankingType: (): 'conventional' | 'syariah' | 'dual' => {
    return (localStorage.getItem('bankingType') as any) || 'conventional';
  },

  // Get authentication token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Get tenant configuration
  getTenantConfig: (): any => {
    try {
      const configStr = localStorage.getItem('tenantConfig');
      return configStr ? JSON.parse(configStr) : null;
    } catch {
      return null;
    }
  },

  // Check if user has permission
  hasPermission: (permission: string): boolean => {
    try {
      const user = authHelpers.getCurrentUser();
      return user?.permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  },

  // Check if user has role
  hasRole: (role: string): boolean => {
    try {
      const user = authHelpers.getCurrentUser();
      return user?.roles?.includes(role) || false;
    } catch {
      return false;
    }
  }
};

export default authProvider;