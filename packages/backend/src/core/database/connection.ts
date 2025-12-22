// packages/backend/src/core/database/connection.ts
// ✅ Database Connection Bridge - Links models to DatabaseConfigurationService
// CRITICAL: This bridges your excellent models with your DatabaseConfigurationService

import { Sequelize } from 'sequelize';
import { databaseConfig } from './config/database.config';

// Export the platform admin connection (default for models)
// Your models import { sequelize } from '../database/connection'
// This provides that sequelize instance
export const sequelize = databaseConfig.getPlatformConnection();

// Export additional connections for multi-tenant usage
export const platformSequelize = databaseConfig.getPlatformConnection();
export const sharedSequelize = databaseConfig.getSharedServicesConnection();

// Tenant connection factory
export const getTenantConnection = async (tenantId: string): Promise<Sequelize> => {
  return await databaseConfig.getTenantConnection(tenantId);
};

// Connection health check
export const checkConnectionHealth = async () => {
  return await databaseConfig.healthCheck();
};

// Close all connections (for graceful shutdown)
export const closeAllConnections = async () => {
  return await databaseConfig.closeAllConnections();
};

// Default export is the platform connection
export default sequelize;