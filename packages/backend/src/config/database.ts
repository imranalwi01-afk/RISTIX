// packages/backend/src/config/database.ts
// ✅ SURGICAL FIX: Updated health check to match controller expectations

import { databaseConfig } from '../core/database/config/database.config';
import logger from './logger';

class DatabaseManager {
  // ✅ Initialize all database connections
  public async initializeConnections(): Promise<void> {
    try {
      logger.info('🔗 Initializing multi-tenant database connections...');

      // The DatabaseConfigurationService automatically initializes platform and shared connections
      // Test all connections
      const health = await databaseConfig.healthCheck();
      
      const allHealthy = health.status === 'healthy';
      
      if (allHealthy) {
        logger.info('✅ All database connections initialized successfully');
        logger.info(`📊 Connection status:`, health);
      } else {
        logger.warn('⚠️ Some database connections failed', health);
      }

    } catch (error) {
      logger.error('❌ Failed to initialize database connections:', error);
      throw error;
    }
  }

  // ✅ Get platform admin database connection
  public getPlatformDB() {
    return databaseConfig.getPlatformConnection();
  }

  // ✅ Get shared services database connection
  public getSharedDB() {
    return databaseConfig.getSharedServicesConnection();
  }

  // ✅ Get FRS9PRO database connection (DS2)
  public getFRS9DB() {
    return databaseConfig.getFRS9Connection();
  }

  // ✅ Get tenant database connection
  public async getTenantDB(tenantId: string) {
    return await databaseConfig.getTenantConnection(tenantId);
  }

  // ✅ SURGICAL FIX: Updated health check to return correct structure
  public async healthCheck() {
    try {
      const health = await databaseConfig.healthCheck();
      
      // Convert to expected format for compatibility
      const platformConn = health.connections.find(c => c.name === 'platform_admin');
      const sharedConn = health.connections.find(c => c.name === 'shared_services');
      const frs9Conn = health.connections.find(c => c.name === 'frs9_legacy');
      
      return {
        status: health.status,
        platform: platformConn?.status === 'healthy',
        shared: sharedConn?.status === 'healthy',
        frs9_legacy: frs9Conn?.status === 'healthy',
        tenants: health.connections
          .filter(c => c.name.startsWith('tenant_'))
          .reduce((acc, conn) => {
            acc[conn.name] = conn.status === 'healthy';
            return acc;
          }, {} as Record<string, boolean>),
        connections: health.connections
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        platform: false,
        shared: false,
        frs9_legacy: false,
        tenants: {},
        connections: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ✅ Close all database connections
  public async closeAllConnections(): Promise<void> {
    try {
      logger.info('🔌 Closing all database connections...');
      await databaseConfig.closeAllConnections();
      logger.info('✅ All database connections closed successfully');
    } catch (error) {
      logger.error('❌ Failed to close database connections:', error);
    }
  }

  // ✅ Get connection status for monitoring
  public async getConnectionStatus() {
    try {
      const health = await this.healthCheck();
      return {
        platform_admin: health.platform,
        shared_services: health.shared,
        frs9_legacy: health.frs9_legacy,
        tenant_connections: Object.keys(health.tenants || {}).length,
        all_healthy: health.platform && health.shared && health.frs9_legacy
      };
    } catch (error) {
      logger.error('Failed to get connection status:', error);
      return {
        platform_admin: false,
        shared_services: false,
        frs9_legacy: false,
        tenant_connections: 0,
        all_healthy: false
      };
    }
  }
}

// ✅ Create singleton instance for app.ts
const databaseManager = new DatabaseManager();

// ✅ Export as default for app.ts compatibility
export default databaseManager;

// ✅ Export named exports for flexibility
export { databaseManager, databaseConfig };