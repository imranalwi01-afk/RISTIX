"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEcsProductionEnvironment = exports.ECS_PRODUCTION_CONFIG = void 0;
exports.ECS_PRODUCTION_CONFIG = {
    name: 'IAF ECS Production',
    mode: 'ecs-production',
    deployment: {
        target: 'ecs-production',
        environment: 'production'
    },
    frontend: {
        host: 'ristix.bdo-ki.com',
        port: 4231,
        url: 'https://ristix.bdo-ki.com',
        apiBaseUrl: 'https://ristix.bdo-ki.com/api'
    },
    backend: {
        host: 'api-ristix.bdo-ki.com',
        port: 4232,
        url: 'https://api-ristix.bdo-ki.com',
        apiUrl: 'https://api-ristix.bdo-ki.com/api/v1',
        wsUrl: 'wss://ristix.bdo-ki.com'
    },
    rAnalytics: {
        dashboardHost: 'analytics-ristix.bdo-ki.com',
        dashboardPort: 4236,
        dashboardUrl: 'https://analytics-ristix.bdo-ki.com',
        apiHost: 'analytics-calc-ristix.bdo-ki.com',
        apiPort: 4241,
        apiUrl: 'https://analytics-calc-ristix.bdo-ki.com/api'
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
            'https://ristix.bdo-ki.com',
            'https://api-ristix.bdo-ki.com',
            'https://analytics-ristix.bdo-ki.com',
            'https://analytics-calc-ristix.bdo-ki.com',
            'http://10.18.11.35:4231',
            'http://10.18.11.35:4232',
            'http://10.18.11.35:4236'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Requested-With']
    },
    websocket: {
        url: 'wss://ristix.bdo-ki.com',
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
const setupEcsProductionEnvironment = () => {
    console.log('🏭 Setting up IAF ECS Production Environment');
    console.log(`📍 Frontend: ${exports.ECS_PRODUCTION_CONFIG.frontend.url}`);
    console.log(`📍 Backend API: ${exports.ECS_PRODUCTION_CONFIG.backend.apiUrl}`);
    console.log(`📍 R Analytics: ${exports.ECS_PRODUCTION_CONFIG.rAnalytics.dashboardUrl}`);
    console.log(`📍 Database: ${exports.ECS_PRODUCTION_CONFIG.database.host}:${exports.ECS_PRODUCTION_CONFIG.database.port}`);
    return exports.ECS_PRODUCTION_CONFIG;
};
exports.setupEcsProductionEnvironment = setupEcsProductionEnvironment;
