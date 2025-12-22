// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/infrastructure/infrastructure.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for infrastructure monitoring
// ============================================================================

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export enum MetricType {
  GAUGE = 'gauge',
  COUNTER = 'counter',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
  PERCENTAGE = 'percentage'
}

export interface SystemHealthCheck {
  id: string;
  tenantId: string;
  serviceName: string;
  checkType: string;
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  metadata?: Record<string, any>;
  checkedAt: Date;
}

export interface PerformanceMetric {
  id: string;
  tenantId: string;
  metricName: string;
  metricType: MetricType;
  value: number;
  unit?: string;
  tags?: Record<string, any>;
  recordedAt: Date;
}

export interface LoadBalancerStatus {
  id: string;
  tenantId: string;
  instanceId: string;
  instanceName?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'failed';
  healthScore: number;
  currentConnections: number;
  maxConnections: number;
  cpuUsage?: number;
  memoryUsage?: number;
  lastCheck: Date;
  metadata?: Record<string, any>;
}

export interface ApiGatewayLog {
  id: string;
  tenantId: string;
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface InfrastructureStatus {
  overall: HealthStatus;
  timestamp: Date;
  services: {
    database: HealthStatus;
    redis: HealthStatus;
    system: HealthStatus;
    loadBalancer: HealthStatus;
  };
  metrics?: SystemMetrics;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    external: number;
    rss: number;
  };
  uptime: number;
  timestamp: Date;
}
