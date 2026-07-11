"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentEnvironment = exports.isEcsProduction = exports.isLocalDevelopment = exports.config = exports.ConfigManager = exports.IAF_PRODUCTION_CONFIG = exports.LOCAL_DEVELOPMENT_CONFIG = void 0;
exports.LOCAL_DEVELOPMENT_CONFIG = {
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
                'https://ristix.bdo-ki.com,https://api-ristix.bdo-ki.com,https://analytics-ristix.bdo-ki.com' :
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
exports.IAF_PRODUCTION_CONFIG = {
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
class ConfigManager {
    constructor() {
        const deploymentTarget = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET || process.env.DEPLOYMENT_TARGET;
        const nodeEnv = process.env.NODE_ENV;
        let environment;
        if (deploymentTarget === 'ecs-production' || deploymentTarget === 'production') {
            environment = 'ecs-production';
        }
        else {
            environment = 'local';
        }
        console.log(`🔧 ConfigManager: deploymentTarget=${deploymentTarget}, nodeEnv=${nodeEnv}, selected=${environment}`);
        this.currentConfig = environment === 'ecs-production' ? exports.IAF_PRODUCTION_CONFIG : exports.LOCAL_DEVELOPMENT_CONFIG;
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    setEnvironment(mode) {
        this.currentConfig = mode === 'ecs-production' ? exports.IAF_PRODUCTION_CONFIG : exports.LOCAL_DEVELOPMENT_CONFIG;
        console.log(`🔧 Configuration switched to: ${this.currentConfig.name}`);
    }
    getConfig() {
        return this.currentConfig;
    }
    get frontend() { return this.currentConfig.frontend; }
    get backend() { return this.currentConfig.backend; }
    get rAnalytics() { return this.currentConfig.rAnalytics; }
    get database() { return this.currentConfig.database; }
    get cors() { return this.currentConfig.cors; }
    get security() { return this.currentConfig.security; }
    get features() { return this.currentConfig.features; }
    get iaf() { return this.currentConfig.iaf; }
    getApiUrl(endpoint) {
        return `${this.backend.apiUrl}${endpoint}`;
    }
    getFrontendUrl(path) {
        return `${this.frontend.url}${path}`;
    }
    getRAnalyticsUrl(endpoint) {
        return `${this.rAnalytics.apiUrl}${endpoint}`;
    }
    getRAnalyticsDashboardUrl(path = '') {
        return `${this.rAnalytics.dashboardUrl}${path}`;
    }
}
exports.ConfigManager = ConfigManager;
exports.config = ConfigManager.getInstance();
const isLocalDevelopment = () => exports.config.getConfig().mode === 'local';
exports.isLocalDevelopment = isLocalDevelopment;
const isEcsProduction = () => exports.config.getConfig().mode === 'ecs-production';
exports.isEcsProduction = isEcsProduction;
const currentEnvironment = () => exports.config.getConfig().name;
exports.currentEnvironment = currentEnvironment;
