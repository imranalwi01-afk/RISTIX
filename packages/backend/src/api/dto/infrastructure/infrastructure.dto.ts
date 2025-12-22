// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/api/dto/infrastructure/infrastructure.dto.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Infrastructure DTOs)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Class Validator, Class Transformer
// Purpose: Data Transfer Objects for infrastructure monitoring and health checks
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { HealthStatus, MetricType } from '@shared/types/infrastructure';

export class HealthCheckDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  serviceName: string;

  @ApiProperty({ 
    description: 'Health status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  status: HealthStatus;

  @ApiProperty({ description: 'Response time in milliseconds' })
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: 'Health check message', required: false })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'Check timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}

export class SystemMetricsDto {
  @ApiProperty({ description: 'CPU metrics' })
  @ValidateNested()
  @Type(() => CpuMetricsDto)
  cpu: CpuMetricsDto;

  @ApiProperty({ description: 'Memory metrics' })
  @ValidateNested()
  @Type(() => MemoryMetricsDto)
  memory: MemoryMetricsDto;

  @ApiProperty({ description: 'System uptime in seconds' })
  @IsNumber()
  uptime: number;

  @ApiProperty({ description: 'Metrics timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;
}

export class CpuMetricsDto {
  @ApiProperty({ description: 'CPU usage percentage' })
  @IsNumber()
  usage: number;

  @ApiProperty({ description: 'Load average array' })
  @IsArray()
  @IsNumber({}, { each: true })
  loadAverage: number[];
}

export class MemoryMetricsDto {
  @ApiProperty({ description: 'Used memory in MB' })
  @IsNumber()
  used: number;

  @ApiProperty({ description: 'Total memory in MB' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'External memory in MB' })
  @IsNumber()
  external: number;

  @ApiProperty({ description: 'RSS memory in MB' })
  @IsNumber()
  rss: number;
}

export class LoadBalancerStatusDto {
  @ApiProperty({ description: 'Load balancer instance ID' })
  @IsString()
  instanceId: string;

  @ApiProperty({ description: 'Load balancer instance name' })
  @IsString()
  instanceName: string;

  @ApiProperty({ 
    description: 'Instance status',
    enum: ['active', 'inactive', 'maintenance', 'failed']
  })
  @IsEnum(['active', 'inactive', 'maintenance', 'failed'])
  status: string;

  @ApiProperty({ description: 'Health score (0-100)' })
  @IsNumber()
  healthScore: number;

  @ApiProperty({ description: 'Current connection count' })
  @IsNumber()
  currentConnections: number;

  @ApiProperty({ description: 'Maximum connection limit' })
  @IsNumber()
  maxConnections: number;

  @ApiProperty({ description: 'CPU usage percentage' })
  @IsNumber()
  cpuUsage: number;

  @ApiProperty({ description: 'Memory usage percentage' })
  @IsNumber()
  memoryUsage: number;

  @ApiProperty({ description: 'Last check timestamp' })
  @Transform(({ value }) => new Date(value))
  lastCheck: Date;
}

export class PerformanceMetricDto {
  @ApiProperty({ description: 'Metric ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Metric name' })
  @IsString()
  metricName: string;

  @ApiProperty({ 
    description: 'Metric type',
    enum: ['gauge', 'counter', 'histogram', 'summary', 'percentage']
  })
  @IsEnum(['gauge', 'counter', 'histogram', 'summary', 'percentage'])
  metricType: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Metric unit', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Metric tags', required: false })
  @IsOptional()
  tags?: Record<string, any>;

  @ApiProperty({ description: 'Recorded timestamp' })
  @Transform(({ value }) => new Date(value))
  recordedAt: Date;
}

export class InfrastructureStatusDto {
  @ApiProperty({ 
    description: 'Overall system status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  overall: HealthStatus;

  @ApiProperty({ description: 'Status check timestamp' })
  @Transform(({ value }) => new Date(value))
  timestamp: Date;

  @ApiProperty({ description: 'Individual service statuses' })
  @ValidateNested()
  @Type(() => ServiceStatusDto)
  services: ServiceStatusDto;

  @ApiProperty({ description: 'Current system metrics', required: false })
  @ValidateNested()
  @Type(() => SystemMetricsDto)
  @IsOptional()
  metrics?: SystemMetricsDto;
}

export class ServiceStatusDto {
  @ApiProperty({ 
    description: 'Database status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  database: HealthStatus;

  @ApiProperty({ 
    description: 'Redis status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  redis: HealthStatus;

  @ApiProperty({ 
    description: 'System status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  system: HealthStatus;

  @ApiProperty({ 
    description: 'Load balancer status',
    enum: ['healthy', 'warning', 'critical', 'unknown']
  })
  @IsEnum(['healthy', 'warning', 'critical', 'unknown'])
  loadBalancer: HealthStatus;
}
