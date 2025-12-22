// packages/frontend/src/config/environment-loader-frontend.ts
// =============================================================================
// 🚀 FRONTEND SMART ENVIRONMENT LOADER - SEAMLESS LOCALDEV/IAFECS SWITCHING
// =============================================================================
// Purpose: Automatically detect and load correct environment configuration for frontend
// Supports: LOCALDEV (localhost) and IAFECS (Alibaba Cloud ECS)
// Usage: DEPLOYMENT_TARGET=localdev|iafecs or automatic detection
// =============================================================================

import * as os from 'os';

export interface FrontendEnvironmentConfig {
  // Environment Detection
  nodeEnv: string;
  deploymentTarget: 'localdev' | 'iafecs';
  environmentName: string;
  isProduction: boolean;
  isLocalDev: boolean;
  isEcs: boolean;

  // API URLs
  api: {
    backend: string;
    base: string;
    auth: string;
    banking: string;
    user: string;
    portfolio: string;
    reports: string;
  };

  // R Analytics URLs
  rAnalytics: {
    api: string;
    dashboard: string;
    calc: string;
  };

  // Application URLs
  urls: {
    frontend: string;
    backend: string;
    bankingDashboard: string;
    websocket: string;
  };

  // IAF Configuration
  iaf: {
    tenantId: string;
    tenantName: string;
    companyName: string;
    bankingType: string;
    logoPath: string;
    primaryColor: string;
    secondaryColor: string;
    theme: 'conventional' | 'syariah';
  };

  // Feature Flags
  features: {
    advancedAnalytics: boolean;
    islamicBanking: boolean;
    auditTrail: boolean;
    developmentTools: boolean;
    mockData: boolean;
    debugMode: boolean;
  };

  // Security
  security: {
    enableHttps: boolean;
    secureCookies: boolean;
  };

  // Development
  development: {
    showEnvironmentBanner: boolean;
    enableConsoleLogging: boolean;
    mockApiResponse: boolean;
  };
}

export class FrontendEnvironmentLoader {
  private static instance: FrontendEnvironmentLoader;
  private config: FrontendEnvironmentConfig | null = null;
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): FrontendEnvironmentLoader {
    if (!FrontendEnvironmentLoader.instance) {
      FrontendEnvironmentLoader.instance = new FrontendEnvironmentLoader();
    }
    return FrontendEnvironmentLoader.instance;
  }

  /**
   * Auto-detect environment and load configuration
   */
  public loadConfiguration(): FrontendEnvironmentConfig {
    if (this.isLoaded) {
      return this.config!;
    }

    console.log('🔧 Frontend Smart Environment Loader - Auto-detecting...');
    console.log(`📁 Working directory: ${typeof window !== 'undefined' ? 'Browser' : process.cwd()}`);

    // Step 1: Detect deployment target
    const deploymentTarget = this.detectDeploymentTarget();
    console.log(`🎯 Detected frontend deployment target: ${deploymentTarget}`);

    // Step 2: Build configuration object
    this.config = this.buildConfiguration(deploymentTarget);

    this.isLoaded = true;
    console.log('✅ Frontend environment configuration loaded successfully');
    this.logConfigurationSummary();

    return this.config;
  }

  /**
   * Enhanced detection for local development context via Cloudflare Zero Trust
   */
  private static detectLocalDevelopmentContext(): boolean {
    if (typeof window === 'undefined') {
      // Server-side: check if running on development machine
      return process.env.NODE_ENV !== 'production' ||
             process.env.DEPLOYMENT_TARGET === 'localdev' ||
             !!process.env.NEXT_PUBLIC_LOCAL_DEVELOPMENT;
    }

    // Client-side: multiple detection methods
    const hostname = window.location.hostname;

    // Method 1: Check for explicit development indicator
    if (process.env.NEXT_PUBLIC_LOCAL_DEVELOPMENT === 'true') {
      console.log('🏠 EXPLICIT LOCAL DEVELOPMENT INDICATOR DETECTED');
      return true;
    }

    // Method 2: Check for Cloudflare Zero Trust development domains
    if (hostname === 'iaf-ifrs.ifrspro.id' ||
        hostname === 'iaf-ifrs-be.ifrspro.id' ||
        hostname === 'iaf-ifrs-analytics.ifrspro.id' ||
        hostname === 'iaf-ifrs-analytics-calc.ifrspro.id' ||
        hostname.includes('ifrspro.id')) {
      console.log('🔧 CLOUDFLARE ZERO TRUST DEVELOPMENT DOMAIN DETECTED');
      return true;
    }

    // Method 3: Check browser developer tools indicators
    if (window.location.protocol === 'http:' &&
        (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.'))) {
      console.log('💻 LOCALHOST/PRIVATE IP DETECTED');
      return true;
    }

    // Method 4: Check for development environment patterns
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') &&
        (window.outerWidth && window.outerWidth < 1920 && window.outerHeight < 1080)) {
      // This is a weak indicator, so only use as fallback
      console.log('🖥️  POSSIBLE DEVELOPMENT ENVIRONMENT (WEAK INDICATOR)');
    }

    return false;
  }

  /**
   * Auto-detect deployment target - ENHANCED LOGIC FOR HYBRID DEVELOPMENT
   */
  private detectDeploymentTarget(): 'localdev' | 'iafecs' {
    // Priority 1: HOSTNAME DETECTION with local development context awareness
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocalDevelopment = FrontendEnvironmentLoader.detectLocalDevelopmentContext();

      // Enhanced production domain detection with local development exception
      if (hostname === 'iaf-ifrs.danafin.com' ||
          hostname === 'iaf-ifrs-be.danafin.com' ||
          hostname === 'iaf-ifrs-analytics.danafin.com' ||
          hostname.includes('danafin.com')) {

        if (isLocalDevelopment) {
          console.log('🏠 PRODUCTION DOMAIN via LOCAL DEVELOPMENT (Cloudflare Zero Trust)');
          console.log(`📍 Current hostname: ${hostname}`);
          console.log('🔧 Using localdev configuration with production domain access');
          return 'localdev';
        } else {
          console.log('🌐 PRODUCTION DOMAIN on ECS SERVER');
          console.log(`📍 Current hostname: ${hostname}`);
          console.log('🚀 Using iafecs configuration');
          return 'iafecs';
        }
      }

      // Development domains (Cloudflare Zero Trust)
      if (hostname === 'iaf-ifrs.ifrspro.id' ||
          hostname === 'iaf-ifrs-be.ifrspro.id' ||
          hostname === 'iaf-ifrs-analytics.ifrspro.id' ||
          hostname === 'iaf-ifrs-analytics-calc.ifrspro.id' ||
          hostname.includes('ifrspro.id')) {
        console.log('🔧 DEVELOPMENT DOMAIN DETECTED - Forcing local development');
        console.log(`📍 Current hostname: ${hostname}`);
        return 'localdev';
      }
    }

    // Priority 2: Check explicit environment variable (only if hostname detection failed)
    const explicitTarget = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || process.env.DEPLOYMENT_TARGET;
    if (explicitTarget === 'localdev' || explicitTarget === 'iafecs') {
      console.log(`📋 Using explicit DEPLOYMENT_TARGET (hostname detection failed): ${explicitTarget}`);
      return explicitTarget;
    }

    // Priority 3: Check NODE_ENV with domain awareness
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production' && !FrontendEnvironmentLoader.detectLocalDevelopmentContext()) {
      console.log('🚀 NODE_ENV=production - assuming ECS deployment');
      return 'iafecs';
    }

    // Priority 4: Default to local development
    console.log('💻 Defaulting to local development environment');
    return 'localdev';
  }

  /**
   * Build comprehensive frontend configuration
   */
  private buildConfiguration(deploymentTarget: 'localdev' | 'iafecs'): FrontendEnvironmentConfig {
    const isEcs = deploymentTarget === 'iafecs';
    const isLocalDev = deploymentTarget === 'localdev';
    const isProduction = process.env.NODE_ENV === 'production' || isEcs;

    // API URLs based on environment - 🏭 IAF LOCAL PRODUCTION MODE
    const api = {
      backend: this.getEnvVar('NEXT_PUBLIC_BACKEND_URL',
        isEcs ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1'),
      base: this.getEnvVar('NEXT_PUBLIC_API_BASE_URL', isEcs ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1'),
      auth: '/auth',
      banking: '/banking',
      user: '/v1/user',
      portfolio: '/portfolio',
      reports: '/reports'
    };

    // R Analytics URLs - MUST USE IAF GUIDE DOMAINS
    const rAnalytics = {
      api: this.getEnvVar('NEXT_PUBLIC_RAPI_BASE_URL', isEcs ? 'https://iaf-ifrs-analytics-calc.danafin.com/api' : 'https://iaf-ifrs-analytics-calc.ifrspro.id/api'),
      dashboard: this.getEnvVar('NEXT_PUBLIC_R_ANALYTICS_URL', isEcs ? 'https://iaf-ifrs-analytics.danafin.com' : 'https://iaf-ifrs-analytics.ifrspro.id'),
      calc: this.getEnvVar('NEXT_PUBLIC_R_ANALYTICS_CALC_URL', isEcs ? 'https://iaf-ifrs-analytics-calc.danafin.com' : 'https://iaf-ifrs-analytics-calc.ifrspro.id')
    };

    // Application URLs
    const urls = {
      frontend: this.getEnvVar('NEXT_PUBLIC_FRONTEND_URL', isEcs ? 'https://iaf-ifrs.danafin.com' : 'https://iaf-ifrs.ifrspro.id'),
      backend: api.backend,
      bankingDashboard: this.getEnvVar('NEXT_PUBLIC_BANKING_DASHBOARD_URL', isEcs ? 'https://iaf-ifrs.danafin.com/banking/dashboard' : 'https://iaf-ifrs.ifrspro.id/banking/dashboard'),
      websocket: this.getEnvVar('NEXT_PUBLIC_WS_URL', isEcs ? 'wss://iaf-ifrs.danafin.com' : 'wss://iaf-ifrs.ifrspro.id')
    };

    // IAF Configuration
    const iaf = {
      tenantId: this.getEnvVar('NEXT_PUBLIC_TENANT_ID', 'iaf'),
      tenantName: this.getEnvVar('NEXT_PUBLIC_TENANT_NAME', isEcs ? 'Indonesia Airawata Finance' : 'Indonesia Airawata Finance (Local)'),
      companyName: this.getEnvVar('NEXT_PUBLIC_COMPANY_NAME', 'Indonesia Airawata Finance'),
      bankingType: this.getEnvVar('NEXT_PUBLIC_BANKING_TYPE', 'conventional'),
      logoPath: this.getEnvVar('NEXT_PUBLIC_LOGO_PATH', '/images/iaf-logo.png'),
      primaryColor: this.getEnvVar('NEXT_PUBLIC_PRIMARY_COLOR', isEcs ? '#1976D2' : '#007bff'),
      secondaryColor: this.getEnvVar('NEXT_PUBLIC_SECONDARY_COLOR', isEcs ? '#DC004E' : '#6c757d'),
      theme: this.getEnvVar('NEXT_PUBLIC_BANKING_TYPE', 'conventional') as 'conventional' | 'syariah'
    };

    // Feature flags
    const features = {
      advancedAnalytics: this.getEnvVar('NEXT_PUBLIC_FEATURE_ADVANCED_ANALYTICS', 'true') === 'true',
      islamicBanking: this.getEnvVar('NEXT_PUBLIC_FEATURE_ISLAMIC_BANKING', 'true') === 'true',
      auditTrail: this.getEnvVar('NEXT_PUBLIC_FEATURE_AUDIT_TRAIL', 'true') === 'true',
      developmentTools: this.getEnvVar('NEXT_PUBLIC_FEATURE_DEVELOPMENT_TOOLS', isLocalDev ? 'true' : 'false') === 'true',
      mockData: this.getEnvVar('NEXT_PUBLIC_FEATURE_MOCK_DATA', 'false') === 'true',
      debugMode: this.getEnvVar('NEXT_PUBLIC_DEBUG_MODE', isLocalDev ? 'true' : 'false') === 'true'
    };

    // Security configuration
    const security = {
      enableHttps: this.getEnvVar('NEXT_PUBLIC_ENABLE_HTTPS', isEcs ? 'true' : 'false') === 'true',
      secureCookies: this.getEnvVar('NEXT_PUBLIC_SECURE_COOKIES', isEcs ? 'true' : 'false') === 'true'
    };

    // Development configuration
    const development = {
      showEnvironmentBanner: isLocalDev,
      enableConsoleLogging: isLocalDev,
      mockApiResponse: this.getEnvVar('NEXT_PUBLIC_MOCK_API_RESPONSE', 'false') === 'true'
    };

    return {
      nodeEnv: process.env.NODE_ENV || (isEcs ? 'production' : 'development'),
      deploymentTarget,
      environmentName: isEcs ? 'IAF ECS Production' : 'Local Development',
      isProduction,
      isLocalDev,
      isEcs,
      api,
      rAnalytics,
      urls,
      iaf,
      features,
      security,
      development
    };
  }

  /**
   * Get environment variable with fallback
   */
  private getEnvVar(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Log configuration summary
   */
  private logConfigurationSummary(): void {
    const config = this.config!;

    console.log('\n📋 Frontend Environment Configuration Summary:');
    console.log('============================================');
    console.log(`🎯 Environment: ${config.environmentName}`);
    console.log(`🖥️  Node.js: ${config.nodeEnv}`);
    console.log(`🚀 Target: ${config.deploymentTarget}`);
    console.log(`🌐 Is Production: ${config.isProduction}`);

    console.log('\n🌐 Application URLs:');
    console.log(`  Frontend:        ${config.urls.frontend}`);
    console.log(`  Backend:         ${config.urls.backend}`);
    console.log(`  Banking Dashboard:${config.urls.bankingDashboard}`);
    console.log(`  WebSocket:       ${config.urls.websocket}`);
    console.log(`  API:             ${config.api.base}`);

    console.log('\n🔧 API Endpoints:');
    console.log(`  Auth:    ${config.api.auth}`);
    console.log(`  Banking: ${config.api.banking}`);
    console.log(`  User:    ${config.api.user}`);

    console.log('\n📊 R Analytics:');
    console.log(`  Dashboard: ${config.rAnalytics.dashboard}`);
    console.log(`  API:      ${config.rAnalytics.api}`);
    console.log(`  Calc:     ${config.rAnalytics.calc}`);

    console.log('\n🏢 IAF Configuration:');
    console.log(`  Tenant: ${config.iaf.tenantName} (${config.iaf.tenantId})`);
    console.log(`  Banking: ${config.iaf.bankingType}`);
    console.log(`  Theme:   ${config.iaf.theme}`);

    console.log('\n✨ Features:');
    console.log(`  Analytics: ${config.features.advancedAnalytics ? 'Enabled' : 'Disabled'}`);
    console.log(`  Islamic Banking: ${config.features.islamicBanking ? 'Enabled' : 'Disabled'}`);
    console.log(`  Audit Trail: ${config.features.auditTrail ? 'Enabled' : 'Disabled'}`);
    console.log(`  Development Tools: ${config.features.developmentTools ? 'Enabled' : 'Disabled'}`);

    console.log('\n🔒 Security:');
    console.log(`  HTTPS:      ${config.security.enableHttps ? 'Enabled' : 'Disabled'}`);
    console.log(`  Secure Cookies: ${config.security.secureCookies ? 'Enabled' : 'Disabled'}`);

    console.log('============================================\n');
  }

  /**
   * Get loaded configuration
   */
  public getConfiguration(): FrontendEnvironmentConfig {
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded. Call loadConfiguration() first.');
    }
    return this.config!;
  }

  /**
   * Check if running in production mode
   */
  public isProduction(): boolean {
    return this.getConfiguration().isProduction;
  }

  /**
   * Check if running in local development
   */
  public isLocalDevelopment(): boolean {
    return this.getConfiguration().isLocalDev;
  }

  /**
   * Check if running on ECS
   */
  public isEcsDeployment(): boolean {
    return this.getConfiguration().isEcs;
  }

  /**
   * Get deployment target
   */
  public getDeploymentTarget(): 'localdev' | 'iafecs' {
    return this.getConfiguration().deploymentTarget;
  }

  /**
   * Get API base URL
   */
  public getApiBaseUrl(): string {
    return this.getConfiguration().api.base;
  }

  /**
   * Get backend URL
   */
  public getBackendUrl(): string {
    return this.getConfiguration().api.backend;
  }

  /**
   * Get frontend URL
   */
  public getFrontendUrl(): string {
    return this.getConfiguration().urls.frontend;
  }
}

// Export singleton instance
export const frontendEnvironmentLoader = FrontendEnvironmentLoader.getInstance();

// Auto-load on import
if (typeof window === 'undefined') {
  // Server-side loading
  frontendEnvironmentLoader.loadConfiguration();
} else {
  // Client-side loading (deferred to avoid hydration issues)
  if (typeof window !== 'undefined' && !(window as any).__ENV_LOADED__) {
    (window as any).__ENV_LOADED__ = true;
    frontendEnvironmentLoader.loadConfiguration();
  }
}