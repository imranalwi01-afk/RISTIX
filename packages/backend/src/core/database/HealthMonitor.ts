// ============================================================================
// packages/backend/src/core/database/HealthMonitor.ts
// ============================================================================

import { DatabaseRegistry, DatabaseDefinition } from './DatabaseRegistry';
import { ConnectionFactory } from './ConnectionFactory';
import { logger } from '../../utils/logger';

// Enhanced interfaces for comprehensive health monitoring
export interface HealthStatus {
  databaseId: string;
  databaseName: string;
  host: string;
  port: number;
  type: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details?: {
    totalConnections?: number;
    activeConnections?: number;
    idleConnections?: number;
    waitingClients?: number;
    maxConnections?: number;
    connectionUtilization?: number;
    averageResponseTime?: number;
    errorCount?: number;
    uptime?: number;
    server: string;
    tags: string[];
  };
}

export interface HealthCheckOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  detailed?: boolean; // Include detailed connection metrics
  skipInactive?: boolean; // Skip inactive databases
}

interface HealthCheckResult {
  databaseId: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'timeout';
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details?: {
    server: string;
    host: string;
    port: number;
    type: string;
    tags: string[];
  };
}

interface HealthSummary {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  total_databases: number;
  healthy_databases: number;
  degraded_databases: number;
  unhealthy_databases: number;
  critical_failures: string[];
  last_check: Date;
  check_duration_ms: number;
  results: HealthCheckResult[];
}

export class HealthMonitor {
  private static instance: HealthMonitor;
  private registry: DatabaseRegistry;
  private connectionFactory: ConnectionFactory;
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: Date | null = null;
  private healthHistory: HealthSummary[] = [];
  private maxHistorySize: number = 100;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  private healthStatuses: Map<string, HealthStatus[]> = new Map();
  private alertThresholds = {
    responseTimeWarning: 1000, // ms
    responseTimeCritical: 5000, // ms
    connectionUtilizationWarning: 0.8,
    connectionUtilizationCritical: 0.95,
    errorRateWarning: 0.05, // 5%
    errorRateCritical: 0.1   // 10%
  };

  private constructor() {
    this.registry = DatabaseRegistry.getInstance();
    this.connectionFactory = ConnectionFactory.getInstance();
  }

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  // ============================================================================
  // HEALTH CHECK EXECUTION
  // ============================================================================

  public async performHealthCheck(): Promise<HealthSummary> {
    const startTime = Date.now();
    console.log('🏥 Performing comprehensive database health check...');

    const databases = this.registry.getActiveDatabases();
    const results: HealthCheckResult[] = [];
    let criticalFailures: string[] = [];

    // Perform health checks in parallel with timeout
    const healthCheckPromises = databases.map(db => this.checkDatabaseHealth(db.id));
    const healthResults = await Promise.allSettled(healthCheckPromises);

    healthResults.forEach((result, index) => {
      const db = databases[index];
      
      if (result.status === 'fulfilled') {
        results.push(result.value);
        
        // Track critical failures
        if (result.value.status === 'unhealthy' && (db.priority <= 3)) {
          criticalFailures.push(`${db.name}: ${result.value.error || 'Unknown error'}`);
        }
      } else {
        const failedResult: HealthCheckResult = {
          databaseId: db.id,
          name: db.name,
          status: 'timeout',
          responseTime: 0,
          lastCheck: new Date(),
          error: 'Health check timeout or failed',
          details: {
            server: db.server,
            host: db.host,
            port: db.port,
            type: db.type,
            tags: db.tags
          }
        };
        results.push(failedResult);
        
        if (db.priority <= 3) {
          criticalFailures.push(`${db.name}: Health check timeout`);
        }
      }
    });

    // Calculate overall status
    const healthyCounts = results.reduce(
      (acc, result) => {
        acc[result.status]++;
        return acc;
      },
      { healthy: 0, degraded: 0, unhealthy: 0, timeout: 0 }
    );

    const overallStatus = this.determineOverallStatus(healthyCounts, criticalFailures.length);
    const checkDuration = Date.now() - startTime;

    const summary: HealthSummary = {
      overall_status: overallStatus,
      total_databases: results.length,
      healthy_databases: healthyCounts.healthy,
      degraded_databases: healthyCounts.degraded + healthyCounts.timeout,
      unhealthy_databases: healthyCounts.unhealthy,
      critical_failures: criticalFailures,
      last_check: new Date(),
      check_duration_ms: checkDuration,
      results
    };

    // Update registry with health status
    results.forEach(result => {
      this.registry.updateDatabaseHealth(result.databaseId, result.status);
    });

    // Store in history
    this.addToHistory(summary);
    this.lastHealthCheck = new Date();

    console.log(`🏥 Health check complete: ${overallStatus} (${checkDuration}ms)`);
    console.log(`📊 Status: ${healthyCounts.healthy} healthy, ${healthyCounts.degraded} degraded, ${healthyCounts.unhealthy} unhealthy`);

    return summary;
  }

  // ============================================================================
  // INDIVIDUAL DATABASE HEALTH CHECK
  // ============================================================================

  private async checkDatabaseHealth(databaseId: string): Promise<HealthCheckResult> {
    const db = this.registry.getDatabaseById(databaseId);
    if (!db) {
      return {
        databaseId,
        name: 'Unknown Database',
        status: 'unhealthy',
        responseTime: 0,
        lastCheck: new Date(),
        error: 'Database not found in registry'
      };
    }

    const startTime = Date.now();

    try {
      // Create a test connection
      const connection = await Promise.race([
        this.connectionFactory.createConnection(databaseId, { type: 'pool' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 10000)
        )
      ]) as any;

      // Perform health check query
      let queryResult;
      if (connection.query) {
        // Pool connection
        const client = await connection.connect();
        try {
          queryResult = await client.query('SELECT 1 as health_check, NOW() as timestamp');
        } finally {
          client.release();
        }
      } else {
        // Sequelize connection
        queryResult = await connection.query('SELECT 1 as health_check, NOW() as timestamp');
      }

      const responseTime = Date.now() - startTime;
      
      // Determine status based on response time
      let status: HealthCheckResult['status'] = 'healthy';
      if (responseTime > 5000) {
        status = 'unhealthy';
      } else if (responseTime > 1000) {
        status = 'degraded';
      }

      return {
        databaseId: db.id,
        name: db.name,
        status,
        responseTime,
        lastCheck: new Date(),
        details: {
          server: db.server,
          host: db.host,
          port: db.port,
          type: db.type,
          tags: db.tags
        }
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        databaseId: db.id,
        name: db.name,
        status: responseTime > 10000 ? 'timeout' : 'unhealthy',
        responseTime,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          server: db.server,
          host: db.host,
          port: db.port,
          type: db.type,
          tags: db.tags
        }
      };
    }
  }

  // ============================================================================
  // STATUS DETERMINATION
  // ============================================================================

  private determineOverallStatus(
    counts: Record<string, number>, 
    criticalFailures: number
  ): HealthSummary['overall_status'] {
    // If there are critical failures, system is unhealthy
    if (criticalFailures > 0) {
      return 'unhealthy';
    }

    // If more than 50% of databases are unhealthy/timeout, system is unhealthy
    const totalUnhealthy = counts.unhealthy + counts.timeout;
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalUnhealthy > total * 0.5) {
      return 'unhealthy';
    }

    // If there are any unhealthy databases or many degraded ones, system is degraded
    if (totalUnhealthy > 0 || counts.degraded > total * 0.3) {
      return 'degraded';
    }

    return 'healthy';
  }

  // ============================================================================
  // MONITORING AUTOMATION
  // ============================================================================

  public startMonitoring(intervalMs: number = 60000): void {
    if (this.isRunning) {
      console.log('⚠️ Health monitoring is already running');
      return;
    }

    console.log(`🏥 Starting health monitoring (interval: ${intervalMs}ms)`);
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Scheduled health check failed:', error);
      }
    }, intervalMs);

    this.isRunning = true;

    // Perform initial health check
    this.performHealthCheck().catch(error => {
      console.error('❌ Initial health check failed:', error);
    });
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🏥 Health monitoring stopped');
  }

  // ============================================================================
  // HISTORY & ANALYTICS
  // ============================================================================

  private addToHistory(summary: HealthSummary): void {
    this.healthHistory.unshift(summary);
    
    // Limit history size
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize);
    }
  }

  public getHealthHistory(limit?: number): HealthSummary[] {
    return limit ? this.healthHistory.slice(0, limit) : [...this.healthHistory];
  }

  public getHealthTrends(hours: number = 24): any {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentHistory = this.healthHistory.filter(h => h.last_check >= cutoff);

    if (recentHistory.length === 0) {
      return null;
    }

    const trends = {
      period_hours: hours,
      checks_performed: recentHistory.length,
      average_healthy_percentage: 0,
      average_response_time: 0,
      status_changes: 0,
      most_problematic_databases: [] as any[],
      uptime_percentage: 0
    };

    // Calculate averages
    let totalHealthyPercentage = 0;
    let totalResponseTime = 0;
    let totalHealthyTime = 0;

    recentHistory.forEach(summary => {
      const healthyPercentage = (summary.healthy_databases / summary.total_databases) * 100;
      totalHealthyPercentage += healthyPercentage;
      
      const avgResponseTime = summary.results.reduce((sum, result) => sum + result.responseTime, 0) / summary.results.length;
      totalResponseTime += avgResponseTime;

      if (summary.overall_status === 'healthy') {
        totalHealthyTime++;
      }
    });

    trends.average_healthy_percentage = totalHealthyPercentage / recentHistory.length;
    trends.average_response_time = totalResponseTime / recentHistory.length;
    trends.uptime_percentage = (totalHealthyTime / recentHistory.length) * 100;

    return trends;
  }

  // ============================================================================
  // ENHANCED HEALTH MONITORING METHODS
  // ============================================================================

  /**
   * Perform health check on a single database with enhanced options
   */
  public async checkDatabaseHealthEnhanced(
    databaseId: string,
    options: HealthCheckOptions = {}
  ): Promise<HealthStatus> {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef) {
      throw new Error(`Database definition not found: ${databaseId}`);
    }

    const startTime = Date.now();
    const healthStatus: HealthStatus = {
      databaseId,
      databaseName: dbDef.name,
      host: dbDef.host,
      port: dbDef.port,
      type: dbDef.type,
      status: 'unknown',
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        server: dbDef.server,
        tags: dbDef.tags
      }
    };

    // Skip inactive databases if requested
    if (options.skipInactive && !dbDef.isActive) {
      healthStatus.status = 'unknown';
      healthStatus.error = 'Database is inactive';
      return healthStatus;
    }

    const retryCount = options.retryCount || 3;
    const retryDelay = options.retryDelay || 1000;
    const timeout = options.timeout || 10000;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        logger.debug(`🔍 Enhanced health check attempt ${attempt}/${retryCount} for ${databaseId}`);

        // Perform enhanced health check
        await this.performEnhancedHealthCheck(dbDef, healthStatus, timeout, options.detailed);

        // If we get here, the health check was successful
        break;

      } catch (error) {
        healthStatus.error = error instanceof Error ? error.message : 'Unknown error';

        if (attempt === retryCount) {
          // All retries failed
          healthStatus.status = 'unhealthy';
          healthStatus.responseTime = Date.now() - startTime;

          logger.error(`❌ Enhanced health check failed for ${databaseId} after ${retryCount} attempts:`, healthStatus.error);

          // Update registry health status
          this.registry.updateDatabaseHealth(databaseId, 'unhealthy', {
            error: healthStatus.error,
            responseTime: healthStatus.responseTime
          });
        } else {
          logger.warn(`⚠️ Enhanced health check attempt ${attempt} failed for ${databaseId}, retrying...`);
          await this.sleep(retryDelay);
        }
      }
    }

    // Update health status history
    this.updateHealthStatusHistory(databaseId, healthStatus);

    return healthStatus;
  }

  /**
   * Start continuous health monitoring for a specific database
   */
  public startMonitoringDatabase(databaseId: string, intervalMs?: number): void {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef) {
      throw new Error(`Database definition not found: ${databaseId}`);
    }

    // Stop existing monitoring if any
    this.stopMonitoringDatabase(databaseId);

    const intervalMsToUse = intervalMs || dbDef.healthCheckInterval;

    logger.info(`🔄 Starting enhanced health monitoring for ${databaseId} (interval: ${intervalMsToUse}ms)`);

    const interval = setInterval(async () => {
      try {
        await this.checkDatabaseHealthEnhanced(databaseId, { detailed: true });
      } catch (error) {
        logger.error(`❌ Enhanced health monitoring error for ${databaseId}:`, error);
      }
    }, intervalMsToUse);

    this.monitoringIntervals.set(databaseId, interval);
  }

  /**
   * Stop health monitoring for a specific database
   */
  public stopMonitoringDatabase(databaseId: string): void {
    const interval = this.monitoringIntervals.get(databaseId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(databaseId);
      logger.info(`⏹️ Stopped enhanced health monitoring for ${databaseId}`);
    }
  }

  /**
   * Get health status history for a database
   */
  public getHealthStatusHistory(databaseId: string, limit: number = 100): HealthStatus[] {
    const history = this.healthStatuses.get(databaseId) || [];
    return history.slice(-limit);
  }

  /**
   * Get databases needing attention
   */
  public getDatabasesNeedingAttention(): {
    unhealthy: HealthStatus[];
    degraded: HealthStatus[];
    warnings: HealthStatus[];
  } {
    const allHistory: HealthStatus[] = [];

    this.healthStatuses.forEach(history => {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        allHistory.push(latest);
      }
    });

    return {
      unhealthy: allHistory.filter(h => h.status === 'unhealthy'),
      degraded: allHistory.filter(h => h.status === 'degraded'),
      warnings: allHistory.filter(h => {
        return h.status === 'healthy' && (
          h.responseTime > this.alertThresholds.responseTimeWarning ||
          (h.details?.connectionUtilization || 0) > this.alertThresholds.connectionUtilizationWarning
        );
      })
    };
  }

  /**
   * Configure alert thresholds
   */
  public setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    logger.info('⚙️ Updated enhanced health monitoring alert thresholds:', this.alertThresholds);
  }

  /**
   * Get comprehensive monitoring status
   */
  public getEnhancedMonitoringStatus(): {
    activeMonitors: string[];
    totalDatabases: number;
    monitoredDatabases: number;
    monitoringCoverage: number;
    alertThresholds: typeof this.alertThresholds;
    databasesNeedingAttention: any;
  } {
    const allDatabases = this.registry.getAllDatabases();
    const activeDatabaseIds = Array.from(this.monitoringIntervals.keys());

    return {
      activeMonitors: activeDatabaseIds,
      totalDatabases: allDatabases.length,
      monitoredDatabases: activeDatabaseIds.length,
      monitoringCoverage: allDatabases.length > 0
        ? (activeDatabaseIds.length / allDatabases.length) * 100
        : 0,
      alertThresholds: this.alertThresholds,
      databasesNeedingAttention: this.getDatabasesNeedingAttention()
    };
  }

  /**
   * Perform enhanced health check with detailed metrics
   */
  private async performEnhancedHealthCheck(
    dbDef: DatabaseDefinition,
    healthStatus: HealthStatus,
    timeout: number,
    detailed: boolean = false
  ): Promise<void> {
    const startTime = Date.now();

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Enhanced health check timeout after ${timeout}ms`)), timeout);
    });

    // Perform the actual health check
    const healthCheckPromise = this.executeEnhancedHealthCheck(dbDef, detailed);

    try {
      await Promise.race([healthCheckPromise, timeoutPromise]);

      healthStatus.status = 'healthy';
      healthStatus.responseTime = Date.now() - startTime;

      // Update registry
      this.registry.updateDatabaseHealth(dbDef.id, 'healthy', {
        responseTime: healthStatus.responseTime
      });

      logger.debug(`✅ Enhanced health check passed for ${dbDef.id} (${healthStatus.responseTime}ms)`);

    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.responseTime = Date.now() - startTime;
      healthStatus.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Execute enhanced health check with detailed metrics
   */
  private async executeEnhancedHealthCheck(dbDef: DatabaseDefinition, detailed: boolean = false): Promise<void> {
    // Try connection pool first
    if (dbDef.connectionPool) {
      const pool = dbDef.connectionPool;
      const client = await pool.connect();

      try {
        // Basic connectivity test
        await client.query('SELECT 1 as enhanced_connectivity_test');

        if (detailed) {
          // Collect detailed metrics
          await this.collectEnhancedMetrics(dbDef.id);
        }
      } finally {
        client.release();
      }
    } else if (dbDef.sequelizeInstance) {
      const sequelize = dbDef.sequelizeInstance;

      // Test authentication
      await sequelize.authenticate();

      // Test query execution
      await sequelize.query('SELECT 1 as enhanced_sequelize_health_check');
    } else {
      // Create temporary connection for health check
      const client = await this.connectionFactory.getClient(dbDef.id);

      try {
        await client.query('SELECT 1 as enhanced_temporary_connection_test');
      } finally {
        client.release();
      }
    }
  }

  /**
   * Collect enhanced metrics
   */
  private async collectEnhancedMetrics(databaseId: string): Promise<void> {
    const dbDef = this.registry.getDatabaseById(databaseId);
    if (!dbDef?.connectionPool) return;

    const pool = dbDef.connectionPool;
    const metrics = this.connectionFactory.getMetrics(databaseId);

    // Store detailed metrics in database definition
    const totalConnections = pool.totalCount;
    const idleConnections = pool.idleCount;
    const waitingClients = pool.waitingCount;
    const maxConnections = pool.options.max || 0;
    const connectionUtilization = maxConnections > 0 ? (totalConnections / maxConnections) : 0;

    // Store in database definition details
    if (dbDef) {
      dbDef.details = {
        totalConnections,
        activeConnections: totalConnections - idleConnections,
        idleConnections,
        waitingClients,
        maxConnections,
        connectionUtilization: connectionUtilization * 100, // Convert to percentage
        averageResponseTime: metrics?.averageResponseTime || 0,
        errorCount: metrics?.errorCount || 0,
        uptime: Date.now() - (metrics?.connectionCreated.getTime() || Date.now())
      };
    }
  }

  /**
   * Update health status history
   */
  private updateHealthStatusHistory(databaseId: string, healthStatus: HealthStatus): void {
    if (!this.healthStatuses.has(databaseId)) {
      this.healthStatuses.set(databaseId, []);
    }

    const history = this.healthStatuses.get(databaseId)!;
    history.push(healthStatus);

    // Keep only last 1000 entries per database
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
  }

  /**
   * Simple sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // LEGACY UTILITY METHODS (Kept for backward compatibility)
  // ============================================================================

  public isMonitoring(): boolean {
    return this.isRunning;
  }

  public getLastHealthCheckTime(): Date | null {
    return this.lastHealthCheck;
  }

  public getMonitoringStats(): any {
    return {
      is_running: this.isRunning,
      last_check: this.lastHealthCheck,
      history_size: this.healthHistory.length,
      monitored_databases: this.registry.getActiveDatabases().length,
      overall_status: this.healthHistory[0]?.overall_status || 'unknown',
      enhanced_monitors: this.monitoringIntervals.size,
      enhanced_status_history: this.healthStatuses.size
    };
  }
}