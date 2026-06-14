import type { ActivityStatistics, UserActivityLogDto } from '../api/user-activity.api';

export interface UserActivityRowViewModel {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  activityType: string;
  actionPerformed: string;
  targetEntity?: string;
  targetId?: string;
  pageUrl?: string;
  moduleAccessed?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  responseTimeMs?: number;
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceType: string;
  browserName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bankingType?: 'conventional' | 'syariah';
  complianceRelevant: boolean;
  businessProcess?: string;
  timestamp: string;
  duration?: number;
  metadata?: unknown;
}

export function toUserActivityRows(rows: UserActivityLogDto[] | undefined): UserActivityRowViewModel[] {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    userName: row.userName || row.userEmail || row.userId || 'Unknown User',
    userEmail: row.userEmail || '',
    sessionId: row.sessionId,
    activityType: row.activityType,
    actionPerformed: row.actionPerformed,
    targetEntity: row.targetEntity,
    targetId: row.targetId,
    pageUrl: row.pageUrl,
    moduleAccessed: row.moduleAccessed,
    actionResult: row.actionResult,
    errorMessage: row.errorMessage,
    responseTimeMs: row.responseTimeMs,
    ipAddress: row.ipAddress || '-',
    userAgent: row.userAgent || '-',
    location: [row.city, row.countryName].filter(Boolean).join(', ') || undefined,
    deviceType: row.deviceType || 'Unknown',
    browserName: row.browserName || 'Unknown',
    riskLevel: row.riskLevel,
    bankingType: row.bankingType === 'syariah' || row.bankingType === 'conventional' ? row.bankingType : undefined,
    complianceRelevant: Boolean(row.complianceRelevant),
    businessProcess: row.businessProcess,
    timestamp: row.activityTimestamp || row.createdAt,
    duration: row.responseTimeMs,
    metadata: row.metadata,
  }));
}

export function toUserActivityStatistics(statistics: ActivityStatistics | undefined | null): ActivityStatistics | null {
  return statistics ?? null;
}
