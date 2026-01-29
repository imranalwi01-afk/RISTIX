// packages/r-analytics/src/r-api-bridge.js
// 🔧 R-API Bridge Service - Port 4236
// Centralized gateway for multi-tenant R Analytics services

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files
function loadEnvironmentFiles() {
    const envFiles = [
        '.env',
        '.env.localdev',
        '.env.iafecs',
        '.env.production'
    ];

    envFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`📁 Loading environment file: ${file}`);
            const result = dotenv.config({ path: filePath, override: false });
            if (result.error) {
                console.warn(`⚠️ Warning loading ${file}:`, result.error.message);
            }
        }
    });
}

// Load environment files
loadEnvironmentFiles();

// Get environment variable with fallback
function getEnvVar(key, defaultValue) {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
}

// Auto-detect environment
function detectEnvironment() {
    const deploymentTarget = getEnvVar('DEPLOYMENT_TARGET', '');
    const nodeEnv = getEnvVar('NODE_ENV', 'development');
    const hostname = getEnvVar('HOSTNAME', '');

    // Priority 1: Explicit deployment target
    if (deploymentTarget === 'iafecs') return 'iafecs';
    if (deploymentTarget === 'localdev') return 'localdev';

    // Priority 2: ECS metadata indicators
    if (hostname.includes('ecs') || hostname.includes('alibaba')) return 'iafecs';

    // Priority 3: Environment file existence
    if (fs.existsSync(path.join(__dirname, '..', '.env.iafecs'))) return 'iafecs';

    // Priority 4: Node environment
    if (nodeEnv === 'production' && !deploymentTarget.includes('local')) return 'iafecs';

    // Default: Local development
    return 'localdev';
}

const app = express();
const PORT = 4241; // Fixed: Change from 4236 to avoid conflict with Shiny app
const HOST = '0.0.0.0';

// Detect environment
const environment = detectEnvironment();
console.log(`🌍 R-API Bridge detected environment: ${environment}`);

// Middleware - CENTRALIZED CORS ORIGINS
app.use(cors({
    origin: getEnvVar('CORS_ORIGINS',
        environment === 'iafecs' ?
        'https://iaf-ifrs.danafin.com,https://iaf-ifrs-be.danafin.com,https://iaf-ifrs-analytics.danafin.com,https://iaf-ifrs-analytics-calc.danafin.com' :
        'https://iaf-ifrs.ifrspro.id,https://iaf-ifrs-be.ifrspro.id,https://iaf-ifrs-analytics.ifrspro.id,https://iaf-ifrs-analytics-calc.ifrspro.id,http://localhost:4231,http://192.168.0.85:4231'
    ).split(',').map(origin => origin.trim()),
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// 🔧 IAF TENANT CONFIGURATION - IAF ONLY
const TENANT_CONFIG = {
    'iaf': {
        name: 'Indonesia Airawata Finance',
        port: parseInt(getEnvVar('TENANT_IAF_PORT', '4236')),
        banking_type: 'conventional',
        domain: getEnvVar('TENANT_IAF_URL',
            environment === 'iafecs' ?
            'https://iaf-ifrs-analytics.danafin.com' :
            'https://ifrs9-iaf-analytics.ifrspro.id'
        ),
        internal_url: getEnvVar('TENANT_IAF_INTERNAL',
            environment === 'iafecs' ?
            'https://iaf-ifrs-analytics.danafin.com' :
            'http://192.168.0.85:4236'
        )
    }
};

// 🔧 UTILITY FUNCTIONS
const validateTenant = (tenantSlug) => {
    return TENANT_CONFIG.hasOwnProperty(tenantSlug);
};

const getTenantConfig = (tenantSlug) => {
    return TENANT_CONFIG[tenantSlug] || null;
};

const checkServiceHealth = async (url) => {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        return { healthy: true, status: response.status };
    } catch (error) {
        return { healthy: false, error: error.message };
    }
};

// 🔧 API ROUTES

// Health check endpoint
app.get('/health', async (req, res) => {
    const timestamp = new Date().toISOString();
    const services = {};
    
    // Check all tenant services
    for (const [tenantSlug, config] of Object.entries(TENANT_CONFIG)) {
        const healthCheck = await checkServiceHealth(config.internal_url);
        services[tenantSlug] = {
            name: config.name,
            port: config.port,
            banking_type: config.banking_type,
            healthy: healthCheck.healthy,
            internal_url: config.internal_url,
            domain: config.domain
        };
    }
    
    const allHealthy = Object.values(services).every(s => s.healthy);
    const status = allHealthy ? 'healthy' : 'degraded';
    
    res.json({
        status,
        timestamp,
        service: 'R-API Bridge',
        port: PORT,
        services,
        message: 'R Analytics Multi-Tenant API Gateway'
    });
});

// Get available tenants
app.get('/api/tenants', (req, res) => {
    const tenants = Object.entries(TENANT_CONFIG).map(([slug, config]) => ({
        slug,
        name: config.name,
        banking_type: config.banking_type,
        domain: config.domain,
        available: true // We'll check this in real-time if needed
    }));
    
    res.json({
        success: true,
        tenants,
        default_tenant: 'iaf'
    });
});

// Proxy requests to specific tenant R service
app.all('/api/tenant/:tenantSlug/*', async (req, res) => {
    const { tenantSlug } = req.params;
    const targetPath = req.path.replace(`/api/tenant/${tenantSlug}`, '');
    
    // Validate tenant
    if (!validateTenant(tenantSlug)) {
        return res.status(404).json({
            success: false,
            error: 'Tenant not found',
            available_tenants: Object.keys(TENANT_CONFIG)
        });
    }
    
    const tenantConfig = getTenantConfig(tenantSlug);
    const targetUrl = `${tenantConfig.internal_url}${targetPath}`;
    
    try {
        // Forward request to tenant-specific R service
        const axiosConfig = {
            method: req.method,
            url: targetUrl,
            headers: {
                ...req.headers,
                'x-tenant-slug': tenantSlug,
                'x-banking-type': tenantConfig.banking_type,
                'host': undefined // Remove original host header
            },
            timeout: 30000
        };
        
        if (req.method !== 'GET' && req.body) {
            axiosConfig.data = req.body;
        }
        
        const response = await axios(axiosConfig);
        
        // Forward response
        res.status(response.status);
        Object.entries(response.headers).forEach(([key, value]) => {
            if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
                res.set(key, value);
            }
        });
        res.send(response.data);
        
    } catch (error) {
        console.error(`Proxy error for ${tenantSlug}:`, error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                error: 'Tenant service error',
                message: error.response.data
            });
        } else {
            res.status(503).json({
                success: false,
                error: 'Service unavailable',
                message: `Unable to connect to ${tenantConfig.name}`,
                tenant: tenantSlug
            });
        }
    }
});

// Create R session for specific tenant
app.post('/api/session/create', async (req, res) => {
    const { tenant_slug, user_id, session_config } = req.body;
    
    if (!validateTenant(tenant_slug)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid tenant'
        });
    }
    
    const tenantConfig = getTenantConfig(tenant_slug);
    
    try {
        // Create session in tenant-specific R service
        const response = await axios.post(`${tenantConfig.internal_url}/session/create`, {
            user_id,
            tenant_slug,
            banking_type: tenantConfig.banking_type,
            ...session_config
        }, { timeout: 15000 });
        
        res.json({
            success: true,
            session: response.data,
            tenant: {
                slug: tenant_slug,
                name: tenantConfig.name,
                banking_type: tenantConfig.banking_type,
                domain: tenantConfig.domain
            }
        });
        
    } catch (error) {
        console.error(`Session creation error for ${tenant_slug}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Session creation failed',
            tenant: tenant_slug
        });
    }
});

// Get session info
app.get('/api/session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { tenant_slug } = req.query;
    
    if (!tenant_slug || !validateTenant(tenant_slug)) {
        return res.status(400).json({
            success: false,
            error: 'Tenant slug required'
        });
    }
    
    const tenantConfig = getTenantConfig(tenant_slug);
    
    try {
        const response = await axios.get(`${tenantConfig.internal_url}/session/${sessionId}`, {
            timeout: 10000
        });
        
        res.json({
            success: true,
            session: response.data,
            tenant: {
                slug: tenant_slug,
                name: tenantConfig.name
            }
        });
        
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
});

// Execute R code in specific tenant
app.post('/api/execute', async (req, res) => {
    const { tenant_slug, session_id, code, timeout = 30000 } = req.body;
    
    if (!validateTenant(tenant_slug)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid tenant'
        });
    }
    
    const tenantConfig = getTenantConfig(tenant_slug);
    
    try {
        const response = await axios.post(`${tenantConfig.internal_url}/execute`, {
            session_id,
            code,
            tenant_slug,
            banking_type: tenantConfig.banking_type
        }, { timeout });
        
        res.json({
            success: true,
            result: response.data,
            tenant: tenant_slug,
            execution_time: response.headers['x-execution-time']
        });
        
    } catch (error) {
        console.error(`Code execution error for ${tenant_slug}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Execution failed',
            tenant: tenant_slug
        });
    }
});

// Get tenant-specific Shiny app URL
app.get('/api/shiny-url/:tenantSlug', (req, res) => {
    const { tenantSlug } = req.params;
    
    if (!validateTenant(tenantSlug)) {
        return res.status(404).json({
            success: false,
            error: 'Tenant not found'
        });
    }
    
    const tenantConfig = getTenantConfig(tenantSlug);
    
    res.json({
        success: true,
        tenant: {
            slug: tenantSlug,
            name: tenantConfig.name,
            banking_type: tenantConfig.banking_type,
            internal_url: tenantConfig.internal_url,
            domain: tenantConfig.domain,
            iframe_url: tenantConfig.domain, // Production URL for iframe
            development_url: tenantConfig.internal_url // For local testing
        }
    });
});

// Upload data to specific tenant
app.post('/api/upload/:tenantSlug', async (req, res) => {
    const { tenantSlug } = req.params;
    
    if (!validateTenant(tenantSlug)) {
        return res.status(404).json({
            success: false,
            error: 'Tenant not found'
        });
    }
    
    const tenantConfig = getTenantConfig(tenantSlug);
    
    try {
        // Forward upload to tenant-specific service
        const response = await axios.post(`${tenantConfig.internal_url}/upload`, req.body, {
            headers: {
                'content-type': req.headers['content-type'],
                'x-tenant-slug': tenantSlug
            },
            timeout: 60000
        });
        
        res.json({
            success: true,
            upload: response.data,
            tenant: tenantSlug
        });
        
    } catch (error) {
        console.error(`Upload error for ${tenantSlug}:`, error.message);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            tenant: tenantSlug
        });
    }
});

// Root endpoint - API documentation
app.get('/', (req, res) => {
    res.json({
        service: 'R-API Bridge',
        version: '1.0.0',
        port: PORT,
        description: 'Centralized API Gateway for Multi-Tenant R Analytics Services',
        endpoints: {
            health: '/health',
            tenants: '/api/tenants',
            tenant_proxy: '/api/tenant/:tenantSlug/*',
            session_create: '/api/session/create',
            session_info: '/api/session/:sessionId',
            execute: '/api/execute',
            shiny_url: '/api/shiny-url/:tenantSlug',
            upload: '/api/upload/:tenantSlug'
        },
        available_tenants: Object.keys(TENANT_CONFIG),
        tenant_services: TENANT_CONFIG
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Bridge service error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        service: 'R-API Bridge'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        service: 'R-API Bridge',
        available_endpoints: [
            '/health',
            '/api/tenants', 
            '/api/tenant/:tenantSlug/*',
            '/api/session/create',
            '/api/execute',
            '/api/shiny-url/:tenantSlug'
        ]
    });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`🌉 R-API Bridge Service started successfully!`);
    console.log(`📡 Listening on: http://${HOST}:${PORT}`);
    console.log(`🏦 Managing ${Object.keys(TENANT_CONFIG).length} tenant services:`);
    
    Object.entries(TENANT_CONFIG).forEach(([slug, config]) => {
        console.log(`   • ${config.name} (${slug}): ${config.internal_url}`);
    });
    
    // ✅ ENVIRONMENT-AWARE SERVICE URLS: Use centralized configuration
    const serviceHost = getEnvVar('SERVICE_HOST',
        environment === 'iafecs' ? 'iaf-ifrs-analytics.danafin.com' : 'ifrs9-iaf-analytics.ifrspro.id');
    const serviceUrl = `https://${serviceHost}`;

    console.log(`🔗 Health Check: ${serviceUrl}/health`);
    console.log(`📚 API Docs: ${serviceUrl}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 R-API Bridge shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 R-API Bridge shutting down gracefully...');
    process.exit(0);
});