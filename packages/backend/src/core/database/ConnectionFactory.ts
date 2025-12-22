// ============================================================================
// packages/backend/src/core/database/ConnectionFactory.ts
// ============================================================================

import { Pool, PoolConfig, PoolClient } from 'pg';
import { Sequelize, Options as SequelizeOptions } from 'sequelize';
import { DatabaseRegistry, DatabaseDefinition } from './DatabaseRegistry';
import { loggerService as logger } from '../../utils/logger.service';

// Enhanced interfaces for comprehensive connection management
export interface ConnectionOptions {
  type?: 'pool' | 'sequelize';
  maxConnections?: number;
  timeout?: number;
  retries?: number;
  ssl?: boolean;
  monitoring?: boolean; // Enable connection monitoring
  healthCheck?: boolean; // Enable health check
  customPoolConfig?: Partial<PoolConfig>; // Custom pool configuration
  customSequelizeConfig?: Partial<SequelizeOptions>; // Custom Sequelize config
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  maxConnections: number;
  averageResponseTime: number;
  lastHealthCheck: Date;
  errorCount: number;
  connectionCreated: Date;
  useCount: number;
  lastUsed: Date;
}

export interface PoolConfiguration extends Partial<PoolConfig> {
  min?: number;
  max?: number;
  acquireTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
}

export class ConnectionFactory {
  private static instance: ConnectionFactory;
  private registry: DatabaseRegistry;
  private activeConnections: Map<string, Pool | Sequelize> = new Map();
  private connectionStats: Map<string, { created: Date; lastUsed: Date; useCount: number }> = new Map();
  private connectionMetrics: Map<string, ConnectionMetrics> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.registry = DatabaseRegistry.getInstance();
  }

  public static getInstance(): ConnectionFactory {
    if (!ConnectionFactory.instance) {
      ConnectionFactory.instance = new ConnectionFactory();
    }
    return ConnectionFactory.instance;
  }

  // ============================================================================
  // PRIMARY CONNECTION METHODS
  // ============================================================================

  public async createConnection(
    databaseId: string, 
    options: ConnectionOptions = {}
  ): Promise<Pool | Sequelize> {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef) {
      throw new Error(`Database definition not found: ${databaseId}`);
    }

    if (!dbDef.isActive) {
      throw new Error(`Database is inactive: ${databaseId}`);
    }

    const connectionKey = `${databaseId}_${options.type || 'pool'}`;

    // Return existing connection if available
    if (this.activeConnections.has(connectionKey)) {
      const conn = this.activeConnections.get(connectionKey)!;
      this.updateConnectionStats(connectionKey);
      return conn;
    }

    // Create new connection
    const connection = options.type === 'sequelize' 
      ? await this.createSequelizeConnection(dbDef, options)
      : await this.createPoolConnection(dbDef, options);

    // Store and track connection
    this.activeConnections.set(connectionKey, connection);
    this.connectionStats.set(connectionKey, {
      created: new Date(),
      lastUsed: new Date(),
      useCount: 1
    });

    console.log(`✅ Created ${options.type || 'pool'} connection: ${databaseId}`);
    return connection;
  }

  // ============================================================================
  // ENHANCED POOL CONNECTION CREATION
  // ============================================================================

  private async createPoolConnection(
    dbDef: DatabaseDefinition,
    options: ConnectionOptions
  ): Promise<Pool> {
    // Build comprehensive pool configuration
    const poolConfig: PoolConfig = {
      host: dbDef.host,
      port: dbDef.port,
      database: dbDef.database,
      user: dbDef.username,
      password: dbDef.password,
      max: options.maxConnections || dbDef.maxConnections,
      min: Math.ceil((options.maxConnections || dbDef.maxConnections) * 0.2),
      idleTimeoutMillis: options.timeout || dbDef.healthCheckInterval || 30000,
      connectionTimeoutMillis: 10000,
      ...options.customPoolConfig
    };

    logger.info(`🔧 Creating enhanced connection pool for ${dbDef.id} (${dbDef.host}:${dbDef.port}/${dbDef.database})`);

    const pool = new Pool(poolConfig);

    // Setup enhanced monitoring and event handlers
    this.setupPoolMonitoring(dbDef.id, pool, options.monitoring);

    // Initialize metrics
    this.initializeMetricsForDatabase(dbDef.id);

    // Start health monitoring if requested
    if (options.healthCheck !== false && dbDef.healthCheckInterval > 0) {
      this.startHealthMonitoring(dbDef.id);
    }

    // Test the connection
    try {
      const client = await pool.connect();
      await client.query('SELECT 1 as pool_connection_test');
      client.release();
      this.registry.updateDatabaseHealth(dbDef.id, 'healthy');
      logger.info(`✅ Pool connection established for ${dbDef.id}`);
    } catch (error) {
      this.registry.updateDatabaseHealth(dbDef.id, 'unhealthy', {
        error: error instanceof Error ? error.message : 'Connection test failed'
      });
      throw error;
    }

    return pool;
  }

  /**
   * Setup enhanced pool monitoring
   */
  private setupPoolMonitoring(databaseId: string, pool: Pool, enabled: boolean = true): void {
    if (!enabled) return;

    pool.on('connect', (client) => {
      logger.debug(`🔗 New connection established for ${databaseId}`);
      this.updateMetrics(databaseId, { connectionCreated: true });
    });

    pool.on('acquire', (client) => {
      logger.debug(`🔗 Connection acquired for ${databaseId}`);
      this.updateMetrics(databaseId, { connectionAcquired: true });
    });

    pool.on('remove', (client) => {
      logger.debug(`🔗 Connection removed for ${databaseId}`);
      this.updateMetrics(databaseId, { connectionRemoved: true });
    });

    pool.on('error', (err, client) => {
      logger.error(`❌ Pool error for ${databaseId}:`, err.message);
      this.updateMetrics(databaseId, { error: true });
      this.registry.updateDatabaseHealth(databaseId, 'unhealthy', { error: err.message });
    });

    pool.on('idle', () => {
      logger.debug(`💤 Pool idle for ${databaseId}`);
    });
  }

  // ============================================================================
  // SEQUELIZE CONNECTION CREATION
  // ============================================================================

  private async createSequelizeConnection(
    dbDef: DatabaseDefinition, 
    options: ConnectionOptions
  ): Promise<Sequelize> {
    const sequelizeOptions: SequelizeOptions = {
      host: dbDef.host,
      port: dbDef.port,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: options.maxConnections || dbDef.maxConnections,
        min: Math.ceil((options.maxConnections || dbDef.maxConnections) / 4),
        acquire: options.timeout || 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: options.ssl !== undefined ? options.ssl : dbDef.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    };

    const sequelize = new Sequelize(
      dbDef.database,
      dbDef.username,
      dbDef.password,
      sequelizeOptions
    );

    // Test the connection
    try {
      await sequelize.authenticate();
      this.registry.updateDatabaseHealth(dbDef.id, 'healthy');
      console.log(`✅ Sequelize connection authenticated: ${dbDef.id}`);
    } catch (error) {
      this.registry.updateDatabaseHealth(dbDef.id, 'unhealthy');
      throw error;
    }

    return sequelize;
  }

  // ============================================================================
  // ENHANCED CONNECTION METHODS
  // ============================================================================

  /**
   * Get client from pool with automatic connection management
   */
  public async getClient(databaseId: string, options: ConnectionOptions = {}): Promise<PoolClient> {
    const pool = await this.createConnection(databaseId, { ...options, type: 'pool' }) as Pool;
    const startTime = Date.now();

    try {
      const client = await pool.connect();

      // Update metrics
      this.updateMetrics(databaseId, {
        responseTime: Date.now() - startTime,
        connectionAcquired: true
      });

      return client;
    } catch (error) {
      this.updateMetrics(databaseId, {
        error: true,
        responseTime: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Execute query with automatic connection management
   */
  public async executeQuery(
    databaseId: string,
    query: string,
    params: any[] = [],
    options: ConnectionOptions = {}
  ): Promise<any> {
    const client = await this.getClient(databaseId, options);
    const startTime = Date.now();

    try {
      const result = await client.query(query, params);

      this.updateMetrics(databaseId, {
        responseTime: Date.now() - startTime,
        queryExecuted: true
      });

      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Get connection metrics for database
   */
  public getMetrics(databaseId: string): ConnectionMetrics | undefined {
    return this.connectionMetrics.get(databaseId);
  }

  /**
   * Get all connection metrics
   */
  public getAllMetrics(): Record<string, ConnectionMetrics> {
    const metrics: Record<string, ConnectionMetrics> = {};
    this.connectionMetrics.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  }

  /**
   * Test database connection
   */
  public async testConnection(databaseId: string): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      await this.executeQuery(databaseId, 'SELECT 1 as connection_test');
      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test all database connections
   */
  public async testAllConnections(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const databases = this.registry.getAllDatabases();

    const testPromises = databases.map(async db => {
      const result = await this.testConnection(db.id);
      results[db.id] = {
        ...result,
        databaseName: db.name,
        host: db.host,
        type: db.type
      };
    });

    await Promise.allSettled(testPromises);
    return results;
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  public async getPlatformConnection(): Promise<Pool> {
    return await this.createConnection('platform_admin', { type: 'pool' }) as Pool;
  }

  public async getSharedServicesConnection(): Promise<Pool> {
    return await this.createConnection('shared_services', { type: 'pool' }) as Pool;
  }

  public async getFRS9Connection(): Promise<Pool> {
    return await this.createConnection('frs9_legacy', { type: 'pool' }) as Pool;
  }

  public async getTenantConnection(tenantSlug: string): Promise<Pool> {
    return await this.createConnection(`tenant_${tenantSlug}`, { type: 'pool' }) as Pool;
  }

  public async getSequelizeConnection(databaseId: string): Promise<Sequelize> {
    return await this.createConnection(databaseId, { type: 'sequelize' }) as Sequelize;
  }

  /**
   * Get IAF Production Database Connection (RDS)
   */
  public async getIAFProductionConnection(): Promise<Pool> {
    return await this.createConnection('iaf_production', { type: 'pool' }) as Pool;
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  public async closeConnection(databaseId: string, type: 'pool' | 'sequelize' = 'pool'): Promise<void> {
    const connectionKey = `${databaseId}_${type}`;
    const connection = this.activeConnections.get(connectionKey);

    if (connection) {
      if (connection instanceof Pool) {
        await connection.end();
      } else if (connection instanceof Sequelize) {
        await connection.close();
      }

      this.activeConnections.delete(connectionKey);
      this.connectionStats.delete(connectionKey);
      console.log(`✅ Closed connection: ${connectionKey}`);
    }
  }

  public async closeAllConnections(): Promise<void> {
    console.log('🔌 Closing all factory connections...');

    const closePromises = Array.from(this.activeConnections.entries()).map(async ([key, connection]) => {
      try {
        if (connection instanceof Pool) {
          await connection.end();
        } else if (connection instanceof Sequelize) {
          await connection.close();
        }
        console.log(`✅ Closed: ${key}`);
      } catch (error) {
        console.error(`❌ Error closing ${key}:`, error);
      }
    });

    await Promise.all(closePromises);
    
    this.activeConnections.clear();
    this.connectionStats.clear();
    console.log('✅ All factory connections closed');
  }

  // ============================================================================
  // STATISTICS & MONITORING
  // ============================================================================

  // ============================================================================
  // METRICS & HEALTH MONITORING
  // ============================================================================

  /**
   * Initialize metrics for specific database
   */
  private initializeMetricsForDatabase(databaseId: string): void {
    if (!this.connectionMetrics.has(databaseId)) {
      this.connectionMetrics.set(databaseId, {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        waitingClients: 0,
        maxConnections: 0,
        averageResponseTime: 0,
        lastHealthCheck: new Date(),
        errorCount: 0,
        connectionCreated: new Date(),
        useCount: 0,
        lastUsed: new Date()
      });
    }
  }

  /**
   * Update connection metrics
   */
  private updateMetrics(databaseId: string, update: {
    connectionCreated?: boolean;
    connectionAcquired?: boolean;
    connectionRemoved?: boolean;
    queryExecuted?: boolean;
    responseTime?: number;
    error?: boolean;
  }): void {
    let metrics = this.connectionMetrics.get(databaseId);
    if (!metrics) {
      this.initializeMetricsForDatabase(databaseId);
      metrics = this.connectionMetrics.get(databaseId)!;
    }

    if (update.error) {
      metrics.errorCount++;
    }

    if (update.responseTime) {
      // Calculate rolling average
      const alpha = 0.1; // Smoothing factor
      metrics.averageResponseTime =
        metrics.averageResponseTime * (1 - alpha) + update.responseTime * alpha;
    }

    if (update.connectionAcquired) {
      metrics.useCount++;
      metrics.lastUsed = new Date();
    }

    metrics.lastHealthCheck = new Date();

    // Update pool-specific metrics if pool exists
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (dbDef?.connectionPool) {
      const pool = dbDef.connectionPool;
      metrics.totalConnections = pool.totalCount;
      metrics.idleConnections = pool.idleCount;
      metrics.waitingClients = pool.waitingCount;
      metrics.maxConnections = pool.options.max || 0;
    }
  }

  /**
   * Start health monitoring for database
   */
  private startHealthMonitoring(databaseId: string): void {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef) return;

    // Clear existing interval
    const existingInterval = this.healthCheckIntervals.get(databaseId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const interval = setInterval(async () => {
      await this.performHealthCheck(databaseId);
    }, dbDef.healthCheckInterval);

    this.healthCheckIntervals.set(databaseId, interval);

    // Perform initial health check
    this.performHealthCheck(databaseId);
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(databaseId: string): Promise<void> {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef) return;

    const startTime = Date.now();

    try {
      // Try pool connection first
      if (dbDef.connectionPool) {
        const client = await dbDef.connectionPool.connect();
        try {
          await client.query('SELECT 1 as health_check');
          this.registry.updateDatabaseHealth(databaseId, 'healthy', {
            responseTime: Date.now() - startTime
          });
        } finally {
          client.release();
        }
      } else if (dbDef.sequelizeInstance) {
        await dbDef.sequelizeInstance.authenticate();
        await dbDef.sequelizeInstance.query('SELECT 1 as health_check');
        this.registry.updateDatabaseHealth(databaseId, 'healthy', {
          responseTime: Date.now() - startTime
        });
      }
    } catch (error) {
      this.registry.updateDatabaseHealth(databaseId, 'unhealthy', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Stop health monitoring for database
   */
  public stopHealthMonitoring(databaseId: string): void {
    const interval = this.healthCheckIntervals.get(databaseId);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(databaseId);
      logger.info(`⏹️ Stopped health monitoring for ${databaseId}`);
    }
  }

  /**
   * Get comprehensive connection statistics
   */
  public getConnectionStats(): any {
    const stats = {
      total_active_connections: this.activeConnections.size,
      health_monitoring_active: this.healthCheckIntervals.size,
      connections_by_type: { pool: 0, sequelize: 0 },
      connections_by_database: {} as Record<string, number>,
      most_used_connections: [] as any[],
      metrics_summary: {
        total_databases: this.connectionMetrics.size,
        total_errors: 0,
        average_response_time: 0,
        health_check_coverage: 0
      },
      health_status: {
        healthy: 0,
        unhealthy: 0,
        unknown: 0
      }
    };

    this.connectionStats.forEach((connectionStat, key) => {
      const [databaseId, type] = key.split('_');

      // By type
      if (type === 'sequelize') {
        stats.connections_by_type.sequelize++;
      } else {
        stats.connections_by_type.pool++;
      }

      // By database
      stats.connections_by_database[databaseId] = (stats.connections_by_database[databaseId] || 0) + 1;
    });

    // Most used connections
    stats.most_used_connections = Array.from(this.connectionStats.entries())
      .sort(([,a], [,b]) => b.useCount - a.useCount)
      .slice(0, 5)
      .map(([key, stat]) => ({
        connection: key,
        useCount: stat.useCount,
        created: stat.created,
        lastUsed: stat.lastUsed
      }));

    // Metrics summary
    this.connectionMetrics.forEach((metrics, databaseId) => {
      stats.metrics_summary.total_errors += metrics.errorCount;
      stats.metrics_summary.average_responseTime += metrics.averageResponseTime;

      // Health status
      const dbDef = this.registry.getDatabaseById(databaseId);
      if (dbDef) {
        const status = dbDef.healthStatus || 'unknown';
        stats.health_status[status as keyof typeof stats.health_status]++;
      }
    });

    // Calculate averages
    if (this.connectionMetrics.size > 0) {
      stats.metrics_summary.average_responseTime /= this.connectionMetrics.size;
    }

    return stats;
  }

  private updateConnectionStats(connectionKey: string): void {
    const stats = this.connectionStats.get(connectionKey);
    if (stats) {
      stats.lastUsed = new Date();
      stats.useCount++;
    }
  }
}