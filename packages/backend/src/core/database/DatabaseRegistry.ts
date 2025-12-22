// ============================================================================
//  packages/backend/src/core/database/DatabaseRegistry.ts
// ============================================================================
// ✅ CENTRALIZED CONFIGURATION INTEGRATION
// ============================================================================

import { Pool } from 'pg';
import { Sequelize } from 'sequelize';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';
import { loggerService as logger } from '../../utils/logger.service';

// Enhanced DatabaseDefinition with comprehensive configuration
interface DatabaseDefinition {
  id: string;
  name: string;
  type: 'platform' | 'shared' | 'tenant' | 'legacy' | 'analytics' | 'production';
  server: 'DS1' | 'DS2' | 'DS3' | 'RDS' | string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  healthCheckInterval: number;
  tags: string[];
  isActive: boolean;
  priority: 'critical' | 'high' | 'normal' | 'low';
  region?: string;
  version?: string;
  description?: string;
  lastHealthCheck?: Date;
  healthStatus?: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  connectionPool?: Pool;
  sequelizeInstance?: Sequelize;
}

interface ServerDefinition {
  id: string;
  name: string;
  host: string;
  port: number;
  type: 'primary' | 'secondary' | 'analytics' | 'backup';
  region?: string;
  isActive: boolean;
}

export class DatabaseRegistry {
  private static instance: DatabaseRegistry;
  private databases: Map<string, DatabaseDefinition> = new Map();
  private servers: Map<string, ServerDefinition> = new Map();
  private tenantDiscoveryCache: Map<string, string[]> = new Map();
  private autoDiscoveryEnabled: boolean = true;

  private constructor() {
    this.initializeFromEnvironment();
  }

  public static getInstance(): DatabaseRegistry {
    if (!DatabaseRegistry.instance) {
      DatabaseRegistry.instance = new DatabaseRegistry();
    }
    return DatabaseRegistry.instance;
  }

  // ============================================================================
  // ENVIRONMENT-BASED INITIALIZATION
  // ============================================================================
  
  private initializeFromEnvironment(): void {
    console.log('🏗️ Initializing DatabaseRegistry from centralized environment...');

    try {
      // Use centralized environment configuration
      const envConfig = backendEnvironmentLoader.getConfiguration();

      // Register database servers using centralized config
      this.registerServer({
        id: 'DS1',
        name: 'Primary Database Server',
        host: envConfig.database.platform.host,
        port: envConfig.database.platform.port,
        type: 'primary',
        region: envConfig.deploymentTarget === 'iafecs' ? 'ecs' : 'local',
        isActive: true
      });

      this.registerServer({
        id: 'DS2',
        name: 'FRS9 Legacy Server',
        host: envConfig.database.frs9.host,
        port: envConfig.database.frs9.port,
        type: 'analytics',
        region: envConfig.deploymentTarget === 'iafecs' ? 'ecs' : 'local',
        isActive: true
      });

      // Register core databases
      this.registerCoreSystemDatabases(envConfig);
      this.registerLegacyDatabases(envConfig);
      this.discoverTenantDatabases(envConfig);

      console.log(`✅ DatabaseRegistry initialized with ${this.databases.size} databases on ${this.servers.size} servers`);
    } catch (error) {
      console.warn('⚠️ Failed to initialize from centralized config, falling back to environment variables:', error);
      this.initializeFromEnvironmentFallback();
    }
  }

  private initializeFromEnvironmentFallback(): void {
    console.log('🏗️ Initializing DatabaseRegistry from environment variables (fallback)...');

    // Register database servers
    this.registerServer({
      id: 'DS1',
      name: 'Primary Database Server',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      type: 'primary',
      region: 'local',
      isActive: true
    });

    this.registerServer({
      id: 'DS2',
      name: 'FRS9 Legacy Server',
      host: process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'),
      type: 'analytics',
      region: 'local',
      isActive: true
    });

    // Register core databases
    this.registerCoreSystemDatabases();
    this.registerLegacyDatabases();
    this.discoverTenantDatabases();

    console.log(`✅ DatabaseRegistry initialized with ${this.databases.size} databases on ${this.servers.size} servers`);
  }

  private registerCoreSystemDatabases(envConfig?: any): void {
    const platformConfig = envConfig?.database?.platform;
    const sharedConfig = envConfig?.database?.shared;

    // Platform Admin Database
    this.registerDatabase({
      id: 'platform_admin',
      name: 'Platform Administration',
      type: 'platform',
      server: 'DS1',
      host: platformConfig?.host || process.env.DB_HOST || 'localhost',
      port: platformConfig?.port || parseInt(process.env.DB_PORT || '5432'),
      database: platformConfig?.database || process.env.PLATFORM_DB_NAME || 'ifrspro_platform_admin',
      username: platformConfig?.user || process.env.DB_USER || 'postgres',
      password: platformConfig?.password || process.env.DB_PASSWORD || 'postgres',
      ssl: platformConfig?.ssl !== undefined ? platformConfig.ssl : (process.env.DB_SSL === 'true'),
      maxConnections: 20,
      tags: ['core', 'admin', 'user-management'],
      isActive: true,
      priority: 1
    });

    // Shared Services Database
    this.registerDatabase({
      id: 'shared_services',
      name: 'Shared Services',
      type: 'shared',
      server: 'DS1',
      host: sharedConfig?.host || platformConfig?.host || process.env.DB_HOST || 'localhost',
      port: sharedConfig?.port || platformConfig?.port || parseInt(process.env.DB_PORT || '5432'),
      database: sharedConfig?.database || process.env.SHARED_DB_NAME || 'ifrspro_shared_services',
      username: sharedConfig?.user || platformConfig?.user || process.env.DB_USER || 'postgres',
      password: sharedConfig?.password || platformConfig?.password || process.env.DB_PASSWORD || 'postgres',
      ssl: sharedConfig?.ssl !== undefined ? sharedConfig.ssl : (platformConfig?.ssl !== undefined ? platformConfig.ssl : (process.env.DB_SSL === 'true')),
      maxConnections: 15,
      tags: ['shared', 'reference-data', 'calculations'],
      isActive: true,
      priority: 2
    });
  }

  private registerLegacyDatabases(envConfig?: any): void {
    const frs9Config = envConfig?.database?.frs9;

    // FRS9PRO Legacy Database
    this.registerDatabase({
      id: 'frs9_legacy',
      name: 'FRS9 Legacy System',
      type: 'legacy',
      server: 'DS2',
      host: frs9Config?.host || process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost',
      port: frs9Config?.port || parseInt(process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'),
      database: frs9Config?.database || process.env.FRS9_DB_NAME || 'FRS9PRO',
      username: frs9Config?.user || process.env.FRS9_DB_USER || 'postgres',
      password: frs9Config?.password || process.env.FRS9_DB_PASSWORD || 'postgres',
      ssl: frs9Config?.ssl !== undefined ? frs9Config.ssl : (process.env.FRS9_DB_SSL === 'true'),
      maxConnections: 5,
      tags: ['legacy', 'parameters', 'calculations'],
      isActive: true,
      priority: 3
    });

    // IFRS9 Analytics Database
    this.registerDatabase({
      id: 'ifrs9_analytics',
      name: 'IFRS9 Analytics & R Processing',
      type: 'analytics',
      server: 'DS2',
      host: frs9Config?.host || process.env.FRS9_DB_HOST || process.env.DB_HOST || 'localhost',
      port: frs9Config?.port || parseInt(process.env.FRS9_DB_PORT || process.env.DB_PORT || '5433'),
      database: 'IFRS9_pro',
      username: frs9Config?.user || process.env.FRS9_DB_USER || 'postgres',
      password: frs9Config?.password || process.env.FRS9_DB_PASSWORD || 'postgres',
      ssl: frs9Config?.ssl !== undefined ? frs9Config.ssl : (process.env.FRS9_DB_SSL === 'true'),
      maxConnections: 8,
      tags: ['analytics', 'r-processing', 'calculations'],
      isActive: true,
      priority: 4
    });
  }

  // ============================================================================
  // DYNAMIC TENANT DISCOVERY
  // ============================================================================
  
  private async discoverTenantDatabases(envConfig?: any): Promise<void> {
    if (!this.autoDiscoveryEnabled) return;

    console.log('🔍 Discovering tenant databases...');

    const platformConfig = envConfig?.database?.platform;

    // Discover tenant databases based on environment pattern
    const tenantPatterns = [
      'ifrspro_tenant_iaf'
    ];

    tenantPatterns.forEach((dbName, index) => {
      const tenantSlug = this.extractTenantSlugFromDbName(dbName);
      const bankingType = dbName.includes('syariah') ? 'syariah' : 'conventional';

      this.registerDatabase({
        id: `tenant_${tenantSlug}`,
        name: `Tenant: ${tenantSlug}`,
        type: 'tenant',
        server: 'DS1',
        host: platformConfig?.host || process.env.DB_HOST || 'localhost',
        port: platformConfig?.port || parseInt(process.env.DB_PORT || '5432'),
        database: dbName,
        username: platformConfig?.user || process.env.DB_USER || 'postgres',
        password: platformConfig?.password || process.env.DB_PASSWORD || 'postgres',
        ssl: platformConfig?.ssl !== undefined ? platformConfig.ssl : (process.env.DB_SSL === 'true'),
        maxConnections: 10,
        tags: ['tenant', bankingType, tenantSlug],
        isActive: true,
        priority: 5 + index
      });
    });

    console.log(`✅ Discovered ${tenantPatterns.length} tenant databases`);
  }

  private extractTenantSlugFromDbName(dbName: string): string {
    // Extract tenant slug from database name
    const parts = dbName.split('_');
    if (parts.length >= 3 && parts[0] === 'ifrspro' && parts[1] === 'tenant') {
      return parts.slice(2).join('_');
    }
    return dbName.replace('ifrspro_tenant_', '');
  }

  // ============================================================================
  // REGISTRATION METHODS
  // ============================================================================

  public registerServer(server: ServerDefinition): void {
    this.servers.set(server.id, server);
    console.log(`📍 Registered server: ${server.name} (${server.host}:${server.port})`);
  }

  public registerDatabase(db: DatabaseDefinition): void {
    this.databases.set(db.id, db);
    console.log(`🗄️ Registered database: ${db.name} on ${db.server}`);
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  public getDatabaseById(id: string): DatabaseDefinition | null {
    return this.databases.get(id) || null;
  }

  public getDatabasesByType(type: DatabaseDefinition['type']): DatabaseDefinition[] {
    return Array.from(this.databases.values()).filter(db => db.type === type);
  }

  public getDatabasesByServer(serverId: string): DatabaseDefinition[] {
    return Array.from(this.databases.values()).filter(db => db.server === serverId);
  }

  public getDatabasesByTag(tag: string): DatabaseDefinition[] {
    return Array.from(this.databases.values()).filter(db => db.tags.includes(tag));
  }

  public getActiveDatabases(): DatabaseDefinition[] {
    return Array.from(this.databases.values()).filter(db => db.isActive);
  }

  public getTenantDatabases(): DatabaseDefinition[] {
    return this.getDatabasesByType('tenant');
  }

  public getAllDatabases(): DatabaseDefinition[] {
    return Array.from(this.databases.values());
  }

  public getAllServers(): ServerDefinition[] {
    return Array.from(this.servers.values());
  }

  // ============================================================================
  // HEALTH & STATUS METHODS
  // ============================================================================

  public updateDatabaseHealth(databaseId: string, status: DatabaseDefinition['healthStatus']): void {
    const db = this.databases.get(databaseId);
    if (db) {
      db.healthStatus = status;
      db.lastHealthCheck = new Date();
    }
  }

  public getDatabasesNeedingHealthCheck(maxAge: number = 300000): DatabaseDefinition[] {
    const cutoff = new Date(Date.now() - maxAge);
    return Array.from(this.databases.values()).filter(db => 
      !db.lastHealthCheck || db.lastHealthCheck < cutoff
    );
  }

  // ============================================================================
  // TENANT DISCOVERY METHODS
  // ============================================================================

  public async discoverNewTenantDatabases(): Promise<void> {
    // This would query the platform database to find new tenant registrations
    // and automatically register their databases
    console.log('🔍 Checking for new tenant databases...');
    // Implementation would go here
  }

  public addTenantDatabase(tenantSlug: string, bankingType: 'conventional' | 'syariah'): void {
    const dbName = `ifrspro_tenant_${tenantSlug}`;

    try {
      // Use centralized environment configuration
      const envConfig = backendEnvironmentLoader.getConfiguration();
      const platformConfig = envConfig.database.platform;

      this.registerDatabase({
        id: `tenant_${tenantSlug}`,
        name: `Tenant: ${tenantSlug}`,
        type: 'tenant',
        server: 'DS1',
        host: platformConfig.host,
        port: platformConfig.port,
        database: dbName,
        username: platformConfig.user,
        password: platformConfig.password,
        ssl: platformConfig.ssl,
        maxConnections: 10,
        tags: ['tenant', bankingType, tenantSlug],
        isActive: true,
        priority: 5
      });

      console.log(`✅ Added tenant database: ${tenantSlug} (${bankingType}) using centralized config`);
    } catch (error) {
      console.warn('⚠️ Failed to add tenant using centralized config, falling back to environment variables:', error);

      // Fallback to environment variables
      this.registerDatabase({
        id: `tenant_${tenantSlug}`,
        name: `Tenant: ${tenantSlug}`,
        type: 'tenant',
        server: 'DS1',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: 10,
        tags: ['tenant', bankingType, tenantSlug],
        isActive: true,
        priority: 5
      });

      console.log(`✅ Added tenant database: ${tenantSlug} (${bankingType}) using fallback config`);
    }
  }

  // ============================================================================
  // STATISTICS & MONITORING
  // ============================================================================

  // ============================================================================
  // ENHANCED MULTI-DATABASE CONFIGURATION METHODS
  // ============================================================================

  /**
   * Get database definitions by comprehensive criteria
   */
  public list(criteria?: {
    type?: string;
    priority?: string;
    tags?: string[];
    region?: string;
    host?: string;
    healthStatus?: string;
    isActive?: boolean;
  }): DatabaseDefinition[] {
    let results = Array.from(this.databases.values());

    if (criteria?.type) {
      results = results.filter(db => db.type === criteria.type);
    }

    if (criteria?.priority) {
      results = results.filter(db => db.priority === criteria.priority);
    }

    if (criteria?.region) {
      results = results.filter(db => db.region === criteria.region);
    }

    if (criteria?.host) {
      results = results.filter(db => db.host === criteria.host);
    }

    if (criteria?.healthStatus) {
      results = results.filter(db => db.healthStatus === criteria.healthStatus);
    }

    if (criteria?.isActive !== undefined) {
      results = results.filter(db => db.isActive === criteria.isActive);
    }

    if (criteria?.tags?.length) {
      results = results.filter(db =>
        criteria.tags!.some(tag => db.tags.includes(tag))
      );
    }

    return results;
  }

  /**
   * Get databases by host (enhanced for multi-server topology)
   */
  public getDatabasesByHost(host: string): DatabaseDefinition[] {
    return this.list({ host });
  }

  /**
   * Get databases by region (for multi-region deployments)
   */
  public getDatabasesByRegion(region: string): DatabaseDefinition[] {
    return this.list({ region });
  }

  /**
   * Get critical databases (high priority systems)
   */
  public getCriticalDatabases(): DatabaseDefinition[] {
    return this.list({ priority: 'critical' });
  }

  /**
   * Get unhealthy databases needing attention
   */
  public getUnhealthyDatabases(): DatabaseDefinition[] {
    return this.list({
      healthStatus: 'unhealthy',
      isActive: true
    });
  }

  /**
   * Get databases needing health check (based on interval)
   */
  public getDatabasesNeedingHealthCheck(maxAge: number = 300000): DatabaseDefinition[] {
    const cutoff = new Date(Date.now() - maxAge);
    return Array.from(this.databases.values()).filter(db =>
      db.isActive && (!db.lastHealthCheck || db.lastHealthCheck < cutoff)
    );
  }

  /**
   * Update database health status
   */
  public updateDatabaseHealth(
    databaseId: string,
    status: DatabaseDefinition['healthStatus'],
    details?: { responseTime?: number; error?: string }
  ): void {
    const db = this.databases.get(databaseId);
    if (db) {
      db.healthStatus = status;
      db.lastHealthCheck = new Date();

      if (details?.error) {
        logger.warn(`Database ${databaseId} health issue:`, details.error);
      }

      if (details?.responseTime) {
        logger.debug(`Database ${databaseId} response time: ${details.responseTime}ms`);
      }
    }
  }

  /**
   * Add or update database definition with validation
   */
  public upsertDatabase(databaseDef: DatabaseDefinition): void {
    this.validateDatabaseDefinition(databaseDef);

    if (this.databases.has(databaseDef.id)) {
      logger.info(`📝 Updating database definition: ${databaseDef.id}`);
      // Preserve existing connections if they exist
      const existing = this.databases.get(databaseDef)!;
      databaseDef.connectionPool = existing.connectionPool;
      databaseDef.sequelizeInstance = existing.sequelizeInstance;
    } else {
      logger.info(`📝 Registering new database: ${databaseDef.id}`);
    }

    this.databases.set(databaseDef.id, databaseDef);
  }

  /**
   * Remove database and cleanup connections
   */
  public async removeDatabase(databaseId: string): Promise<boolean> {
    const db = this.databases.get(databaseId);
    if (!db) {
      return false;
    }

    try {
      // Close connection pool if exists
      if (db.connectionPool) {
        await db.connectionPool.end();
        logger.info(`🔌 Closed connection pool for ${databaseId}`);
      }

      // Close Sequelize instance if exists
      if (db.sequelizeInstance) {
        await db.sequelizeInstance.close();
        logger.info(`🔌 Closed Sequelize instance for ${databaseId}`);
      }

      this.databases.delete(databaseId);
      logger.info(`🗑️ Removed database: ${databaseId}`);
      return true;

    } catch (error) {
      logger.error(`❌ Error removing database ${databaseId}:`, error);
      return false;
    }
  }

  /**
   * Validate database definition
   */
  private validateDatabaseDefinition(dbDef: DatabaseDefinition): void {
    const errors: string[] = [];

    // Required fields validation
    if (!dbDef.id?.trim()) errors.push('Database ID is required');
    if (!dbDef.name?.trim()) errors.push('Database name is required');
    if (!dbDef.host?.trim()) errors.push('Database host is required');
    if (!dbDef.database?.trim()) errors.push('Database name is required');
    if (!dbDef.username?.trim()) errors.push('Database username is required');
    if (!dbDef.password?.trim()) errors.push('Database password is required');

    // Port validation
    if (isNaN(dbDef.port) || dbDef.port < 1 || dbDef.port > 65535) {
      errors.push('Invalid port number (must be 1-65535)');
    }

    // Type validation
    const validTypes = ['platform', 'shared', 'tenant', 'legacy', 'analytics', 'production'];
    if (!validTypes.includes(dbDef.type)) {
      errors.push(`Invalid database type: ${dbDef.type}`);
    }

    // Priority validation
    const validPriorities = ['critical', 'high', 'normal', 'low'];
    if (!validPriorities.includes(dbDef.priority)) {
      errors.push(`Invalid priority: ${dbDef.priority}`);
    }

    // Health check interval validation
    if (isNaN(dbDef.healthCheckInterval) || dbDef.healthCheckInterval < 1000) {
      errors.push('Health check interval must be at least 1000ms');
    }

    // Max connections validation
    if (isNaN(dbDef.maxConnections) || dbDef.maxConnections < 1 || dbDef.maxConnections > 100) {
      errors.push('Max connections must be between 1 and 100');
    }

    if (errors.length > 0) {
      throw new Error(`Database validation failed for ${dbDef.id}: ${errors.join(', ')}`);
    }
  }

  /**
   * Get comprehensive registry statistics
   */
  public getRegistryStats(): any {
    const stats = {
      total_databases: this.databases.size,
      total_servers: this.servers.size,
      databases_by_type: {} as Record<string, number>,
      databases_by_server: {} as Record<string, number>,
      databases_by_status: {} as Record<string, number>,
      databases_by_priority: {} as Record<string, number>,
      databases_by_region: {} as Record<string, number>,
      active_databases: 0,
      inactive_databases: 0,
      healthy_databases: 0,
      unhealthy_databases: 0,
      databases_with_pools: 0,
      databases_with_sequelize: 0
    };

    this.databases.forEach(db => {
      // By type
      stats.databases_by_type[db.type] = (stats.databases_by_type[db.type] || 0) + 1;

      // By server
      stats.databases_by_server[db.server] = (stats.databases_by_server[db.server] || 0) + 1;

      // By health status
      const status = db.healthStatus || 'unknown';
      stats.databases_by_status[status] = (stats.databases_by_status[status] || 0) + 1;

      // By priority
      stats.databases_by_priority[db.priority] = (stats.databases_by_priority[db.priority] || 0) + 1;

      // By region
      const region = db.region || 'unknown';
      stats.databases_by_region[region] = (stats.databases_by_region[region] || 0) + 1;

      // Active/inactive
      if (db.isActive) {
        stats.active_databases++;
      } else {
        stats.inactive_databases++;
      }

      // Health status counts
      if (db.healthStatus === 'healthy') {
        stats.healthy_databases++;
      } else if (db.healthStatus === 'unhealthy') {
        stats.unhealthy_databases++;
      }

      // Connection counts
      if (db.connectionPool) {
        stats.databases_with_pools++;
      }
      if (db.sequelizeInstance) {
        stats.databases_with_sequelize++;
      }
    });

    return stats;
  }

  /**
   * Get system topology information
   */
  public getSystemTopology(): any {
    const topology = {
      servers: {} as Record<string, any>,
      regions: {} as Record<string, any>,
      databaseTypes: {} as Record<string, any>,
      connectionSummary: {
        totalPools: 0,
        totalSequelizeInstances: 0,
        databasesNeedingHealthCheck: 0
      }
    };

    // Group by servers
    this.servers.forEach(server => {
      topology.servers[server.id] = {
        name: server.name,
        host: server.host,
        port: server.port,
        type: server.type,
        region: server.region || 'local',
        isActive: server.isActive,
        databaseCount: this.getDatabasesByServer(server.id).length
      };
    });

    // Group by regions
    this.getAllDatabases().forEach(db => {
      const region = db.region || 'local';
      if (!topology.regions[region]) {
        topology.regions[region] = {
          databaseCount: 0,
          servers: new Set(),
          types: new Set()
        };
      }
      topology.regions[region].databaseCount++;
      topology.regions[region].servers.add(db.server);
      topology.regions[region].types.add(db.type);
    });

    // Convert Sets to Arrays
    Object.values(topology.regions).forEach((region: any) => {
      region.servers = Array.from(region.servers);
      region.types = Array.from(region.types);
    });

    // Group by database types
    this.getAllDatabases().forEach(db => {
      if (!topology.databaseTypes[db.type]) {
        topology.databaseTypes[db.type] = {
          count: 0,
          priorityDistribution: {} as Record<string, number>
        };
      }
      topology.databaseTypes[db.type].count++;
      topology.databaseTypes[db.type].priorityDistribution[db.priority] =
        (topology.databaseTypes[db.type].priorityDistribution[db.priority] || 0) + 1;
    });

    // Connection summary
    this.getAllDatabases().forEach(db => {
      if (db.connectionPool) topology.connectionSummary.totalPools++;
      if (db.sequelizeInstance) topology.connectionSummary.totalSequelizeInstances++;
    });
    topology.connectionSummary.databasesNeedingHealthCheck =
      this.getDatabasesNeedingHealthCheck().length;

    return topology;
  }

  /**
   * Export registry configuration
   */
  public exportConfiguration(): any {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      servers: this.getAllServers(),
      databases: this.getAllDatabases().map(db => ({
        ...db,
        // Don't export sensitive connection information
        password: db.password ? '[REDACTED]' : undefined,
        connectionPool: undefined,
        sequelizeInstance: undefined
      })),
      statistics: this.getRegistryStats(),
      topology: this.getSystemTopology()
    };
  }
}