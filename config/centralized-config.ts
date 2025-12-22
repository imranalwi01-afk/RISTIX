// config/centralized-config.ts
// 🎯 CENTRALIZED CONFIGURATION SYSTEM
// Supports both Local Development and IAF ECS Production environments

export interface EnvironmentConfig {
  name: string;
  mode: 'local' | 'ecs-production';
  deployment: {
    target: string;
    environment: string;
  };

  // Frontend Configuration
  frontend: {
    host: string;
    port: number;
    url: string;
    apiBaseUrl: string;
  };

  // Backend Configuration
  backend: {
    host: string;
    port: number;
    url: string;
    apiUrl: string;
    wsUrl?: string;
  };

  // R Analytics Configuration
  rAnalytics: {
    dashboardHost: string;
    dashboardPort: number;
    dashboardUrl: string;
    apiHost: string;
    apiPort: number;
    apiUrl: string;
  };

  // Database Configuration
  database: {
    host: string;
    port: number;
    platformDb: string;
    sharedDb: string;
    tenantDb: string;
    legacyDb: string;
    user: string;
    ssl: boolean;
  };

  // CORS Configuration
  cors: {
    origins: string[];
    methods: string[];
    headers: string[];
  };

  // WebSocket Configuration
  websocket: {
    url: string;
    port: number;
  };

  // Security Configuration
  security: {
    enableHttps: boolean;
    secureCookies: boolean;
    jwtSecret: string;
    jwtRefreshSecret: string;
  };

  // Feature Flags
  features: {
    multiTenant: boolean;
    rAnalytics: boolean;
    auditTrail: boolean;
    islamicBanking: boolean;
    advancedAnalytics: boolean;
    stressTesting: boolean;
    mobileApi: boolean;
    workflowManagement: boolean;
  };

  // IAF Specific Configuration
  iaf: {
    mode: boolean;
    tenantId: string;
    tenantName: string;
    tenantMode: string;
    companyName: string;
    bankingType: string;
    logoPath: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

// 🌐 LOCAL DEVELOPMENT ENVIRONMENT CONFIGURATION
export const LOCAL_DEVELOPMENT_CONFIG: EnvironmentConfig = {
  name: 'Local Development',
  mode: 'local',
  deployment: {
    target: 'local',
    environment: 'development'
  },

  frontend: {
    host: 'iaf-ifrs.ifrspro.id',
    port: 4231,
    url: 'https://iaf-ifrs.ifrspro.id',
    apiBaseUrl: 'https://iaf-ifrs.ifrspro.id/api'
  },

  backend: {
    host: 'iaf-ifrs-be.ifrspro.id',
    port: 4232,
    url: 'https://iaf-ifrs-be.ifrspro.id',
    apiUrl: 'https://iaf-ifrs-be.ifrspro.id/api/v1',
    wsUrl: 'wss://iaf-ifrs.ifrspro.id'
  },

  rAnalytics: {
    dashboardHost: 'iaf-ifrs-analytics.ifrspro.id',
    dashboardPort: 4236,
    dashboardUrl: 'https://iaf-ifrs-analytics.ifrspro.id',
    apiHost: 'iaf-ifrs-analytics-calc.ifrspro.id',
    apiPort: 4241,
    apiUrl: 'https://iaf-ifrs-analytics-calc.ifrspro.id/api'
  },

  database: {
    host: 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
    port: 5432,
    platformDb: 'ifrspro_platform_admin',
    sharedDb: 'ifrspro_shared_services',
    tenantDb: 'ifrspro_tenant_iaf',
    legacyDb: 'FRS9PRO',
    user: 'admin_iaf',
    ssl: true
  },

  cors: {
    origins: [
      'https://iaf-ifrs.ifrspro.id',
      'https://iaf-ifrs-be.ifrspro.id',
      'https://iaf-ifrs-analytics.ifrspro.id',
      'https://iaf-ifrs-analytics-calc.ifrspro.id',
      process.env.NODE_ENV === 'production' ?
        'https://iaf-ifrs.danafin.com,https://iaf-ifrs-be.danafin.com,https://iaf-ifrs-analytics.danafin.com' :
        `https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id,https://iaf-ifrs-analytics.ifrspro.id,http://localhost:3000,http://localhost:4231,http://localhost:4232`
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Requested-With']
  },

  websocket: {
    url: 'wss://iaf-ifrs.ifrspro.id',
    port: 4231
  },

  security: {
    enableHttps: true,
    secureCookies: true,
    jwtSecret: 'QkZCd6Qi6VtH9rqxsr3IDPERZMjwxupeNauGmiEsEwGJ0X7CUTFwJ7HghPS0cA8ExRQ73CZX53ssHGRUYly6Q',
    jwtRefreshSecret: 'hA4Tm7psm1OC60IoCiNEZlNRb1pPg32PYQ3TeqVsPImYtBxz07XDqk5LLSLetbooezwS5XVpc8CNCG4bkg1eQ'
  },

  features: {
    multiTenant: false,
    rAnalytics: true,
    auditTrail: true,
    islamicBanking: true,
    advancedAnalytics: true,
    stressTesting: true,
    mobileApi: true,
    workflowManagement: true
  },

  iaf: {
    mode: true,
    tenantId: 'iaf',
    tenantName: 'Indonesia Airawata Finance',
    tenantMode: 'single',
    companyName: 'Indonesia Airawata Finance',
    bankingType: 'conventional',
    logoPath: '/images/logo-iaf.png',
    primaryColor: '#1976D2',
    secondaryColor: '#1E88E5'
  }
};

// 🏭 IAF ECS PRODUCTION ENVIRONMENT CONFIGURATION
export const IAF_PRODUCTION_CONFIG: EnvironmentConfig = {
  name: 'IAF ECS Production',
  mode: 'ecs-production',
  deployment: {
    target: 'ecs-production',
    environment: 'production'
  },

  frontend: {
    host: 'iaf-ifrs.danafin.com',
    port: 4231,
    url: 'https://iaf-ifrs.danafin.com',
    apiBaseUrl: 'https://iaf-ifrs.danafin.com/api'
  },

  backend: {
    host: 'iaf-ifrs-be.danafin.com',
    port: 4232,
    url: 'https://iaf-ifrs-be.danafin.com',
    apiUrl: 'https://iaf-ifrs-be.danafin.com/api/v1',
    wsUrl: 'wss://iaf-ifrs.danafin.com'
  },

  rAnalytics: {
    dashboardHost: 'iaf-ifrs-analytics.danafin.com',
    dashboardPort: 4236,
    dashboardUrl: 'https://iaf-ifrs-analytics.danafin.com',
    apiHost: 'iaf-ifrs-analytics-calc.danafin.com',
    apiPort: 4241,
    apiUrl: 'https://iaf-ifrs-analytics-calc.danafin.com/api'
  },

  database: {
    host: 'pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com',
    port: 5432,
    platformDb: 'ifrspro_platform_admin',
    sharedDb: 'ifrspro_shared_services',
    tenantDb: 'ifrspro_tenant_iaf',
    legacyDb: 'FRS9PRO',
    user: 'admin_iaf',
    ssl: true
  },

  cors: {
    origins: [
      'https://iaf-ifrs.danafin.com',
      'https://iaf-ifrs-be.danafin.com',
      'https://iaf-ifrs-analytics.danafin.com',
      'https://iaf-ifrs-analytics-calc.danafin.com',
      'http://10.18.11.35:4231',
      'http://10.18.11.35:4232',
      'http://10.18.11.35:4236'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Requested-With']
  },

  websocket: {
    url: 'wss://iaf-ifrs.danafin.com',
    port: 4231
  },

  security: {
    enableHttps: true,
    secureCookies: true,
    jwtSecret: 'QkZCd6Qi6VtH9rqxsr3IDPERZMjwxupeNauGmiEsEwGJ0X7CUTFwJ7HghPS0cA8ExRQ73CZX53ssHGRUYly6Q',
    jwtRefreshSecret: 'hA4Tm7psm1OC60IoCiNEZlNRb1pPg32PYQ3TeqVsPImYtBxz07XDqk5LLSLetbooezwS5XVpc8CNCG4bkg1eQ'
  },

  features: {
    multiTenant: false,
    rAnalytics: true,
    auditTrail: true,
    islamicBanking: true,
    advancedAnalytics: true,
    stressTesting: true,
    mobileApi: true,
    workflowManagement: true
  },

  iaf: {
    mode: true,
    tenantId: 'iaf',
    tenantName: 'Indonesia Airawata Finance',
    tenantMode: 'single',
    companyName: 'Indonesia Airawata Finance',
    bankingType: 'conventional',
    logoPath: '/images/logo-iaf.png',
    primaryColor: '#1976D2',
    secondaryColor: '#1E88E5'
  }
};

// 🎯 CONFIGURATION FACTORY
export class ConfigManager {
  private static instance: ConfigManager;
  private currentConfig: EnvironmentConfig;

  private constructor() {
    // Fixed environment detection based on actual .env variables
    const deploymentTarget = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || process.env.DEPLOYMENT_TARGET;
    const nodeEnv = process.env.NODE_ENV;

    // Determine environment based on deployment target
    let environment: 'local' | 'ecs-production';
    if (deploymentTarget === 'ecs-production' || deploymentTarget === 'production') {
      environment = 'ecs-production';
    } else {
      // Default to local for IAF development
      environment = 'local';
    }

    console.log(`🔧 ConfigManager: deploymentTarget=${deploymentTarget}, nodeEnv=${nodeEnv}, selected=${environment}`);
    this.currentConfig = environment === 'ecs-production' ? IAF_PRODUCTION_CONFIG : LOCAL_DEVELOPMENT_CONFIG;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 🔄 Switch configuration mode
  public setEnvironment(mode: 'local' | 'ecs-production'): void {
    this.currentConfig = mode === 'ecs-production' ? IAF_PRODUCTION_CONFIG : LOCAL_DEVELOPMENT_CONFIG;
    console.log(`🔧 Configuration switched to: ${this.currentConfig.name}`);
  }

  // 📋 Get current configuration
  public getConfig(): EnvironmentConfig {
    return this.currentConfig;
  }

  // 🎯 Convenience getters
  public get frontend() { return this.currentConfig.frontend; }
  public get backend() { return this.currentConfig.backend; }
  public get rAnalytics() { return this.currentConfig.rAnalytics; }
  public get database() { return this.currentConfig.database; }
  public get cors() { return this.currentConfig.cors; }
  public get security() { return this.currentConfig.security; }
  public get features() { return this.currentConfig.features; }
  public get iaf() { return this.currentConfig.iaf; }

  // 🔗 API URL builders
  public getApiUrl(endpoint: string): string {
    return `${this.backend.apiUrl}${endpoint}`;
  }

  public getFrontendUrl(path: string): string {
    return `${this.frontend.url}${path}`;
  }

  public getRAnalyticsUrl(endpoint: string): string {
    return `${this.rAnalytics.apiUrl}${endpoint}`;
  }

  public getRAnalyticsDashboardUrl(path: string = ''): string {
    return `${this.rAnalytics.dashboardUrl}${path}`;
  }
}

// 🌍 Export singleton instance
export const config = ConfigManager.getInstance();

// 📄 Environment-specific exports for direct usage
export const isLocalDevelopment = () => config.getConfig().mode === 'local';
export const isEcsProduction = () => config.getConfig().mode === 'ecs-production';
export const currentEnvironment = () => config.getConfig().name;