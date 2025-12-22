// ============================================================================
//  packages/backend/src/core/database/index.ts - CENTRALIZED EXPORTS
// ============================================================================

export { DatabaseRegistry } from './DatabaseRegistry';
export { ConnectionFactory } from './ConnectionFactory';
export { HealthMonitor } from './HealthMonitor';

// Create and export singleton instances
export const databaseRegistry = DatabaseRegistry.getInstance();
export const connectionFactory = ConnectionFactory.getInstance();
export const healthMonitor = HealthMonitor.getInstance();

// Convenience functions
export const initializeCentralizedDatabase = async (): Promise<void> => {
  console.log('🚀 Initializing Centralized Database System...');
  
  // Registry is automatically initialized from environment
  console.log('✅ DatabaseRegistry initialized');
  
  // Start health monitoring
  healthMonitor.startMonitoring(30000); // 30 seconds
  console.log('✅ HealthMonitor started');
  
  // Perform initial health check
  const health = await healthMonitor.performHealthCheck();
  console.log(`✅ Initial health check: ${health.overall_status}`);
  
  console.log('🎉 Centralized Database System ready!');
};

export const getCentralizedDatabaseStatus = async (): Promise<any> => {
  const registryStats = databaseRegistry.getRegistryStats();
  const connectionStats = connectionFactory.getConnectionStats();
  const monitoringStats = healthMonitor.getMonitoringStats();
  const latestHealth = await healthMonitor.performHealthCheck();

  return {
    timestamp: new Date().toISOString(),
    system_status: latestHealth.overall_status,
    registry: registryStats,
    connections: connectionStats,
    monitoring: monitoringStats,
    health: {
      total_databases: latestHealth.total_databases,
      healthy: latestHealth.healthy_databases,
      degraded: latestHealth.degraded_databases,
      unhealthy: latestHealth.unhealthy_databases,
      critical_failures: latestHealth.critical_failures
    }
  };
};

// ============================================================================
// USAGE EXAMPLE - Integration with your existing code
// ============================================================================

/*
// In your app.ts, replace existing database initialization with:

import { initializeCentralizedDatabase, getCentralizedDatabaseStatus } from './core/database';

// Initialize the centralized system
await initializeCentralizedDatabase();

// Get connections using the factory
import { connectionFactory } from './core/database';

const platformDb = await connectionFactory.getPlatformConnection();
const tenantDb = await connectionFactory.getTenantConnection('dana');
const frs9Db = await connectionFactory.getFRS9Connection();

// Add health check endpoint
app.get('/api/v1/system/database-status', async (req, res) => {
  const status = await getCentralizedDatabaseStatus();
  res.json({ success: true, data: status });
});
*/