// packages/backend/src/utils/audit/audit.utils.ts
import { AuditLogEntry } from '../../types/audit.types';

/**
 * Audit utility functions
 */
export class AuditUtils {
  /**
   * Mask sensitive data in audit logs
   */
  static maskSensitiveData(data: any, sensitiveFields: string[] = []): any {
    if (!data || typeof data !== 'object') return data;

    const defaultSensitiveFields = [
      'password', 'ssn', 'account_number', 'card_number',
      'phone', 'email', 'national_id', 'passport',
      'secret', 'token', 'key', 'hash'
    ];

    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
    const masked = Array.isArray(data) ? [...data] : { ...data };

    const maskValue = (obj: any, key: string): void => {
      if (allSensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        obj[key] = '***MASKED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = this.maskSensitiveData(obj[key], sensitiveFields);
      }
    };

    if (Array.isArray(masked)) {
      masked.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => maskValue(item, key));
        }
      });
    } else {
      Object.keys(masked).forEach(key => maskValue(masked, key));
    }

    return masked;
  }

  /**
   * Extract changed fields between old and new values
   */
  static extractChangedFields(oldValues: any, newValues: any): string[] {
    if (!oldValues || !newValues) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues)
    ]);

    allKeys.forEach(key => {
      const oldVal = JSON.stringify(oldValues[key]);
      const newVal = JSON.stringify(newValues[key]);
      
      if (oldVal !== newVal) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  /**
   * Generate change summary
   */
  static generateChangeSummary(oldValues: any, newValues: any): string {
    const changedFields = this.extractChangedFields(oldValues, newValues);
    
    if (changedFields.length === 0) {
      return 'No changes detected';
    }

    if (changedFields.length <= 3) {
      return `Modified fields: ${changedFields.join(', ')}`;
    }

    return `Modified ${changedFields.length} fields: ${changedFields.slice(0, 3).join(', ')}...`;
  }

  /**
   * Calculate risk level based on operation
   */
  static calculateRiskLevel(
    entityType: string,
    operation: string,
    userRole: string = 'user',
    bankingType: string = 'conventional'
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highRiskEntities = ['portfolio_account', 'calculation_job', 'user', 'role', 'configuration'];
    const criticalOperations = ['DELETE', 'EXECUTE', 'APPROVE'];
    const highRiskRoles = ['admin', 'super_admin'];
    
    let riskScore = 0;

    // Entity type risk
    if (highRiskEntities.includes(entityType.toLowerCase())) {
      riskScore += 2;
    }

    // Operation risk
    if (criticalOperations.includes(operation.toUpperCase())) {
      riskScore += 3;
    }

    // User role risk
    if (highRiskRoles.includes(userRole.toLowerCase())) {
      riskScore += 1;
    }

    // Syariah banking requires higher scrutiny
    if (bankingType === 'syariah') {
      riskScore += 1;
    }

    // Determine risk level
    if (riskScore >= 6) return 'CRITICAL';
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Format audit log for export
   */
  static formatForExport(logs: AuditLogEntry[]): any[] {
    return logs.map(log => ({
      timestamp: log.timestamp,
      event_type: log.eventType,
      entity_type: log.entityType,
      entity_name: log.entityName,
      user_name: log.userName,
      user_role: log.userRole,
      ip_address: log.ipAddress,
      banking_type: log.bankingType,
      risk_level: log.riskLevel,
      compliance_relevant: log.complianceRelevant,
      regulatory_impact: log.regulatoryImpact,
      change_summary: log.changeSummary
    }));
  }

  /**
   * Validate audit log entry
   */
  static validateAuditEntry(entry: Partial<AuditLogEntry>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!entry.eventType) errors.push('Event type is required');
    if (!entry.entityType) errors.push('Entity type is required');
    if (!entry.userId) errors.push('User ID is required');
    if (!entry.tenantId) errors.push('Tenant ID is required');

    if (entry.riskLevel && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(entry.riskLevel)) {
      errors.push('Invalid risk level');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
