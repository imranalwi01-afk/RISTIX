// packages/frontend/src/utils/auth-debug.ts
// ============================================================================
// 🔍 AUTHENTICATION DEBUGGING UTILITY
// ============================================================================
// ✅ HELPS DEBUG: Authentication token issues between frontend and backend
// ✅ PROVIDES TOOLS: Token validation, cache clearing, re-authentication
// ============================================================================

interface AuthDebugInfo {
  hasToken: boolean;
  hasUserData: boolean;
  hasRefreshToken: boolean;
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
      backendUrl: typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')
        ? 'https://iaf-ifrs-be.danafin.com'
        : 'https://bifrs9-iaf.ifrspro.id'
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const refreshToken = localStorage.getItem('refresh_token');

      info.hasToken = !!token;
      info.hasUserData = !!userData;
      info.hasRefreshToken = !!refreshToken;

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

      info.lastActivity = localStorage.getItem('last_activity');
    }

    return info;
  },

  // Log comprehensive auth debugging information
  logAuthInfo(): void {
    const info = this.getAuthInfo();

    console.group('🔍 AUTHENTICATION DEBUG INFORMATION');
    console.log('🔐 Token Status:', info.hasToken ? '✅ Present' : '❌ Missing');
    console.log('👤 User Data Status:', info.hasUserData ? '✅ Present' : '❌ Missing');
    console.log('🔄 Refresh Token Status:', info.hasRefreshToken ? '✅ Present' : '❌ Missing');
    console.log('🌐 Backend URL:', info.backendUrl);

    if (info.tokenInfo) {
      console.log('🔑 Token Info:', {
        length: info.tokenInfo.length,
        preview: info.tokenInfo.preview,
        validFormat: info.tokenInfo.isValidFormat ? '✅' : '❌'
      });
    }

    if (info.userInfo) {
      console.log('👤 User Info:', info.userInfo);
    }

    if (info.lastActivity) {
      console.log('⏰ Last Activity:', new Date(info.lastActivity).toISOString());
    }

    console.groupEnd();
  },

  // Test current token validity with backend
  async testTokenValidity(): Promise<{ valid: boolean; error?: string; details?: any }> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return { valid: false, error: 'No token found' };
    }

    const backendUrl = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com')
      ? 'https://iaf-ifrs-be.danafin.com'
      : 'https://bifrs9-iaf.ifrspro.id';

    try {
      console.log('🔍 Testing token validity...');
      const response = await fetch(`${backendUrl}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token is valid:', data);
        return { valid: true, details: data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Token is invalid:', errorData);
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
    console.log('🗑️ Clearing all authentication data...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('last_activity');

    // Clear cookie as well
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    console.log('✅ Authentication data cleared');
  },

  // Fix common authentication issues
  async fixAuthIssues(): Promise<{ fixed: boolean; actions: string[] }> {
    const actions: string[] = [];
    const info = this.getAuthInfo();

    console.log('🔧 Attempting to fix authentication issues...');

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

    console.log('🏥 Running authentication health check...');

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

    console.log(`🏥 Authentication Health: ${healthy ? '✅ Healthy' : '❌ Issues Found'}`);
    if (issues.length > 0) {
      console.log('🚨 Issues:', issues);
      console.log('💡 Recommendations:', recommendations);
    }

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
  console.log('🔍 Auth debugger available: window.__AUTH_DEBUGGER__');
  console.log('🔍 Run window.__AUTH_DEBUGGER__.healthCheck() for full diagnosis');
}

export default authDebugger;