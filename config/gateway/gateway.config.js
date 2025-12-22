// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: config/gateway/gateway.config.js
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Gateway Config)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Express Gateway, Redis
// Purpose: API Gateway configuration for menu system and infrastructure
// ============================================================================

module.exports = {
  http: {
    port: process.env.GATEWAY_PORT || 4233
  },
  
  https: {
    port: process.env.GATEWAY_HTTPS_PORT || 4434,
    options: {
      key: process.env.SSL_KEY_PATH,
      cert: process.env.SSL_CERT_PATH
    }
  },
  
  apiEndpoints: {
    backend: {
      host: process.env.BACKEND_HOST || 'localhost',
      port: process.env.BACKEND_PORT || 4232,
      paths: '/api/*'
    },
    
    frontend: {
      host: process.env.FRONTEND_HOST || 'localhost',
      port: process.env.FRONTEND_PORT || 4231,
      paths: '/*'
    },
    
    analytics: {
      host: process.env.R_ANALYTICS_HOST || 'localhost',
      port: process.env.R_ANALYTICS_PORT || 4236,
      paths: '/analytics/*'
    }
  },
  
  serviceEndpoints: {
    backend: {
      url: `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 4232}`
    },
    
    frontend: {
      url: `http://${process.env.FRONTEND_HOST || 'localhost'}:${process.env.FRONTEND_PORT || 4231}`
    },
    
    analytics: {
      url: `http://${process.env.R_ANALYTICS_HOST || 'localhost'}:${process.env.R_ANALYTICS_PORT || 4236}`
    }
  },
  
  policies: [
    'cors',
    'rate-limit',
    'oauth2',
    'proxy',
    'log',
    'terminate'
  ],
  
  pipelines: {
    api: {
      apiEndpoints: ['backend'],
      policies: [
        {
          cors: {
            action: {
              origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4231'],
              credentials: true
            }
          }
        },
        {
          'rate-limit': {
            action: {
              max: 1000,
              windowMs: 60000
            }
          }
        },
        {
          log: {
            action: {
              message: 'API Request: ${req.method} ${req.originalUrl}'
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'backend',
              changeOrigin: true
            }
          }
        }
      ]
    },
    
    frontend: {
      apiEndpoints: ['frontend'],
      policies: [
        {
          cors: {
            action: {
              origin: process.env.CORS_ORIGINS?.split(',') || ['*'],
              credentials: true
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'frontend',
              changeOrigin: true
            }
          }
        }
      ]
    },
    
    analytics: {
      apiEndpoints: ['analytics'],
      policies: [
        {
          'rate-limit': {
            action: {
              max: 100,
              windowMs: 60000
            }
          }
        },
        {
          proxy: {
            action: {
              serviceEndpoint: 'analytics',
              changeOrigin: true
            }
          }
        }
      ]
    }
  }
};
