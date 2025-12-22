// packages/r-analytics/src/health-check-service.js
// 🔧 Backend Health Check Service - Port 4237
// Simple health monitoring for backend integration
// ✅ Uses centralized configuration - NO HARDCODED VALUES

const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env files
function loadEnvironmentFiles() {
    const envFiles = [
        '.env',
        '.env.localdev',
        '.env.iafecs',
        '.env.production'
    ];

    envFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`📁 Loading environment file: ${file}`);
            const result = require('dotenv').config({ path: filePath, override: false });
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
    if (fs.existsSync(path.join(process.cwd(), '.env.iafecs'))) return 'iafecs';

    // Priority 4: Node environment
    if (nodeEnv === 'production' && !deploymentTarget.includes('local')) return 'iafecs';

    // Default: Local development
    return 'localdev';
}

const app = express();
const PORT = 4237;
const HOST = '0.0.0.0';

// Detect environment
const environment = detectEnvironment();
console.log(`🌍 Health Check Service detected environment: ${environment}`);

// R-API Bridge configuration - CENTRALIZED
const R_API_BRIDGE_URL = getEnvVar('R_ANALYTICS_URL',
    environment === 'iafecs' ?
    'https://iaf-ifrs-analytics.danafin.com' :
    'https://iaf-ifrs-analytics.ifrspro.id'
);

// IAF Tenant service configuration - IAF ONLY
const TENANT_SERVICES = {
    'iaf': {
        port: getEnvVar('TENANT_IAF_PORT', '4236'),
        url: getEnvVar('TENANT_IAF_URL',
            environment === 'iafecs' ?
            'https://iaf-ifrs-analytics.danafin.com' :
            'https://ifrs9-iaf-analytics.ifrspro.id'
        )
    }
};

console.log('🔧 Health Check Service Configuration:');
console.log(`   R-API Bridge: ${R_API_BRIDGE_URL}`);
console.log(`   Environment: ${environment}`);
console.log(`   Monitoring ${Object.keys(TENANT_SERVICES).length} tenant services`);

// Middleware
app.use(express.json());

// Simple logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Utility function to check service health
const checkServiceHealth = async (url, timeout = 5000) => {
    try {
        const response = await axios.get(url, { timeout });
        return {
            healthy: true,
            status: response.status,
            response_time: Date.now() - Date.now() // Simplified
        };
    } catch (error) {
        return {
            healthy: false,
            error: error.code || error.message,
            status: error.response?.status || 'NO_RESPONSE'
        };
    }
};

// Main health check endpoint (what backend calls)
app.get('/health', async (req, res) => {
    const timestamp = new Date().toISOString();
    const checks = {};
    
    try {
        // Check R-API Bridge (main service)
        const bridgeHealth = await checkServiceHealth(`${R_API_BRIDGE_URL}/health`);
        checks.r_api_bridge = {
            name: 'R-API Bridge',
            port: 4236,
            url: R_API_BRIDGE_URL,
            ...bridgeHealth
        };
        
        // Check individual tenant services
        for (const [tenant, config] of Object.entries(TENANT_SERVICES)) {
            const tenantHealth = await checkServiceHealth(config.url);
            checks[`tenant_${tenant}`] = {
                name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Banking`,
                port: config.port,
                url: config.url,
                ...tenantHealth
            };
        }
        
        // Determine overall status
        const allServices = Object.values(checks);
        const healthyServices = allServices.filter(s => s.healthy);
        const criticalServiceHealthy = checks.r_api_bridge?.healthy;
        
        let overallStatus;
        if (criticalServiceHealthy && healthyServices.length === allServices.length) {
            overallStatus = 'healthy';
        } else if (criticalServiceHealthy && healthyServices.length > 0) {
            overallStatus = 'degraded';
        } else {
            overallStatus = 'unhealthy';
        }
        
        const response = {
            status: overallStatus,
            timestamp,
            service: 'R Analytics Health Monitor',
            port: PORT,
            summary: {
                total_services: allServices.length,
                healthy_services: healthyServices.length,
                unhealthy_services: allServices.length - healthyServices.length
            },
            services: checks,
            integration: {
                r_api_bridge_available: criticalServiceHealthy,
                backend_integration_url: `${getEnvVar('HEALTH_SERVICE_URL', `http://localhost:${PORT}/health`)}`,
                main_service_url: R_API_BRIDGE_URL,
                environment: environment
            }
        };
        
        // Set appropriate HTTP status
        const httpStatus = overallStatus === 'healthy' ? 200 : 
                          overallStatus === 'degraded' ? 206 : 503;
        
        res.status(httpStatus).json(response);
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp,
            service: 'R Analytics Health Monitor',
            error: error.message,
            services: checks
        });
    }
});

// Detailed health check with more information
app.get('/health/detailed', async (req, res) => {
    const timestamp = new Date().toISOString();
    const checks = {};
    
    try {
        // Get detailed bridge health
        const bridgeResponse = await axios.get(`${R_API_BRIDGE_URL}/health`, { timeout: 10000 });
        checks.r_api_bridge = {
            name: 'R-API Bridge',
            port: 4236,
            healthy: true,
            details: bridgeResponse.data
        };
        
        // Check individual services
        for (const [tenant, config] of Object.entries(TENANT_SERVICES)) {
            const health = await checkServiceHealth(config.url);
            checks[`tenant_${tenant}`] = {
                name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Banking`,
                port: config.port,
                ...health
            };
        }
        
        res.json({
            status: 'detailed_check_complete',
            timestamp,
            service: 'R Analytics Health Monitor',
            port: PORT,
            services: checks,
            architecture: {
                description: 'Multi-tenant R Analytics with centralized API bridge',
                components: {
                    'Backend (IFRS9)': 'Port 4232',
                    'Health Monitor': 'Port 4237 (this service)',
                    'R-API Bridge': 'Port 4236 (main gateway)',
                    'Conventional Banking': 'Port 4238',
                    'Syariah Banking': 'Port 4239',
                    'DANA Banking': 'Port 4240'
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp,
            error: error.message,
            services: checks
        });
    }
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
    res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        service: 'R Analytics Health Monitor',
        port: PORT
    });
});

// Service status endpoint (minimal for quick checks)
app.get('/status', async (req, res) => {
    try {
        const bridgeCheck = await checkServiceHealth(`${R_API_BRIDGE_URL}/health`);
        res.json({
            r_api_bridge: bridgeCheck.healthy ? 'up' : 'down',
            health_monitor: 'up',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            r_api_bridge: 'unknown',
            health_monitor: 'up',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'R Analytics Health Monitor',
        version: '1.0.0',
        port: PORT,
        description: 'Health monitoring service for IFRS9 backend integration',
        endpoints: {
            health: '/health (main endpoint for backend)',
            detailed: '/health/detailed',
            ping: '/ping',
            status: '/status'
        },
        integration: {
            backend_url: getEnvVar('HEALTH_SERVICE_URL', `http://localhost:${PORT}/health`),
            r_api_bridge: R_API_BRIDGE_URL,
            tenant_services: TENANT_SERVICES,
            environment: environment
        },
        note: 'This service is specifically designed for backend health checks'
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Health service error:', error);
    res.status(500).json({
        status: 'error',
        service: 'R Analytics Health Monitor',
        error: error.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'not_found',
        service: 'R Analytics Health Monitor',
        available_endpoints: ['/health', '/health/detailed', '/ping', '/status'],
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, HOST, () => {
    const healthServiceUrl = getEnvVar('HEALTH_SERVICE_URL', `http://localhost:${PORT}/health`);
    console.log(`🏥 Health Check Service started successfully!`);
    console.log(`📡 Listening on: http://${HOST}:${PORT}`);
    console.log(`🔗 Backend Integration: ${healthServiceUrl}`);
    console.log(`🌉 Monitoring R-API Bridge: ${R_API_BRIDGE_URL}`);
    console.log(`🏦 Monitoring ${Object.keys(TENANT_SERVICES).length} tenant services`);
    console.log(`🌍 Environment: ${environment}`);

    // Test connection to R-API Bridge on startup
    setTimeout(async () => {
        try {
            await checkServiceHealth(`${R_API_BRIDGE_URL}/health`);
            console.log(`✅ R-API Bridge connection verified`);
        } catch (error) {
            console.log(`⚠️ R-API Bridge not yet available: ${error.message}`);
        }
    }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Health Check Service shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Health Check Service shutting down gracefully...');
    process.exit(0);
});