import type { AuditLogDto, AuditStatsDto } from '../api/audit.api';

export type AuditLogViewModel = AuditLogDto;
export type AuditStatsViewModel = AuditStatsDto;

export function toAuditLogViewModels(logs: AuditLogDto[] | undefined): AuditLogViewModel[] {
  return Array.isArray(logs) ? logs : [];
}

export function toAuditStatsViewModel(stats: AuditStatsDto | undefined | null): AuditStatsViewModel | null {
  return stats ?? null;
}

export function getAuditRequestId(log: AuditLogViewModel): string | null {
  if (typeof log.metadata?.requestId === 'string') return log.metadata.requestId;
  if (typeof log.metadata?.request_id === 'string') return log.metadata.request_id;
  return null;
}
