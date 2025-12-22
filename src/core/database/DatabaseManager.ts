// packages/backend/src/core/database/DatabaseManager.ts
import { Sequelize, Options } from 'sequelize';
import databaseConfig, { generateTenantConfig, sharedServicesConfig } from '../../config/database';
import logger from '../../config/logger';
import appConfig from '../../config/app';

interface TenantConnection {
  sequelize: Sequelize;
  lastUsed: Date;
  connectionCount: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private platformDB: Sequelize;
  private sharedServicesDB: Sequelize;
  private tenantConnections: Map<string, TenantConnection> = new Map();
  private connectionCleanupInterval: NodeJS.Timeout;

  private constructor() {
    this.initializePlatformDB();
    this.initializeSharedServicesDB();
    this.startConnectionCleanup();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializePlatformDB(): void {
    const config = databaseConfig[appConfig.nodeEnv as keyof typeof databaseConfig];
    this.platformDB = new Sequelize(config);
    
    this.platformDB.authenticate()
      .then(() => {
        logger.info('Platform database connection established successfully');
      })
      .catch((error) => {
        logger.error('Platform database connection failed:', error);
        throw error;
      });
  }

  private initializeSharedServicesDB(): void {
    this.sharedServicesDB = new Sequelize(sharedServicesConfig);
    
    this.sharedServicesDB.authenticate()
      .then(() => {
        logger.info('Shared services database connection established successfully');
      })
      .catch((error) => {
        logger.error('Shared services database connection failed:', error);
        throw error;
      });
  }

  public getPlatformDB(): Sequelize {
    return this.platformDB;
  }

  public getSharedServicesDB(): Sequelize {
    return this.sharedServicesDB;
  }

  public async getTenantDB(tenantSlug: string, bankingType: 'conventional' | 'syariah' | 'dual' = 'conventional'): Promise<Sequelize> {
    const connectionKey = `${tenantSlug}_${bankingType}`;
    
    // Check if connection exists and is healthy
    if (this.tenantConnections.has(connectionKey)) {
      const connection = this.tenantConnections.get(connectionKey)!;
      connection.lastUsed = new Date();
      connection.connectionCount++;
      
      // Test connection health
      try {
        await connection.sequelize.authenticate();
        return connection.sequelize;
      } catch (error) {
        logger.warn(`Tenant DB connection unhealthy for ${connectionKey}, recreating...`);
        await this.closeTenantConnection(connectionKey);
      }
    }

    // Create new connection
    const config = generateTenantConfig(tenantSlug, bankingType);
    const sequelize = new Sequelize(config);

    try {
      await sequelize.authenticate();
      
      // Store connection
      this.tenantConnections.set(connectionKey, {
        sequelize,
        lastUsed: new Date(),
        connectionCount: 1,
      });

      logger.info(`Tenant database connection established for ${connectionKey}`);
      return sequelize;
    } catch (error) {
      logger.error(`Failed to connect to tenant database ${connectionKey}:`, error);
      throw error;
    }
  }

  private async closeTenantConnection(connectionKey: string): Promise<void> {
    const connection = this.tenantConnections.get(connectionKey);
    if (connection) {
      try {
        await connection.sequelize.close();
        logger.info(`Closed tenant database connection: ${connectionKey}`);
      } catch (error) {
        logger.error(`Error closing tenant connection ${connectionKey}:`, error);
      }
      this.tenantConnections.delete(connectionKey);
    }
  }

  private startConnectionCleanup(): void {
    // Clean up idle connections every 30 minutes
    this.connectionCleanupInterval = setInterval(async () => {
      const now = new Date();
      const idleTimeout = appConfig.tenantConnectionTimeout;

      for (const [key, connection] of this.tenantConnections.entries()) {
        const idleTime = now.getTime() - connection.lastUsed.getTime();
        
        if (idleTime > idleTimeout) {
          logger.info(`Closing idle tenant connection: ${key}`);
          await this.closeTenantConnection(key);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  public async closeAllConnections(): Promise<void> {
    // Clear cleanup interval
    if (this.connectionCleanupInterval) {
      clearInterval(this.connectionCleanupInterval);
    }

    // Close all tenant connections
    const promises = Array.from(this.tenantConnections.keys()).map(key => 
      this.closeTenantConnection(key)
    );
    await Promise.all(promises);

    // Close platform and shared services connections
    try {
      await this.platformDB.close();
      logger.info('Platform database connection closed');
    } catch (error) {
      logger.error('Error closing platform database:', error);
    }

    try {
      await this.sharedServicesDB.close();
      logger.info('Shared services database connection closed');
    } catch (error) {
      logger.error('Error closing shared services database:', error);
    }
  }

  public getConnectionStats(): { [key: string]: any } {
    const stats = {
      platform: {
        status: this.platformDB ? 'connected' : 'disconnected',
      },
      sharedServices: {
        status: this.sharedServicesDB ? 'connected' : 'disconnected',
      },
      tenants: {}
    };

    for (const [key, connection] of this.tenantConnections.entries()) {
      (stats.tenants as any)[key] = {
        lastUsed: connection.lastUsed,
        connectionCount: connection.connectionCount,
      };
    }

    return stats;
  }
}

export default DatabaseManager;
