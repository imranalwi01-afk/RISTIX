// ============================================================================
// 🔍 AUTHENTICATION DEBUGGING UTILITY
// ============================================================================
/**
 * Debug helper for authentication state inspection in browser environments.
 * This module is intentionally documented because it is used during support
 * and incident handling for token, session, and backend connectivity issues.
 */
import { getAuthToken } from './auth-token';

export interface AuthDebugInfo {
  hasToken: boolean;
  hasUserData: boolean;
  hasRefreshToken: boolean;
  token?: string;
  refreshToken?: string;
  tokenInfo?: {
    length: number;
    preview: string;
    isValidFormat: boolean;
  };
  userInfo?: {
    email: string;
    userId: string;
    tenantId: string;
    role: string;
  };
  backendUrl: string;
  lastActivity?: string;
}

export const authDebugger = {
  // Get comprehensive auth debugging information
  getAuthInfo(): AuthDebugInfo {
    const info: AuthDebugInfo = {
      hasToken: false,
      hasUserData: false,
      hasRefreshToken: false,
      backendUrl: typeof window !== 'undefined' && window.location.hostname.includes('ristix.bdo-ki.com')
        ? 'https://api-ristix.bdo-ki.com'
        : 'https://iaf-ifrs-be.ifrspro.id'
    };

    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      const userData = localStorage.getItem('user_data');
      const refreshToken = localStorage.getItem('refresh_token');

      info.hasToken = !!token;
      info.token = token ?? undefined;
      info.hasUserData = !!userData;
      info.hasRefreshToken = !!refreshToken;
      info.refreshToken = refreshToken ?? undefined;

      if (token) {
        info.tokenInfo = {
          length: token.length,
          preview: token.substring(0, 20) + '...',
          isValidFormat: token.length > 50 && token.includes('.')
        };
      }

      if (userData) {
        try {
          const user = JSON.parse(userData);
          info.userInfo = {
            email: user.email || 'N/A',
            userId: user.id || user.userId || 'N/A',
            tenantId: user.tenantId || user.tenant_slug || 'N/A',
            role: user.role || user.roles?.[0] || 'N/A'
          };
        } catch (e) {
          console.warn('Failed to parse user data:', e);
        }
      }

      info.lastActivity = localStorage.getItem('last_activity') ?? undefined;
    }

    return info;
  },

  // Log comprehensive auth debugging information
  logAuthInfo(): void {
    const info = this.getAuthInfo();

  },

  // Test current token validity with backend
  async testTokenValidity(): Promise<{ valid: boolean; error?: string; details?: any }> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { valid: false, error: 'No token found' };
    }

    const backendUrl = typeof window !== 'undefined' && window.location.hostname.includes('ristix.bdo-ki.com')
      ? 'https://api-ristix.bdo-ki.com'
      : 'https://iaf-ifrs-be.ifrspro.id';

    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, details: data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          error: errorData.message || `HTTP ${response.status}`,
          details: errorData
        };
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return { valid: false, error: error.message };
    }
  },

  // Clear all authentication data
  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('last_activity');

    // Clear cookie as well
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  },

  // Fix common authentication issues
  async fixAuthIssues(): Promise<{ fixed: boolean; actions: string[] }> {
    const actions: string[] = [];
    const info = this.getAuthInfo();

    // Test token validity
    const tokenTest = await this.testTokenValidity();

    if (!info.hasToken) {
      actions.push('No token found - user needs to login');
      return { fixed: false, actions };
    }

    if (!tokenTest.valid) {
      actions.push('Invalid token detected - clearing auth data');
      this.clearAuthData();
      return { fixed: false, actions };
    }

    if (!info.hasUserData) {
      actions.push('Token valid but no user data - clearing auth data');
      this.clearAuthData();
      return { fixed: false, actions };
    }

    actions.push('Authentication appears to be valid');
    return { fixed: true, actions };
  },

  // Comprehensive authentication health check
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
    authInfo: AuthDebugInfo;
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const authInfo = this.getAuthInfo();

    // Check token presence
    if (!authInfo.hasToken) {
      issues.push('No authentication token found');
      recommendations.push('User needs to login');
    } else if (!authInfo.tokenInfo?.isValidFormat) {
      issues.push('Token format appears invalid');
      recommendations.push('Clear auth data and re-login');
    }

    // Check user data
    if (!authInfo.hasUserData) {
      issues.push('No user data found');
      recommendations.push('Clear auth data and re-login');
    }

    // Check token validity with backend
    if (authInfo.hasToken) {
      const tokenTest = await this.testTokenValidity();
      if (!tokenTest.valid) {
        issues.push(`Token validation failed: ${tokenTest.error}`);
        recommendations.push('Clear auth data and re-login');
      }
    }

    // Check backend connectivity
    try {
      const backendUrl = authInfo.backendUrl;
      const response = await fetch(`${backendUrl}/health`, { method: 'GET' });
      if (!response.ok) {
        issues.push('Backend health check failed');
        recommendations.push('Check backend service status');
      }
    } catch (error) {
      issues.push('Cannot connect to backend');
      recommendations.push('Check network connectivity and backend status');
    }

    const healthy = issues.length === 0;

    return {
      healthy,
      issues,
      recommendations,
      authInfo
    };
  }
};

// ============================================================================
// GLOBAL DEBUG ACCESS
// ============================================================================
if (typeof window !== 'undefined') {
  (window as any).__AUTH_DEBUGGER__ = authDebugger;
}

export default authDebugger;
