// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: config/infrastructure/load-balancer.config.js
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Load Balancer Config)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Node.js, Express
// Purpose: Load balancer configuration for infrastructure management
// ============================================================================

module.exports = {
  // Load balancer settings
  algorithm: process.env.LB_ALGORITHM || 'round-robin', // round-robin, least-connections, ip-hash
  
  // Health check configuration
  healthCheck: {
    enabled: true,
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000, // 5 seconds
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
    path: '/health',
    method: 'GET',
    expectedStatus: [200, 204]
  },
  
  // Server instances
  servers: [
    {
      id: 'backend-1',
      host: process.env.BACKEND_HOST || 'localhost',
      port: process.env.BACKEND_PORT || 4232,
      weight: 1,
      maxConnections: 1000,
      enabled: true
    }
    // Additional servers can be added for scaling
  ],
  
  // Connection settings
  connection: {
    timeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
    keepAlive: true,
    maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000
  },
  
  // Monitoring and metrics
  monitoring: {
    enabled: true,
    metricsInterval: parseInt(process.env.METRICS_INTERVAL) || 60000, // 1 minute
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  // Circuit breaker settings
  circuitBreaker: {
    enabled: true,
    threshold: 5, // failures
    timeout: 60000, // 1 minute
    monitor: 30000 // 30 seconds
  },
  
  // SSL/TLS settings
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    key: process.env.SSL_KEY_PATH,
    cert: process.env.SSL_CERT_PATH,
    ca: process.env.SSL_CA_PATH
  }
};
