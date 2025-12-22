// ============================================================================
// PSDD ARTIFACT DOCUMENTATION  
// ============================================================================
// File Path: packages/frontend/src/admin/providers/auth/platformAuthProvider.ts
// Generated: $(date)
// Phase: PHASE1 - Platform Admin Database Connection
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin Auth
// Purpose: Authentication for platform admin and consultant users
// ============================================================================

import { AuthProvider } from 'react-admin';

const API_URL = process.env.REACT_APP_PLATFORM_API_URL || '/api/platform/admin';

/**
 * Platform Authentication Provider
 * Supports platform admin and consultant user authentication
 */
export const platformAuthProvider: AuthProvider = {
  // Login function
  login: async ({ username, password, userType = 'platform_admin' }) => {
    const request = new Request(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password, userType }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    try {
      const response = await fetch(request);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.statusText);
      }

      const { token, user, permissions, consultantAccess } = await response.json();
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      
      // Store consultant access flag
      if (consultantAccess) {
        localStorage.setItem('consultantAccess', 'true');
      }

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('Invalid credentials'));
    }
  },

  // Logout function
  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Call logout endpoint to invalidate token
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore errors during logout
      });
    }

    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('consultantAccess');
    
    return Promise.resolve();
  },

  // Check authentication status
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject();
    }

    // Validate token with server
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        localStorage.removeItem('consultantAccess');
        return Promise.reject();
      }

      return Promise.resolve();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('consultantAccess');
      return Promise.reject();
    }
  },

  // Check permissions
  checkError: async (error: any) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      localStorage.removeItem('consultantAccess');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Get user identity
  getIdentity: async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      return Promise.reject();
    }

    const userData = JSON.parse(user);
    const consultantAccess = localStorage.getItem('consultantAccess') === 'true';

    return Promise.resolve({
      id: userData.id,
      fullName: userData.full_name,
      avatar: userData.avatar,
      userType: userData.user_type,
      consultantAccess,
    });
  },

  // Get user permissions
  getPermissions: async () => {
    const permissions = localStorage.getItem('permissions');
    if (!permissions) {
      return Promise.reject();
    }

    const permissionList = JSON.parse(permissions);
    const consultantAccess = localStorage.getItem('consultantAccess') === 'true';

    return Promise.resolve({
      permissions: permissionList,
      consultantAccess,
    });
  },
};

/**
 * Enhanced auth provider factory for consultant access
 */
export const createPlatformAuthProvider = (options: {
  enableConsultantAccess?: boolean;
} = {}) => {
  const { enableConsultantAccess = false } = options;

  if (enableConsultantAccess) {
    return {
      ...platformAuthProvider,
      login: async ({ username, password, userType = 'platform_admin', consultantMode = false }) => {
        const request = new Request(`${API_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ 
            username, 
            password, 
            userType: consultantMode ? 'consultant_manager' : userType,
            consultantAccess: consultantMode 
          }),
          headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        try {
          const response = await fetch(request);
          if (response.status < 200 || response.status >= 300) {
            throw new Error(response.statusText);
          }

          const { token, user, permissions, consultantAccess } = await response.json();
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('permissions', JSON.stringify(permissions));
          
          if (consultantAccess || consultantMode) {
            localStorage.setItem('consultantAccess', 'true');
          }

          return Promise.resolve();
        } catch (error) {
          return Promise.reject(new Error('Invalid credentials'));
        }
      },
    };
  }

  return platformAuthProvider;
};

export default platformAuthProvider;
