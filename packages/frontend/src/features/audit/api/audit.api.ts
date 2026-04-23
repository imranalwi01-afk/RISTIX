'use client';

import { auditAPI } from '@/services/api';

export interface AuditLogDto {
  id: string;
  eventType: string;
  action: string;
  description?: string;
  entityType?: string;
  entityName?: string;
  userId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  oldValues?: unknown;
  newValues?: unknown;
}

export interface AuditStatsDto {
  total: number;
  byEventType: Array<{ eventType: string; count: number }>;
  byRiskLevel: Array<{ riskLevel?: string | null; count: number }>;
  topUsers: Array<{ userId?: string | null; count: number }>;
}

export interface AuditLogsQueryParams {
  page: number;
  limit: number;
  search?: string;
  requestId?: string;
  eventType?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponse {
  data?: AuditLogDto[];
  pagination?: {
    total?: number;
  };
}

export async function fetchAuditLogs(params: AuditLogsQueryParams): Promise<AuditLogsResponse> {
  return auditAPI.getLogs(params);
}

export async function fetchAuditStats(params: { startDate?: string; endDate?: string }): Promise<AuditStatsDto> {
  return auditAPI.getStats(params);
}

export async function exportAuditLogs(format: 'csv' | 'json', filters: Record<string, unknown>) {
  return auditAPI.exportLogs(format, filters);
}
