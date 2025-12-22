// config/environment.ecs-production.ts
// 🏭 IAF ECS PRODUCTION ENVIRONMENT CONFIGURATION
// Usage: Import and use this config for IAF ECS production deployment

import { EnvironmentConfig } from './centralized-config';

export const ECS_PRODUCTION_CONFIG: EnvironmentConfig = {
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

// 🎯 Environment-specific helper functions
export const setupEcsProductionEnvironment = () => {
  console.log('🏭 Setting up IAF ECS Production Environment');
  console.log(`📍 Frontend: ${ECS_PRODUCTION_CONFIG.frontend.url}`);
  console.log(`📍 Backend API: ${ECS_PRODUCTION_CONFIG.backend.apiUrl}`);
  console.log(`📍 R Analytics: ${ECS_PRODUCTION_CONFIG.rAnalytics.dashboardUrl}`);
  console.log(`📍 Database: ${ECS_PRODUCTION_CONFIG.database.host}:${ECS_PRODUCTION_CONFIG.database.port}`);
  return ECS_PRODUCTION_CONFIG;
};