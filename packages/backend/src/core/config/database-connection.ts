// ============================================================================
// packages/backend/src/core/config/database-connection.ts
// ✅ UTILITY: Database connection getter for services
// ============================================================================

import { Pool } from 'pg';
import { databaseConfig } from '../database/config/database.config';

/**
 * Get tenant database connection
 * This function provides a simple interface for services to get database connections
 */
export function getTenantDatabaseConnection(): Pool {
  try {
    // For IAF single tenant mode, return the tenant connection synchronously
    return databaseConfig.getConnectionById('tenant_iaf');
  } catch (error) {
    console.error('❌ Failed to get tenant database connection:', error);

    // Fallback to platform database
    console.log('⚠️ Falling back to platform database connection');
    return databaseConfig.getPlatformConnection();
  }
}

/**
 * Get platform database connection
 */
export function getPlatformDatabaseConnection(): Pool {
  return databaseConfig.getPlatformConnection();
}

/**
 * Get shared services database connection
 */
export function getSharedServicesConnection(): Pool {
  return databaseConfig.getSharedServicesConnection();
}

/**
 * Get FRS9 database connection
 */
export function getFRS9DatabaseConnection(): Pool {
  return databaseConfig.getFRS9Connection();
}

/**
 * Get database connection by ID
 */
export function getDatabaseConnectionById(databaseId: string): Pool {
  return databaseConfig.getConnectionById(databaseId);
}

// Export default for backward compatibility
export default getTenantDatabaseConnection;