"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLocalEnvironment = exports.LOCAL_ENV_CONFIG = void 0;
exports.LOCAL_ENV_CONFIG = {
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
            'http://192.168.0.85:4231',
            'http://192.168.0.85:4232',
            'http://192.168.0.85:4236',
            'http://localhost:3000',
            'http://localhost:4231',
            'http://localhost:4232'
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
const setupLocalEnvironment = () => {
    console.log('🌐 Setting up Local Development Environment');
    console.log(`📍 Frontend: ${exports.LOCAL_ENV_CONFIG.frontend.url}`);
    console.log(`📍 Backend API: ${exports.LOCAL_ENV_CONFIG.backend.apiUrl}`);
    console.log(`📍 R Analytics: ${exports.LOCAL_ENV_CONFIG.rAnalytics.dashboardUrl}`);
    console.log(`📍 Database: ${exports.LOCAL_ENV_CONFIG.database.host}:${exports.LOCAL_ENV_CONFIG.database.port}`);
    return exports.LOCAL_ENV_CONFIG;
};
exports.setupLocalEnvironment = setupLocalEnvironment;
