// packages/frontend/src/config/session-control.config.ts
// 🎯 CENTRALIZED SESSION CONTROL CONFIGURATION
// Configurable force logout behavior and session management

export interface SessionControlConfig {
  // 🔄 HTTP Error Handling Configuration
  httpErrors: {
    // HTTP 401 Unauthorized handling
    unauthorized401: {
      enabled: boolean;
      autoLogout: boolean;
      retryTokenRefresh: boolean;
      maxRetries: number;
      retryDelay: number; // milliseconds
      gracePeriod: number; // milliseconds before logout
    };

    // HTTP 403 Forbidden handling
    forbidden403: {
      enabled: boolean;
      autoLogout: boolean;
      showPermissionError: boolean;
      retryAfter: number; // milliseconds
    };

    // HTTP 500+ Server errors
    serverErrors: {
      enabled: boolean;
      autoLogout: boolean;
      maxRetries: number;
      retryDelay: number;
      escalateToLogoutAfter: number; // consecutive failures
    };
  };

  // 🌐 Network Error Handling
  networkErrors: {
    // Connection timeout handling
    connectionTimeout: {
      enabled: boolean;
      timeout: number; // milliseconds
      retryAttempts: number;
      retryDelay: number;
      autoLogoutAfterFailures: number;
    };

    // Network disconnect handling
    networkDisconnect: {
      enabled: boolean;
      detectOffline: boolean;
      showOfflineIndicator: boolean;
      autoLogoutWhenOffline: boolean;
      offlineGracePeriod: number; // milliseconds
    };

    // Slow connection handling
    slowConnection: {
      enabled: boolean;
      threshold: number; // milliseconds
      showSlowConnectionWarning: boolean;
      autoLogoutOnTimeout: boolean;
    };
  };

  // 🔐 Token Management
  tokenManagement: {
    // Token refresh configuration
    refreshToken: {
      enabled: boolean;
      autoRefresh: boolean;
      refreshThreshold: number; // seconds before expiry
      maxRefreshRetries: number;
      refreshFailureAction: 'logout' | 'prompt' | 'ignore';
      refreshRetryDelay: number; // milliseconds
    };

    // Token validation
    tokenValidation: {
      enabled: boolean;
      validateOnEachRequest: boolean;
      strictMode: boolean; // reject tokens close to expiry
      expiryBuffer: number; // seconds before expiry to consider invalid
    };

    // Multi-tab synchronization
    crossTabSync: {
      enabled: boolean;
      syncChannel: string; // BroadcastChannel name
      logoutAllTabs: boolean;
    };
  };

  // 🕐 Session Timeout Configuration
  sessionTimeout: {
    enabled: boolean;
    timeout: number; // milliseconds of inactivity
    warningTime: number; // milliseconds before timeout to show warning
    extendable: boolean;
    maxExtensions: number;
    warningMessage: string;

    // Activity detection
    activityDetection: {
      mouseMovement: boolean;
      keyboardInput: boolean;
      scrollActivity: boolean;
      clicksAndTaps: boolean;
    };
  };

  // 🔧 Logout Behavior Configuration
  logoutBehavior: {
    // Logout cleanup
    clearAllData: boolean;
    clearCache: boolean;
    clearCookies: boolean;
    clearSessionStorage: boolean;
    clearLocalStorage: boolean;

    // Logout redirect
    redirectOnLogout: boolean;
    redirectUrl: string;
    preserveReturnUrl: boolean;
    returnUrlParam: string;

    // Logout confirmation
    requireConfirmation: boolean;
    confirmationMessage: string;

    // Logout logging
    logLogoutEvents: boolean;
    logReason: boolean;
    logUserAgent: boolean;
    logTimestamp: boolean;
  };

  // 🛡️ Security & Compliance
  security: {
    // Concurrent session handling
    concurrentSessions: {
      enabled: boolean;
      maxSessions: number;
      actionOnExceed: 'logout_oldest' | 'logout_newest' | 'block_newest';
    };

    // Suspicious activity detection
    suspiciousActivity: {
      enabled: boolean;
      rapidRequestsThreshold: number;
      rapidRequestsWindow: number; // milliseconds
      rapidFailureThreshold: number;
      actionOnSuspicious: 'logout' | 'warn' | 'ignore';
    };

    // Compliance settings
    compliance: {
      auditLogouts: boolean;
      requireReauthForSensitiveOps: boolean;
      reauthTimeout: number; // milliseconds
    };
  };

  // 🎛️ Development & Debugging
  development: {
    debugMode: boolean;
    logSessionEvents: boolean;
    showSessionNotifications: boolean;
    simulateErrors: boolean;
    bypassLogoutForTesting: boolean;
  };
}

// 📋 DEFAULT CONFIGURATION
export const DEFAULT_SESSION_CONTROL_CONFIG: SessionControlConfig = {
  httpErrors: {
    unauthorized401: {
      enabled: true,
      autoLogout: process.env.NEXT_PUBLIC_SESSION_401_AUTO_LOGOUT === 'true', // 🌐 From .env
      retryTokenRefresh: process.env.NEXT_PUBLIC_SESSION_401_RETRY_TOKEN_REFRESH === 'true',
      maxRetries: parseInt(process.env.NEXT_PUBLIC_SESSION_401_MAX_RETRIES || '5'),
      retryDelay: parseInt(process.env.NEXT_PUBLIC_SESSION_401_RETRY_DELAY || '1500'),
      gracePeriod: parseInt(process.env.NEXT_PUBLIC_SESSION_401_GRACE_PERIOD || '30000'),
    },

    forbidden403: {
      enabled: true,
      autoLogout: false, // Don't auto-logout on 403 by default
      showPermissionError: true,
      retryAfter: 30000, // 30 seconds
    },

    serverErrors: {
      enabled: true,
      autoLogout: false,
      maxRetries: 3,
      retryDelay: 2000,
      escalateToLogoutAfter: 5, // 5 consecutive failures
    },
  },

  networkErrors: {
    connectionTimeout: {
      enabled: true,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: parseInt(process.env.NEXT_PUBLIC_SESSION_NETWORK_RETRY_DELAY || '2000'),
      autoLogoutAfterFailures: parseInt(process.env.NEXT_PUBLIC_SESSION_NETWORK_FAILURE_THRESHOLD || '40'),
    },

    networkDisconnect: {
      enabled: true,
      detectOffline: true,
      showOfflineIndicator: true,
      autoLogoutWhenOffline: process.env.NEXT_PUBLIC_SESSION_NETWORK_AUTO_LOGOUT === 'true',
      offlineGracePeriod: 300000, // 5 minutes
    },

    slowConnection: {
      enabled: true,
      threshold: 10000, // 10 seconds
      showSlowConnectionWarning: true,
      autoLogoutOnTimeout: false,
    },
  },

  tokenManagement: {
    refreshToken: {
      enabled: true,
      autoRefresh: process.env.NEXT_PUBLIC_SESSION_TOKEN_AUTO_REFRESH !== 'false',
      refreshThreshold: parseInt(process.env.NEXT_PUBLIC_SESSION_TOKEN_REFRESH_THRESHOLD || '300'),
      maxRefreshRetries: parseInt(process.env.NEXT_PUBLIC_SESSION_TOKEN_MAX_REFRESH_RETRIES || '5'),
      refreshFailureAction: (process.env.NEXT_PUBLIC_SESSION_TOKEN_REFRESH_FAILURE_ACTION as 'logout' | 'prompt' | 'ignore') || 'prompt',
      refreshRetryDelay: parseInt(process.env.NEXT_PUBLIC_SESSION_TOKEN_REFRESH_RETRY_DELAY || '3000'),
    },

    tokenValidation: {
      enabled: true,
      validateOnEachRequest: true,
      strictMode: false,
      expiryBuffer: 60, // 1 minute buffer
    },

    crossTabSync: {
      enabled: true,
      syncChannel: 'ifrs9-session-sync',
      logoutAllTabs: true,
    },
  },

  sessionTimeout: {
    enabled: process.env.NEXT_PUBLIC_SESSION_TIMEOUT_ENABLED !== 'false',
    timeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'),
    warningTime: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_WARNING_TIME || '300000'),
    extendable: process.env.NEXT_PUBLIC_SESSION_TIMEOUT_EXTENDABLE !== 'false',
    maxExtensions: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MAX_EXTENSIONS || '2'),
    warningMessage: 'Your session is about to expire. Do you want to extend it?',

    activityDetection: {
      mouseMovement: true,
      keyboardInput: true,
      scrollActivity: true,
      clicksAndTaps: true,
    },
  },

  logoutBehavior: {
    clearAllData: true,
    clearCache: true,
    clearCookies: true,
    clearSessionStorage: true,
    clearLocalStorage: true,

    redirectOnLogout: true,
    redirectUrl: '/login',
    preserveReturnUrl: true,
    returnUrlParam: 'returnTo',

    requireConfirmation: false,
    confirmationMessage: 'Are you sure you want to logout?',

    logLogoutEvents: true,
    logReason: true,
    logUserAgent: true,
    logTimestamp: true,
  },

  security: {
    concurrentSessions: {
      enabled: process.env.NEXT_PUBLIC_SESSION_CONCURRENT_SESSIONS_ENABLED === 'true',
      maxSessions: parseInt(process.env.NEXT_PUBLIC_SESSION_CONCURRENT_SESSIONS_MAX || '3'),
      actionOnExceed: 'logout_oldest',
    },

    suspiciousActivity: {
      enabled: process.env.NEXT_PUBLIC_SESSION_SUSPICIOUS_ACTIVITY_ENABLED === 'true',
      rapidRequestsThreshold: 200, // Higher threshold if enabled
      rapidRequestsWindow: 60000, // 1 minute
      rapidFailureThreshold: 25, // More failures allowed
      actionOnSuspicious: 'warn', // Never auto-logout on suspicious activity
    },

    compliance: {
      auditLogouts: true,
      requireReauthForSensitiveOps: false,
      reauthTimeout: 900000, // 15 minutes
    },
  },

  development: {
    debugMode: process.env.NEXT_PUBLIC_SESSION_DEBUG_MODE === 'true',
    logSessionEvents: process.env.NEXT_PUBLIC_SESSION_LOG_EVENTS === 'true',
    showSessionNotifications: process.env.NODE_ENV === 'development',
    simulateErrors: false,
    bypassLogoutForTesting: process.env.NEXT_PUBLIC_SESSION_BYPASS_LOGOUT_FOR_TESTING === 'true',
  },
};

// 🏢 ENVIRONMENT-SPECIFIC CONFIGURATIONS
export const ENVIRONMENT_SESSION_CONFIGS: Record<string, Partial<SessionControlConfig>> = {
  development: {
    httpErrors: {
      unauthorized401: {
        enabled: true,
        autoLogout: false, // 🚫 DISABLED - Prevent forced logout on 401 errors during development
        retryTokenRefresh: true,
        maxRetries: 5,
        retryDelay: 1500,
        gracePeriod: 30000, // 30 seconds grace period in development
      },
    },
    sessionTimeout: {
      timeout: 7200000, // 2 hours in development
      warningTime: 600000, // 10 minutes warning in development
    },
    development: {
      debugMode: true,
      logSessionEvents: true,
      showSessionNotifications: true,
      bypassLogoutForTesting: true,
    },
  },

  staging: {
    httpErrors: {
      unauthorized401: {
        gracePeriod: 10000, // 10 seconds grace period in staging
      },
    },
    sessionTimeout: {
      timeout: 1800000, // 30 minutes in staging
      warningTime: 300000, // 5 minutes warning
    },
    development: {
      debugMode: true,
      logSessionEvents: true,
      showSessionNotifications: false,
      bypassLogoutForTesting: false,
    },
  },

  production: {
    httpErrors: {
      unauthorized401: {
        gracePeriod: 2000, // 2 seconds grace period in production
      },
    },
    sessionTimeout: {
      timeout: 1800000, // 30 minutes in production
      warningTime: 180000, // 3 minutes warning
    },
    security: {
      concurrentSessions: {
        enabled: true, // Enable concurrent session management in production
      },
      suspiciousActivity: {
        actionOnSuspicious: 'logout', // Strict security in production
      },
    },
    development: {
      debugMode: false,
      logSessionEvents: false,
      showSessionNotifications: false,
      bypassLogoutForTesting: false,
    },
  },

  iafecs: {
    httpErrors: {
      unauthorized401: {
        enabled: true,
        autoLogout: false, // 🔧 FIXED: Disabled auto-logout for IAF ECS to prevent forced logouts
        retryTokenRefresh: true,
        maxRetries: 8, // 🔧 FIXED: More retries for production stability
        retryDelay: 2000, // 🔧 FIXED: Longer delay for better recovery
        gracePeriod: 45000, // 🔧 FIXED: 45 seconds grace period for IAF ECS
      },
      forbidden403: {
        enabled: true,
        autoLogout: false, // Don't auto-logout on 403
        showPermissionError: true,
        retryAfter: 60000, // 60 seconds
      },
      serverErrors: {
        enabled: true,
        autoLogout: false, // Don't auto-logout on server errors
        maxRetries: 5,
        retryDelay: 5000,
        escalateToLogoutAfter: 10,
      },
    },
    sessionTimeout: {
      enabled: true,
      timeout: 5400000, // 🔧 FIXED: 90 minutes for IAF ECS (was 45 minutes)
      warningTime: 300000, // 🔧 FIXED: 5 minutes warning (was 4 minutes)
      extendable: true,
      maxExtensions: 5, // 🔧 FIXED: More extensions allowed (was 2)
      warningMessage: 'Your session is about to expire. Do you want to extend it?',
      activityDetection: {
        mouseMovement: true,
        keyboardInput: true,
        scrollActivity: true,
        clicksAndTaps: true,
      },
    },
    networkErrors: {
      connectionTimeout: {
        enabled: true,
        timeout: 60000, // 60 seconds
        retryAttempts: 5,
        retryDelay: 5000,
        autoLogoutAfterFailures: 40, // 🔧 FIXED: Much higher threshold
      },
      networkDisconnect: {
        enabled: true,
        detectOffline: true,
        showOfflineIndicator: true,
        autoLogoutWhenOffline: false, // 🔧 FIXED: Disabled
        offlineGracePeriod: 600000, // 10 minutes
      },
      slowConnection: {
        enabled: true,
        threshold: 15000, // 15 seconds
        showSlowConnectionWarning: true,
        autoLogoutOnTimeout: false, // 🔧 FIXED: Disabled
      },
    },
    security: {
      concurrentSessions: {
        enabled: true,
        maxSessions: 10, // 🔧 FIXED: More sessions for enterprise (was 5)
        actionOnExceed: 'logout_newest', // 🔧 FIXED: Logout newest instead of oldest
      },
      suspiciousActivity: {
        enabled: false, // 🔧 FIXED: Disabled to prevent false positives
        rapidRequestsThreshold: 300, // Higher threshold
        rapidRequestsWindow: 120000, // 2 minutes
        rapidFailureThreshold: 30, // More failures allowed
        actionOnSuspicious: 'warn', // Always warn, never logout
      },
      compliance: {
        auditLogouts: true,
        requireReauthForSensitiveOps: false, // 🔧 FIXED: Disabled to prevent forced logouts
        reauthTimeout: 1800000, // 🔧 FIXED: 30 minutes (was 15 minutes)
      },
    },
    development: {
      debugMode: false,
      logSessionEvents: false,
      showSessionNotifications: false,
      simulateErrors: false,
      bypassLogoutForTesting: false,
    },
  },
};

// 🎯 SESSION CONTROL CONFIGURATION MANAGER
export class SessionControlConfigManager {
  private static instance: SessionControlConfigManager;
  private config: SessionControlConfig;
  private environment: string;

  private constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
  }

  public static getInstance(): SessionControlConfigManager {
    if (!SessionControlConfigManager.instance) {
      SessionControlConfigManager.instance = new SessionControlConfigManager();
    }
    return SessionControlConfigManager.instance;
  }

  private detectEnvironment(): string {
    // Check for explicit environment variable
    if (process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET) {
      return process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET;
    }

    // Check for standard Node environment
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }

    // Check for hostname-based detection (browser-side)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      if (hostname.includes('iaf-ifrs.danafin.com')) {
        return 'iafecs';
      } else if (hostname.includes('ifrs9-iaf.ifrspro.id')) {
        return 'development';
      }
    }

    // Default to development
    return 'development';
  }

  private loadConfiguration(): SessionControlConfig {
    // Start with default configuration
    let config = { ...DEFAULT_SESSION_CONTROL_CONFIG };

    // Apply environment-specific overrides
    const envConfig = ENVIRONMENT_SESSION_CONFIGS[this.environment];
    if (envConfig) {
      config = this.mergeDeep(config, envConfig);
    }

    // Apply any custom configuration from environment variables
    config = this.applyEnvironmentVariables(config);

    return config;
  }

  private mergeDeep(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  private applyEnvironmentVariables(config: SessionControlConfig): SessionControlConfig {
    // Apply session timeout from environment variable
    if (process.env.NEXT_PUBLIC_SESSION_TIMEOUT) {
      config.sessionTimeout.timeout = parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT);
    }

    // Apply debug mode from environment variable
    if (process.env.NEXT_PUBLIC_DEBUG_SESSION) {
      config.development.debugMode = process.env.NEXT_PUBLIC_DEBUG_SESSION === 'true';
    }

    // Apply bypass logout for testing
    if (process.env.NEXT_PUBLIC_BYPASS_LOGOUT === 'true') {
      config.development.bypassLogoutForTesting = true;
    }

    return config;
  }

  public getConfiguration(): SessionControlConfig {
    return this.config;
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public updateConfiguration(updates: Partial<SessionControlConfig>): void {
    this.config = this.mergeDeep(this.config, updates);
  }

  public resetConfiguration(): void {
    this.config = this.loadConfiguration();
  }

  // 🎛️ Helper methods for common configurations
  public isAutoLogoutEnabled(): boolean {
    return this.config.httpErrors.unauthorized401.autoLogout;
  }

  public getTokenRefreshConfig() {
    return this.config.tokenManagement.refreshToken;
  }

  public getSessionTimeoutConfig() {
    return this.config.sessionTimeout;
  }

  public getNetworkErrorConfig() {
    return this.config.networkErrors;
  }

  public isDevelopmentMode(): boolean {
    return this.config.development.debugMode;
  }
}

// 📤 EXPORT SINGLETON INSTANCE
export const sessionControlConfig = SessionControlConfigManager.getInstance();

// 🎯 UTILITY FUNCTIONS
export const getSessionControlConfig = (): SessionControlConfig => {
  return sessionControlConfig.getConfiguration();
};

export const getEnvironment = (): string => {
  return sessionControlConfig.getEnvironment();
};

export const updateSessionControlConfig = (updates: Partial<SessionControlConfig>): void => {
  sessionControlConfig.updateConfiguration(updates);
};

export const resetSessionControlConfig = (): void => {
  sessionControlConfig.resetConfiguration();
};