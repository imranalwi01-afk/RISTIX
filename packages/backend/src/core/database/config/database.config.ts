// ============================================================================
// packages/backend/src/core/database/config/database.config.ts
// ✅ ENHANCED: Integrated with IAF Environment Configuration
// ============================================================================

import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { iafEnvLoader } from '../../../config/env-loader';

// Load IAF environment configuration
iafEnvLoader.loadEnvironment();

interface DatabaseConnection {
  pool: Pool;
  isConnected: boolean;
  lastHealthCheck: Date;
  connectionCount: number;
  name: string;
}

interface TenantDatabaseInfo {
  tenantId: string;
  tenantSlug: string;
  databaseName: string;
  host: string;
  port: number;
  username: string;
  password: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
}

// ✅ NEW: JSON Configuration Support
interface DatabaseServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  type: 'primary' | 'secondary' | 'analytics' | 'backup';
  region?: string;
  isActive: boolean;
  credentials: {
    username: string;
    password: string;
  };
  ssl?: boolean;
  maxConnections?: number;
}

interface DatabaseInstanceConfig {
  id: string;
  name: string;
  serverId: string;
  database: string;
  type: 'platform' | 'shared' | 'tenant' | 'legacy' | 'analytics';
  tags: string[];
  priority: number;
  isActive: boolean;
  maxConnections?: number;
}

interface CentralizedDatabaseConfig {
  servers: DatabaseServerConfig[];
  databases: DatabaseInstanceConfig[];
  settings: {
    autoDiscovery: boolean;
    healthCheckInterval: number;
    connectionTimeout: number;
    maxHistorySize: number;
  };
}

class DatabaseConfigurationService {
  private static instance: DatabaseConfigurationService;
  private platformConnection: DatabaseConnection | null = null;
  private sharedServicesConnection: DatabaseConnection | null = null;
  private frs9Connection: DatabaseConnection | null = null;
  private tenantConnections: Map<string, DatabaseConnection> = new Map();
  private maxConnections: number = 10;
  
  // ✅ NEW: Centralized Configuration
  private centralizedConfig: CentralizedDatabaseConfig | null = null;
  private configFilePath: string;

  private constructor() {
    this.maxConnections = parseInt(process.env.MAX_TENANT_CONNECTIONS || '10');
    this.configFilePath = process.env.DATABASE_CONFIG_FILE || path.join(process.cwd(), 'config', 'database.json');
    console.log('🔧 ENHANCED Database Configuration Service initialized');
    
    // Load centralized configuration
    this.loadCentralizedConfiguration();
  }

  public static getInstance(): DatabaseConfigurationService {
    if (!DatabaseConfigurationService.instance) {
      DatabaseConfigurationService.instance = new DatabaseConfigurationService();
    }
    return DatabaseConfigurationService.instance;
  }

  // ============================================================================
  // ✅ NEW: CENTRALIZED CONFIGURATION MANAGEMENT
  // ============================================================================

  private loadCentralizedConfiguration(): void {
    try {
      // Try to load from JSON file first
      if (fs.existsSync(this.configFilePath)) {
        console.log(`🔧 Loading database configuration from: ${this.configFilePath}`);
        const configData = fs.readFileSync(this.configFilePath, 'utf8');
        this.centralizedConfig = JSON.parse(configData);
        console.log(`✅ Loaded configuration with ${this.centralizedConfig!.servers.length} servers and ${this.centralizedConfig!.databases.length} databases`);
        return;
      }

      // Fallback to environment-based configuration
      console.log('🔧 Creating configuration from environment variables...');
      this.centralizedConfig = this.createDefaultConfiguration();
      
      // Optionally save default configuration
      if (process.env.SAVE_DEFAULT_CONFIG === 'true') {
        this.saveCentralizedConfiguration();
      }

    } catch (error) {
      console.warn('⚠️ Failed to load centralized configuration, using environment fallback:', error);
      this.centralizedConfig = this.createDefaultConfiguration();
    }
  }

  private createDefaultConfiguration(): CentralizedDatabaseConfig {
    // Get IAF database configuration
    const iafDbConfig = iafEnvLoader.getIAFDatabaseConfig();
    
    return {
      servers: [
        {
          id: 'RDS_IAF',
          name: 'IAF RDS Database Server',
          host: iafDbConfig.platform.host,
          port: iafDbConfig.platform.port,
          type: 'primary',
          region: 'ap-southeast-5',
          isActive: true,
          credentials: {
            username: iafDbConfig.platform.user,
            password: iafDbConfig.platform.password
          },
          ssl: iafDbConfig.platform.ssl,
          maxConnections: 20
        },
        {
          id: 'RDS_LEGACY',
          name: 'IAF Legacy Database Server',
          host: iafDbConfig.legacy.host,
          port: iafDbConfig.legacy.port,
          type: 'analytics',
          region: 'ap-southeast-5',
          isActive: true,
          credentials: {
            username: iafDbConfig.legacy.user,
            password: iafDbConfig.legacy.password
          },
          ssl: iafDbConfig.legacy.ssl,
          maxConnections: 10
        }
      ],
      databases: [
        {
          id: 'platform_admin',
          name: 'Platform Administration',
          serverId: 'RDS_IAF',
          database: iafDbConfig.platform.database,
          type: 'platform',
          tags: ['core', 'admin'],
          priority: 1,
          isActive: true,
          maxConnections: 20
        },
        {
          id: 'shared_services',
          name: 'Shared Services',
          serverId: 'RDS_IAF',
          database: iafDbConfig.shared.database,
          type: 'shared',
          tags: ['shared', 'reference'],
          priority: 2,
          isActive: true,
          maxConnections: 15
        },
        {
          id: 'tenant_iaf',
          name: 'IAF Tenant Database',
          serverId: 'RDS_IAF',
          database: iafDbConfig.tenant.database,
          type: 'tenant',
          tags: ['tenant', 'iaf', 'conventional'],
          priority: 3,
          isActive: true,
          maxConnections: 15
        },
        {
          id: 'frs9_legacy',
          name: 'FRS9 Legacy System',
          serverId: 'RDS_IAF',
          database: iafDbConfig.legacy.database,
          type: 'legacy',
          tags: ['legacy', 'parameters'],
          priority: 4,
          isActive: true,
          maxConnections: 5
        }
      ],
      settings: {
        autoDiscovery: process.env.DATABASE_REGISTRY_AUTO_DISCOVERY === 'true',
        healthCheckInterval: parseInt(process.env.DATABASE_HEALTH_CHECK_INTERVAL || '30000'),
        connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000'),
        maxHistorySize: parseInt(process.env.DATABASE_MAX_HISTORY_SIZE || '100')
      }
    };
  }

  public saveCentralizedConfiguration(): void {
    try {
      const configDir = path.dirname(this.configFilePath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const configJson = JSON.stringify(this.centralizedConfig, null, 2);
      fs.writeFileSync(this.configFilePath, configJson);
      console.log(`✅ Database configuration saved to: ${this.configFilePath}`);
    } catch (error) {
      console.error('❌ Failed to save database configuration:', error);
    }
  }

  // ✅ NEW: Add new database server
  public addDatabaseServer(serverConfig: DatabaseServerConfig): void {
    if (!this.centralizedConfig) return;

    // Check if server already exists
    const existingIndex = this.centralizedConfig.servers.findIndex(s => s.id === serverConfig.id);
    if (existingIndex >= 0) {
      this.centralizedConfig.servers[existingIndex] = serverConfig;
      console.log(`✅ Updated database server: ${serverConfig.name}`);
    } else {
      this.centralizedConfig.servers.push(serverConfig);
      console.log(`✅ Added new database server: ${serverConfig.name}`);
    }

    // Save configuration
    this.saveCentralizedConfiguration();
  }

  // ✅ NEW: Add new database instance
  public addDatabaseInstance(dbConfig: DatabaseInstanceConfig): void {
    if (!this.centralizedConfig) return;

    // Check if database already exists
    const existingIndex = this.centralizedConfig.databases.findIndex(d => d.id === dbConfig.id);
    if (existingIndex >= 0) {
      this.centralizedConfig.databases[existingIndex] = dbConfig;
      console.log(`✅ Updated database instance: ${dbConfig.name}`);
    } else {
      this.centralizedConfig.databases.push(dbConfig);
      console.log(`✅ Added new database instance: ${dbConfig.name}`);
    }

    // Save configuration
    this.saveCentralizedConfiguration();
  }

  // ✅ NEW: Get database configuration by ID
  private getDatabaseConfig(databaseId: string): { server: DatabaseServerConfig; database: DatabaseInstanceConfig } | null {
    if (!this.centralizedConfig) return null;

    const database = this.centralizedConfig.databases.find(db => db.id === databaseId);
    if (!database) return null;

    const server = this.centralizedConfig.servers.find(s => s.id === database.serverId);
    if (!server) return null;

    return { server, database };
  }

  // ============================================================================
  // ✅ ENHANCED: CONNECTION CREATION WITH CENTRALIZED CONFIG
  // ============================================================================

  private getConnectionParams(
    dbName: string,
    host?: string,
    port?: string | number,
    user?: string,
    password?: string,
    ssl?: boolean
  ) {
    // Get IAF configuration
    const iafDbConfig = iafEnvLoader.getIAFDatabaseConfig();
    
    // Debug: Log IAF configuration
    console.log(`🔧 IAF DB Config available:`, {
      platform: { host: iafDbConfig.platform.host, user: iafDbConfig.platform.user },
      tenant: { host: iafDbConfig.tenant.host, user: iafDbConfig.tenant.user },
      legacy: { host: iafDbConfig.legacy.host, user: iafDbConfig.legacy.user },
      shared: { host: iafDbConfig.shared.host, user: iafDbConfig.shared.user }
    });
    
    // Select appropriate database configuration based on database name
    let dbConfig = iafDbConfig.platform; // default
    let configType = 'platform';

    if (dbName.toLowerCase() === 'frs9pro') {
      dbConfig = iafDbConfig.legacy;
      configType = 'legacy';
    } else if (dbName.toLowerCase().includes('shared')) {
      dbConfig = iafDbConfig.shared;
      configType = 'shared';
    } else if (dbName.toLowerCase().includes('tenant_iaf') || dbName.toLowerCase().includes('ifrspro_tenant_iaf')) {
      dbConfig = iafDbConfig.tenant;
      configType = 'tenant';
    } else if (dbName.toLowerCase().includes('platform_admin') || dbName.toLowerCase().includes('ifrspro_platform_admin')) {
      dbConfig = iafDbConfig.platform;
      configType = 'platform';
    }

    console.log(`🎯 Selected config type '${configType}' for database '${dbName}'`);
    console.log(`🎯 Selected config:`, { host: dbConfig.host, user: dbConfig.user, port: dbConfig.port });

    // Force string conversion and trim whitespace
    const rawHost = host || dbConfig.host;
    const rawPort = port || dbConfig.port;
    const rawUser = user || dbConfig.user;
    const rawPassword = password || dbConfig.password;

    // Get SSL configuration from IAF config or parameter
    const useSSL = ssl !== undefined ? ssl : (
      (dbConfig.platform && (dbConfig as any).ssl) ||
      (dbConfig.tenant && (dbConfig as any).ssl) ||
      (dbConfig.shared && (dbConfig as any).ssl) ||
      (dbConfig.legacy && (dbConfig as any).ssl) ||
      process.env.DB_SSL === 'true'
    );

    console.log(`🔧 Final values: host=${rawHost}, user=${rawUser}, port=${rawPort}, ssl=${useSSL}`);

    const params = {
      host: String(rawHost).trim(),
      port: parseInt(String(rawPort)),
      database: String(dbName).trim(),
      user: String(rawUser).trim(),
      password: String(rawPassword).trim(),
      ssl: useSSL
    };

    console.log(`🔍 Connection params for ${dbName}:`, {
      host: params.host,
      port: params.port,
      database: params.database,
      user: params.user,
      password: params.password.substring(0, 3) + '***',
      types: {
        host: typeof params.host,
        port: typeof params.port,
        database: typeof params.database,
        user: typeof params.user,
        password: typeof params.password
      }
    });

    // Validate all parameters are correct types
    if (!params.host || typeof params.host !== 'string') {
      throw new Error(`Invalid host parameter: ${typeof params.host} - "${params.host}"`);
    }
    if (!params.database || typeof params.database !== 'string') {
      throw new Error(`Invalid database parameter: ${typeof params.database} - "${params.database}"`);
    }
    if (!params.user || typeof params.user !== 'string') {
      throw new Error(`Invalid user parameter: ${typeof params.user} - "${params.user}"`);
    }
    if (!params.password || typeof params.password !== 'string') {
      throw new Error(`Invalid password parameter: ${typeof params.password} - "${params.password}"`);
    }
    if (isNaN(params.port) || params.port <= 0 || params.port > 65535) {
      throw new Error(`Invalid port parameter: ${params.port}`);
    }

    return params;
  }

  // ✅ ENHANCED: Create connection pool with centralized config support
  private createConnectionPoolFromConfig(databaseId: string, maxConnections?: number): Pool {
    const config = this.getDatabaseConfig(databaseId);
    if (config) {
      console.log(`🔗 Creating connection pool from centralized config: ${databaseId}`);
      
      const params = this.getConnectionParams(
        config.database.database,
        config.server.host,
        config.server.port,
        config.server.credentials.username,
        config.server.credentials.password
      );

      return this.createConnectionPool(
        params, 
        config.database.name, 
        maxConnections || config.database.maxConnections || config.server.maxConnections || 10
      );
    }

    // Fallback to legacy method
    console.log(`⚠️ Falling back to legacy connection creation for: ${databaseId}`);
    return this.createLegacyConnectionPool(databaseId);
  }

  private createLegacyConnectionPool(databaseId: string): Pool {
    // Get IAF database configuration
    const iafDbConfig = iafEnvLoader.getIAFDatabaseConfig();
    
    // Legacy connection creation logic with IAF configuration
    switch (databaseId) {
      case 'platform_admin':
        const platformParams = this.getConnectionParams(
          iafDbConfig.platform.database,
          iafDbConfig.platform.host,
          iafDbConfig.platform.port,
          iafDbConfig.platform.user,
          iafDbConfig.platform.password
        );
        return this.createConnectionPool(platformParams, 'Platform Admin', 10);
      
      case 'shared_services':
        const sharedParams = this.getConnectionParams(
          iafDbConfig.shared.database,
          iafDbConfig.shared.host,
          iafDbConfig.shared.port,
          iafDbConfig.shared.user,
          iafDbConfig.shared.password
        );
        return this.createConnectionPool(sharedParams, 'Shared Services', 10);
      
      case 'tenant_iaf':
        const tenantParams = this.getConnectionParams(
          iafDbConfig.tenant.database,
          iafDbConfig.tenant.host,
          iafDbConfig.tenant.port,
          iafDbConfig.tenant.user,
          iafDbConfig.tenant.password
        );
        return this.createConnectionPool(tenantParams, 'IAF Tenant', 10);
      
      case 'frs9_legacy':
        const frs9Params = this.getConnectionParams(
          iafDbConfig.legacy.database,
          iafDbConfig.legacy.host,
          iafDbConfig.legacy.port,
          iafDbConfig.legacy.user,
          iafDbConfig.legacy.password
        );
        return this.createConnectionPool(frs9Params, 'FRS9PRO', 5);
      
      default:
        throw new Error(`Unknown database ID: ${databaseId}`);
    }
  }

  private createConnectionPool(
    params: ReturnType<typeof this.getConnectionParams>,
    name: string,
    maxConnections = 10
  ): Pool {
    console.log(`🔗 Creating ${name} connection pool...`);

    try {
      // Configure SSL options for database connections
      let sslOptions: boolean | object = false;

      // Disable SSL for local database servers (192.168.0.x, localhost, 127.0.0.1)
      const isLocalDatabase = params.host.includes('192.168.0.') ||
                             params.host.includes('localhost') ||
                             params.host.includes('127.0.0.1');

      if (params.ssl && !isLocalDatabase) {
        sslOptions = {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          ca: process.env.DB_SSL_CA_PATH || undefined,
          cert: process.env.DB_SSL_CERT_PATH || undefined,
          key: process.env.DB_SSL_KEY_PATH || undefined,
        };
        console.log(`🔒 SSL enabled for remote database: ${params.host}`);
      } else if (isLocalDatabase) {
        console.log(`🔓 SSL disabled for local database: ${params.host}`);
      }

      const pool = new Pool({
        host: params.host,
        port: params.port,
        database: params.database,
        user: params.user,
        password: params.password,
        max: maxConnections,
        min: 0,
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000'),
        // Note: 'acquireTimeoutMillis' is not a valid property, removing it
        ssl: sslOptions, // Use properly configured SSL options
      });

      // Add error handlers to pool
      pool.on('error', (err) => {
        console.error(`❌ Pool error for ${name}:`, err.message);
      });

      pool.on('connect', () => {
        console.log(`🔗 New client connected to ${name}`);
      });

      console.log(`✅ ${name} connection pool created successfully`);
      return pool;

    } catch (error) {
      console.error(`❌ Failed to create ${name} connection pool:`, error);
      throw error;
    }
  }

  // ============================================================================
  // ✅ ENHANCED: CONNECTION GETTERS WITH CENTRALIZED CONFIG
  // ============================================================================

  public getPlatformConnection(): Pool {
    if (!this.platformConnection || !this.platformConnection.isConnected) {
      try {
        const pool = this.createConnectionPoolFromConfig('platform_admin');

        this.platformConnection = {
          pool,
          isConnected: true,
          lastHealthCheck: new Date(),
          connectionCount: 0,
          name: 'platform_admin'
        };

        console.log('✅ Platform Admin database connection ready');
        
      } catch (error) {
        console.error('❌ Failed to create platform connection:', error);
        throw new Error(`Platform database connection failed: ${error.message}`);
      }
    }

    return this.platformConnection.pool;
  }

  public getSharedServicesConnection(): Pool {
    if (!this.sharedServicesConnection || !this.sharedServicesConnection.isConnected) {
      try {
        const pool = this.createConnectionPoolFromConfig('shared_services');

        this.sharedServicesConnection = {
          pool,
          isConnected: true,
          lastHealthCheck: new Date(),
          connectionCount: 0,
          name: 'shared_services'
        };

        console.log('✅ Shared Services database connection ready');
        
      } catch (error) {
        console.error('❌ Failed to create shared services connection:', error);
        throw new Error(`Shared services database connection failed: ${error.message}`);
      }
    }

    return this.sharedServicesConnection.pool;
  }

  public getFRS9Connection(): Pool {
    if (!this.frs9Connection || !this.frs9Connection.isConnected) {
      try {
        console.log('🔗 Attempting FRS9 database connection...');
        
        const pool = this.createConnectionPoolFromConfig('frs9_legacy');

        this.frs9Connection = {
          pool,
          isConnected: true,
          lastHealthCheck: new Date(),
          connectionCount: 0,
          name: 'frs9_legacy'
        };

        console.log('✅ FRS9 database connection ready');
        
      } catch (error) {
        console.error('❌ FRS9 connection failed, creating fallback:', error.message);
        
        // Create fallback connection to local database
        try {
          const fallbackParams = this.getConnectionParams('postgres');
          const fallbackPool = this.createConnectionPool(fallbackParams, 'FRS9 Fallback', 2);

          this.frs9Connection = {
            pool: fallbackPool,
            isConnected: false,
            lastHealthCheck: new Date(),
            connectionCount: 0,
            name: 'frs9_fallback'
          };

          console.log('⚠️ Using FRS9 fallback connection');
        } catch (fallbackError) {
          console.error('❌ Fallback connection also failed:', fallbackError);
          throw new Error(`FRS9 database connection and fallback both failed`);
        }
      }
    }

    return this.frs9Connection.pool;
  }

  // ✅ NEW: Generic connection getter by ID
  public getConnectionById(databaseId: string): Pool {
    switch (databaseId) {
      case 'platform_admin':
        return this.getPlatformConnection();
      case 'shared_services':
        return this.getSharedServicesConnection();
      case 'frs9_legacy':
        return this.getFRS9Connection();
      case 'tenant_iaf':
        // For IAF tenant, use the tenant connection pool
        const tenantConn = this.tenantConnections.get('iaf');
        if (tenantConn) {
          return tenantConn.pool;
        }
        // Fallback to platform connection if tenant connection not available
        console.log('⚠️ Tenant IAF connection not available, using platform connection as fallback');
        return this.getPlatformConnection();
      default:
        // Check if this is a tenant database (starts with 'tenant_')
        if (databaseId.startsWith('tenant_')) {
          const tenantSlug = databaseId.replace('tenant_', '');
          const tenantConn = this.tenantConnections.get(tenantSlug);
          if (tenantConn) {
            return tenantConn.pool;
          }
          // Fallback to platform connection if tenant connection not available
          console.log(`⚠️ Tenant ${tenantSlug} connection not available, using platform connection as fallback`);
          return this.getPlatformConnection();
        }
        throw new Error(`Database connection not implemented: ${databaseId}`);
    }
  }

  public async getTenantConnection(tenantSlug: string): Promise<Pool> {
    const connKey = `tenant_${tenantSlug}`;
    
    if (this.tenantConnections.has(connKey)) {
      const connection = this.tenantConnections.get(connKey)!;
      if (connection.isConnected) {
        return connection.pool;
      }
    }

    try {
      // Try to find tenant in centralized config
      const tenantDbId = `tenant_${tenantSlug}`;
      let pool: Pool;

      try {
        pool = this.createConnectionPoolFromConfig(tenantDbId);
      } catch (configError) {
        // Fallback: Query actual database name from platform database
        console.log(`⚠️ Falling back to database lookup for tenant: ${tenantSlug}`);
        const actualDatabaseName = await this.getTenantDatabaseName(tenantSlug);
        const params = this.getConnectionParams(actualDatabaseName);
        pool = this.createConnectionPool(params, `Tenant ${tenantSlug}`, 5);
      }

      const connection: DatabaseConnection = {
        pool,
        isConnected: true,
        lastHealthCheck: new Date(),
        connectionCount: 0,
        name: connKey
      };

      this.tenantConnections.set(connKey, connection);
      console.log(`✅ Tenant database connection ready: ${tenantSlug}`);
      
      return pool;
      
    } catch (error) {
      console.error(`❌ Failed to create tenant connection: ${tenantSlug}`, error);
      
      // Fallback to platform database for tenant
      console.log(`⚠️ Using platform database as fallback for tenant: ${tenantSlug}`);
      return this.getPlatformConnection();
    }
  }

  /**
   * Get actual database name for tenant from platform database
   */
  private async getTenantDatabaseName(tenantSlug: string): Promise<string> {
    try {
      const platformPool = this.getPlatformConnection();
      const client = await platformPool.connect();
      
      const query = `
        SELECT database_name 
        FROM platform_admin.tenants 
        WHERE tenant_slug = $1 AND status = 'active'
      `;
      
      const result = await client.query(query, [tenantSlug]);
      client.release();
      
      if (result.rows.length === 0) {
        throw new Error(`Active tenant not found with slug: ${tenantSlug}`);
      }
      
      const databaseName = result.rows[0].database_name;
      console.log(`🔍 Found database name for tenant '${tenantSlug}': ${databaseName}`);
      
      return databaseName;
      
    } catch (error) {
      console.error(`❌ Failed to get database name for tenant ${tenantSlug}:`, error);
      // Fallback to pattern-based name
      return `ifrspro_tenant_${tenantSlug}`;
    }
  }

  // ============================================================================
  // ✅ ENHANCED: HEALTH CHECK & MONITORING
  // ============================================================================

  public async healthCheck(): Promise<{ status: string; connections: any[] }> {
    console.log('🏥 Performing comprehensive database health check...');
    
    const connections = [];
    let criticalFailures = 0;

    // Helper function to test connection
    const testConnection = async (connection: DatabaseConnection | null, name: string, critical = true) => {
      if (!connection) {
        connections.push({
          name,
          status: 'not_initialized',
          isConnected: false,
          critical
        });
        if (critical) criticalFailures++;
        return;
      }

      try {
        const start = Date.now();
        const client = await connection.pool.connect();
        await client.query('SELECT 1 as health_check, NOW() as timestamp');
        client.release();
        const responseTime = Date.now() - start;

        connection.isConnected = true;
        connection.lastHealthCheck = new Date();
        
        connections.push({
          name,
          status: 'healthy',
          lastCheck: connection.lastHealthCheck,
          isConnected: true,
          responseTime,
          critical
        });

        console.log(`✅ ${name}: healthy (${responseTime}ms)`);
        
      } catch (error) {
        connection.isConnected = false;
        
        connections.push({
          name,
          status: 'unhealthy',
          error: error.message,
          isConnected: false,
          lastCheck: new Date(),
          critical
        });

        console.error(`❌ ${name}: unhealthy - ${error.message}`);
        
        if (critical) criticalFailures++;
      }
    };

    // Test all connections
    await testConnection(this.platformConnection, 'platform_admin', true);
    await testConnection(this.sharedServicesConnection, 'shared_services', true);
    await testConnection(this.frs9Connection, 'frs9_legacy', false);

    // Test tenant connections
    for (const [tenantSlug, connection] of this.tenantConnections) {
      await testConnection(connection, tenantSlug, false);
    }

    const overallStatus = criticalFailures === 0 ? 'healthy' : 'degraded';
    
    console.log(`🏥 Health check complete: ${overallStatus} (${criticalFailures} critical failures)`);

    return {
      status: overallStatus,
      connections
    };
  }

  // ============================================================================
  // ✅ NEW: CONFIGURATION MANAGEMENT API
  // ============================================================================

  public getCentralizedConfiguration(): CentralizedDatabaseConfig | null {
    return this.centralizedConfig;
  }

  public getAvailableServers(): DatabaseServerConfig[] {
    return this.centralizedConfig?.servers || [];
  }

  public getAvailableDatabases(): DatabaseInstanceConfig[] {
    return this.centralizedConfig?.databases || [];
  }

  public getDatabasesByServer(serverId: string): DatabaseInstanceConfig[] {
    return this.centralizedConfig?.databases.filter(db => db.serverId === serverId) || [];
  }

  public getDatabasesByType(type: DatabaseInstanceConfig['type']): DatabaseInstanceConfig[] {
    return this.centralizedConfig?.databases.filter(db => db.type === type) || [];
  }

  // ============================================================================
  // ✅ GRACEFUL SHUTDOWN & STATISTICS (UNCHANGED)
  // ============================================================================

  public async closeAllConnections(): Promise<void> {
    console.log('🔌 Gracefully closing all database connections...');

    const closeConnection = async (connection: DatabaseConnection | null, name: string) => {
      if (connection?.pool) {
        try {
          await connection.pool.end();
          connection.isConnected = false;
          console.log(`✅ ${name} connection closed`);
        } catch (error) {
          console.error(`❌ Error closing ${name}:`, error.message);
        }
      }
    };

    await Promise.all([
      closeConnection(this.platformConnection, 'Platform Admin'),
      closeConnection(this.sharedServicesConnection, 'Shared Services'),
      closeConnection(this.frs9Connection, 'FRS9'),
      ...Array.from(this.tenantConnections.entries()).map(([slug, conn]) => 
        closeConnection(conn, `Tenant ${slug}`)
      )
    ]);

    this.tenantConnections.clear();
    this.platformConnection = null;
    this.sharedServicesConnection = null;
    this.frs9Connection = null;

    console.log('✅ All database connections closed successfully');
  }

  public getConnectionStats(): any {
    return {
      platform: this.platformConnection ? {
        isConnected: this.platformConnection.isConnected,
        lastHealthCheck: this.platformConnection.lastHealthCheck,
        name: this.platformConnection.name
      } : null,
      sharedServices: this.sharedServicesConnection ? {
        isConnected: this.sharedServicesConnection.isConnected,
        lastHealthCheck: this.sharedServicesConnection.lastHealthCheck,
        name: this.sharedServicesConnection.name
      } : null,
      frs9: this.frs9Connection ? {
        isConnected: this.frs9Connection.isConnected,
        lastHealthCheck: this.frs9Connection.lastHealthCheck,
        name: this.frs9Connection.name
      } : null,
      tenants: {
        count: this.tenantConnections.size,
        maxConnections: this.maxConnections,
        connections: Array.from(this.tenantConnections.keys())
      },
      configuration: {
        servers: this.centralizedConfig?.servers.length || 0,
        databases: this.centralizedConfig?.databases.length || 0,
        configFile: this.configFilePath,
        hasConfig: !!this.centralizedConfig
      }
    };
  }

  public async getTenantDatabaseInfo(tenantSlug: string): Promise<TenantDatabaseInfo> {
    const iafDbConfig = iafEnvLoader.getIAFDatabaseConfig();
    const tenantConfig = iafEnvLoader.getIAFTenantConfig();
    
    // For IAF, return specific configuration
    if (tenantSlug === 'iaf' || tenantSlug === tenantConfig.tenantId) {
      return {
        tenantId: tenantConfig.tenantId,
        tenantSlug: tenantConfig.tenantId,
        databaseName: iafDbConfig.tenant.database,
        host: iafDbConfig.tenant.host,
        port: iafDbConfig.tenant.port,
        username: iafDbConfig.tenant.user,
        password: iafDbConfig.tenant.password,
        bankingType: tenantConfig.bankingType as 'conventional' | 'syariah' | 'dual'
      };
    }
    
    // For other tenants (should not occur in IAF deployment)
    return {
      tenantId: `tenant_${tenantSlug}`,
      tenantSlug,
      databaseName: `ifrspro_tenant_${tenantSlug}`,
      host: iafDbConfig.platform.host,
      port: iafDbConfig.platform.port,
      username: iafDbConfig.platform.user,
      password: iafDbConfig.platform.password,
      bankingType: 'conventional'
    };
  }
}

// ============================================================================
// ✅ CONNECTION FACTORY INTERFACE FOR BUSINESS SERVICES
// ============================================================================

interface ConnectionOptions {
  raw?: boolean;
  sequelize?: boolean;
  monitoring?: boolean;
}

class ConnectionFactory {
  private databaseService: DatabaseConfigurationService;

  constructor(databaseService: DatabaseConfigurationService) {
    this.databaseService = databaseService;
  }

  getConnection(databaseId: string, options: ConnectionOptions = {}): Pool {
    console.log(`🔗 [CONNECTION-FACTORY] Getting connection for: ${databaseId}`, { options });
    
    // For raw connections (which is what BusinessSettingsService expects)
    if (options.raw !== false) {
      return this.databaseService.getConnectionById(databaseId);
    }
    
    return this.databaseService.getConnectionById(databaseId);
  }
}

// ✅ EXPORT SINGLETON
export const databaseConfig = DatabaseConfigurationService.getInstance();

// ✅ EXPORT CONNECTION FACTORY
export const connectionFactory = new ConnectionFactory(databaseConfig);

// ✅ EXPORT TYPES
export type { 
  TenantDatabaseInfo, 
  DatabaseConnection, 
  DatabaseServerConfig, 
  DatabaseInstanceConfig, 
  CentralizedDatabaseConfig 
};

// ✅ DEFAULT EXPORT
export default databaseConfig;