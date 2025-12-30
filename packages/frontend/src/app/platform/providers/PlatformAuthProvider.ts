// packages/frontend/src/app/platform/providers/PlatformAuthProvider.ts
// ============================================================================
// UPDATED PLATFORM AUTH PROVIDER - Compatible with Your Authentication System
// ============================================================================
// ✅ Uses your existing localStorage patterns
// ✅ Compatible with your JWT system
// ✅ Works with your demo users and DANA Digital Bank
// ✅ Integrates with your existing API service
// ============================================================================

import { AuthProvider } from 'react-admin';
import { getAuthToken, clearAuthTokens, syncTokenToCookie } from '../../../utils/auth-token';

// ============================================================================
// AUTH PROVIDER IMPLEMENTATION
// ============================================================================

export const authProvider: AuthProvider = {
  // ============================================================================
  // LOGIN - Integrates with your existing auth system
  // ============================================================================
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      console.log('🔐 Platform Admin Login attempt:', username);

      // ✅ FIXED: Use centralized configuration with environment variable support
      const getBackendUrl = () => {
        // First check for environment variable
        if (process.env.NEXT_PUBLIC_API_BASE_URL) {
          // Remove /api/v1 suffix if it exists to get the base URL
          return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
        } else if (process.env.NEXT_PUBLIC_BACKEND_URL) {
          return process.env.NEXT_PUBLIC_BACKEND_URL;
        }

        // Fallback for production/staging URLs based on hostname
        if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
          return 'https://iaf-ifrs-be.danafin.com';
        }
        if (typeof window !== 'undefined' && window.location.hostname.includes('ifrspro.id')) {
          return 'https://bifrs9-iaf.ifrspro.id';
        }

        // Default local fallback
        return 'http://localhost:3000';
      };

      const response = await fetch(`${getBackendUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username, // Your backend expects 'email'
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const authData = await response.json();
      console.log('✅ Platform Admin Authentication successful:', authData);

      if (authData.success && authData.data) {
        const { user, token, refreshToken } = authData.data;

        // ✅ Verify this is a platform admin user
        const isPlatformAdmin = user.role && (
          user.role.includes('PLATFORM_SUPER_ADMIN') ||
          user.role.includes('PLATFORM_ADMIN') ||
          user.role.includes('PLATFORM_TECH_ADMIN') ||
          user.role.includes('PLATFORM_OPERATIONS') ||
          user.role.includes('PLATFORM_SUPPORT') ||
          user.role.includes('IAF_TENANT_SUPERADMIN') ||
          user.role.includes('IAF_IFRS_MANAGER') ||
          user.role.includes('IAF_BANK_CRO') ||
          user.role.includes('SUPERADMIN') ||
          user.role.includes('ADMIN')
        );

        if (!isPlatformAdmin) {
          throw new Error('Access denied. Platform administrator privileges required.');
        }

        // ✅ Store auth data using your existing patterns
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // ✅ SYNC TO COOKIES for middleware/SSR
        syncTokenToCookie(token);

        console.log('✅ Platform Admin access granted for:', user.email);
        return Promise.resolve();
      } else {
        throw new Error(authData.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Platform admin login error:', error);
      throw error;
    }
  },

  // ============================================================================
  // LOGOUT - Clears auth data and calls backend logout
  // ============================================================================
  logout: async () => {
    try {
      const token = localStorage.getItem('auth_token');

      if (token) {
        // ✅ FIXED: Use centralized configuration for dual-mode support
        // ✅ FIXED: Use centralized configuration with environment variable support
        const getBackendUrl = () => {
          if (process.env.NEXT_PUBLIC_API_BASE_URL) {
            return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
          } else if (process.env.NEXT_PUBLIC_BACKEND_URL) {
            return process.env.NEXT_PUBLIC_BACKEND_URL;
          }

          if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
            return 'https://iaf-ifrs-be.danafin.com';
          }
          if (typeof window !== 'undefined' && window.location.hostname.includes('ifrspro.id')) {
            return 'https://bifrs9-iaf.ifrspro.id';
          }
          return 'http://localhost:3000';
        };

        await fetch(`${getBackendUrl()}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // ✅ Always clear local auth data and cookies
      clearAuthTokens();
      console.log('✅ Platform Admin logout completed');
    }

    return Promise.resolve();
  },

  // ============================================================================
  // CHECK ERROR - Handles authentication errors
  // ============================================================================
  checkError: async (error) => {
    const status = error.status;
    console.log('🔍 Platform Admin Auth Error Check:', status);

    if (status === 401 || status === 403) {
      clearAuthTokens();
      return Promise.reject();
    }

    return Promise.resolve();
  },

  // ============================================================================
  // CHECK AUTH - Verifies user is authenticated and authorized
  // ============================================================================
  checkAuth: async () => {
    try {
      const token = getAuthToken();
      const userData = localStorage.getItem('user_data');

      if (!token || !userData) {
        console.log('❌ No platform admin authentication data found');
        throw new Error('No authentication data found');
      }

      const user = JSON.parse(userData);

      // ✅ Verify platform admin privileges
      const isPlatformAdmin = user.role && (
        user.role.includes('PLATFORM_SUPER_ADMIN') ||
        user.role.includes('PLATFORM_ADMIN') ||
        user.role.includes('PLATFORM_TECH_ADMIN') ||
        user.role.includes('PLATFORM_OPERATIONS') ||
        user.role.includes('PLATFORM_SUPPORT') ||
        user.role.includes('IAF_TENANT_SUPERADMIN') ||
        user.role.includes('IAF_IFRS_MANAGER') ||
        user.role.includes('IAF_BANK_CRO') ||
        user.role.includes('SUPERADMIN') ||
        user.role.includes('ADMIN')
      );

      if (!isPlatformAdmin) {
        console.log('❌ User does not have platform admin privileges:', user.role);
        throw new Error('Platform administrator privileges required');
      }

      // ✅ FIXED: Use centralized configuration with environment variable support
      try {
        const getBackendUrl = () => {
          if (process.env.NEXT_PUBLIC_API_BASE_URL) {
            return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
          } else if (process.env.NEXT_PUBLIC_BACKEND_URL) {
            return process.env.NEXT_PUBLIC_BACKEND_URL;
          }

          if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
            return 'https://iaf-ifrs-be.danafin.com';
          }
          if (typeof window !== 'undefined' && window.location.hostname.includes('ifrspro.id')) {
            return 'https://bifrs9-iaf.ifrspro.id';
          }
          return 'http://localhost:3000';
        };

        const response = await fetch(`${getBackendUrl()}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        console.log('✅ Platform Admin auth check passed for:', user.email);
        return Promise.resolve();
      } catch (tokenError) {
        console.log('⚠️ Token verification failed, clearing auth data');
        clearAuthTokens();
        throw new Error('Authentication token invalid or expired');
      }
    } catch (error) {
      console.warn('❌ Platform Admin auth check failed:', error);
      return Promise.reject();
    }
  },

  // ============================================================================
  // GET PERMISSIONS - Returns user permissions for React Admin
  // ============================================================================
  getPermissions: async () => {
    try {
      const userData = localStorage.getItem('user_data');

      if (!userData) {
        console.log('❌ No user data for permissions check');
        return Promise.resolve([]);
      }

      const user = JSON.parse(userData);

      // ✅ Return platform admin permissions based on role
      const platformPermissions = [
        'platform.tenants.list',
        'platform.tenants.create',
        'platform.tenants.edit',
        'platform.consultants.list',
        'platform.consultants.create',
        'platform.consultants.edit',
        'platform.users.list',
        'platform.users.create',
        'platform.users.edit',
        'platform.analytics.view',
        'platform.infrastructure.view',
        'platform.audit.view',
        'platform.support.manage',
      ];

      // Add additional permissions for super admins
      if (user.role.includes('SUPER_ADMIN')) {
        platformPermissions.push(
          'platform.tenants.delete',
          'platform.consultants.delete',
          'platform.users.delete',
          'platform.config.manage',
          'platform.system.admin'
        );
      }

      console.log('✅ Platform Admin permissions:', platformPermissions);
      return Promise.resolve(platformPermissions);
    } catch (error) {
      console.error('❌ Get permissions error:', error);
      return Promise.resolve([]);
    }
  },

  // ============================================================================
  // GET IDENTITY - Returns current user info for React Admin
  // ============================================================================
  getIdentity: async () => {
    try {
      const userData = localStorage.getItem('user_data');

      if (!userData) {
        console.log('❌ No user data for identity');
        throw new Error('No user data found');
      }

      const user = JSON.parse(userData);

      const identity = {
        id: user.id || user.email,
        fullName: user.fullName || user.full_name || user.username,
        email: user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=667eea&color=fff`,
        role: user.role,
        company: 'IFRS9 Platform Administration',
      };

      console.log('✅ Platform Admin identity:', identity);
      return Promise.resolve(identity);
    } catch (error) {
      console.error('❌ Get identity error:', error);
      return Promise.reject();
    }
  },
};

// ============================================================================
// AUTH UTILITIES FOR DEBUGGING
// ============================================================================

export const authUtils = {
  // Test connection to auth endpoints
  testConnection: async () => {
    try {
      // ✅ FIXED: Use centralized configuration with environment variable support
      const getBackendUrl = () => {
        // First check for environment variable
        if (process.env.NEXT_PUBLIC_API_BASE_URL) {
          // Remove /api/v1 suffix if it exists to get the base URL
          return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/api\/v1\/?$/, '');
        } else if (process.env.NEXT_PUBLIC_BACKEND_URL) {
          return process.env.NEXT_PUBLIC_BACKEND_URL;
        }

        // Fallback for production/staging URLs based on hostname
        if (typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')) {
          return 'https://iaf-ifrs-be.danafin.com';
        }
        if (typeof window !== 'undefined' && window.location.hostname.includes('ifrspro.id')) {
          return 'https://bifrs9-iaf.ifrspro.id';
        }

        // Default local fallback
        return 'http://localhost:3000';
      };

      const response = await fetch(`${getBackendUrl()}/api/v1/auth/status`);
      const data = await response.json();
      console.log('✅ Auth service connection test:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Auth service connection test failed:', error);
      return { success: false, error };
    }
  },

  // Get current auth status
  getAuthStatus: () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    return {
      hasToken: !!token,
      hasUserData: !!userData,
      user: userData ? JSON.parse(userData) : null,
      tokenLength: token ? token.length : 0,
    };
  },

  // Clear all auth data
  clearAuth: () => {
    clearAuthTokens();
  }
};