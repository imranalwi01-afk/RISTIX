// ============================================================================
// PSDD ARTIFACT DOCUMENTATION  
// ============================================================================
// File Path: packages/backend/src/core/services/infrastructure/infrastructure-monitoring.service.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Service)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: PostgreSQL, Redis, Node.js metrics
// Purpose: Infrastructure monitoring and health check service
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import * as process from 'process';

@Injectable()
export class InfrastructureMonitoringService {
  private readonly logger = new Logger(InfrastructureMonitoringService.name);

  constructor() {
    this.logger.log('Infrastructure monitoring service initialized');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<any> {
    try {
      const [
        databaseStatus,
        redisStatus,
        systemMetrics
      ] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.collectSystemMetrics()
      ]);

      const overallStatus = this.determineOverallStatus([
        databaseStatus,
        redisStatus,
        systemMetrics
      ]);

      return {
        overall: overallStatus,
        timestamp: new Date(),
        services: {
          database: this.getStatusFromSettled(databaseStatus),
          redis: this.getStatusFromSettled(redisStatus),
          system: this.getStatusFromSettled(systemMetrics)
        }
      };

    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new Error(`Infrastructure health check failed: ${error.message}`);
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth(): Promise<any> {
    const startTime = Date.now();

    try {
      // ✅ ACTUAL IMPLEMENTATION: Check database health via DatabaseManager
      const { databaseManager } = await import('../../config/database');
      const health = await databaseManager.healthCheck();

      if (health.status !== 'healthy') {
        throw new Error(health.error || 'Database manager reported unhealthy status');
      }

      const responseTime = Date.now() - startTime;

      return {
        serviceName: 'database',
        status: 'healthy',
        responseTime,
        message: 'All database connections healthy',
        details: {
          connections: health.connections,
          platform: health.platform,
          tenants: Object.keys(health.tenants || {}).length
        },
        timestamp: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        serviceName: 'database',
        status: 'critical',
        responseTime,
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check Redis health
   */
  async checkRedisHealth(): Promise<any> {
    const startTime = Date.now();
    let client;

    try {
      // ✅ ACTUAL IMPLEMENTATION: Check Redis connectivity
      const { configService } = await import('../../config/ConfigurationService');
      const { createClient } = await import('redis');
      const config = configService.getAll();

      client = createClient({
        socket: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT
        },
        password: config.REDIS_PASSWORD,
        database: config.REDIS_DB
      });

      client.on('error', (err) => {
        // Suppress error logging during health check to avoid noise
      });

      await client.connect();
      await client.ping();

      const responseTime = Date.now() - startTime;

      return {
        serviceName: 'redis',
        status: 'healthy',
        responseTime,
        message: 'Redis connection successful',
        timestamp: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        serviceName: 'redis',
        status: 'critical',
        responseTime,
        message: `Redis connection failed: ${error.message}`,
        timestamp: new Date()
      };
    } finally {
      if (client && client.isOpen) {
        await client.disconnect();
      }
    }
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics(): Promise<any> {
    try {
      const memoryUsage = process.memoryUsage();
      const systemLoad = os.loadavg();
      const uptime = process.uptime();
      const cpus = os.cpus();

      // Calculate CPU usage percentage (simplified approximation)
      const cpuUsage = systemLoad[0] / cpus.length * 100;

      const metrics = {
        cpu: {
          usage: parseFloat(cpuUsage.toFixed(2)),
          loadAverage: systemLoad,
          cores: cpus.length
        },
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        uptime: Math.round(uptime),
        timestamp: new Date()
      };

      return metrics;

    } catch (error) {
      this.logger.error(`System metrics collection failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(results: PromiseSettledResult<any>[]): string {
    const statuses = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value?.status || 'unknown');

    if (statuses.some(status => status === 'critical')) {
      return 'critical';
    }

    if (statuses.some(status => status === 'warning')) {
      return 'warning';
    }

    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    }

    return 'unknown';
  }

  /**
   * Get status from settled promise
   */
  private getStatusFromSettled(result: PromiseSettledResult<any>): string {
    if (result.status === 'fulfilled') {
      return result.value?.status || 'healthy';
    }
    return 'critical';
  }

  /**
   * Health check for the service itself
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.collectSystemMetrics();
      return true;
    } catch (error) {
      this.logger.error(`Infrastructure monitoring service health check failed: ${error.message}`);
      return false;
    }
  }
}
