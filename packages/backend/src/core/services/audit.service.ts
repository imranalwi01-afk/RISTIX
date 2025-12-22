// packages/backend/src/core/services/audit.service.ts
// ============================================================================
// 🔧 AUDIT SERVICE - FALLBACK IMPLEMENTATION
// ============================================================================
// ✅ PATTERN: Simple audit logging fallback
// ✅ PURPOSE: Prevent module loading failures
// ============================================================================

export class AuditService {
  
  constructor() {
    console.log('✅ [AUDIT-001] AuditService initialized - Fallback implementation');
  }

  async log(auditData: any): Promise<void> {
    // Simple console logging for now
    console.log('📋 [AUDIT-002] Audit Log:', {
      timestamp: new Date().toISOString(),
      ...auditData
    });
  }

  async logActivity(userId: string, action: string, entityType: string, entityId?: string, data?: any): Promise<void> {
    console.log('📋 [AUDIT-003] Activity Log:', {
      timestamp: new Date().toISOString(),
      userId,
      action,
      entityType,
      entityId,
      data
    });
  }

  async logSimpleAudit(action: string, entityType: string, entityId: string, userId: string, data?: any): Promise<void> {
    console.log('📋 [AUDIT-004] Simple Audit Log:', {
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      userId,
      data
    });
  }
}

export default AuditService;