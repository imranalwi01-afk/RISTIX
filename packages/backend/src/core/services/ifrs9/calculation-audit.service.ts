// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/backend/src/core/services/ifrs9/calculation-audit.service.ts
// Generated: 2025-07-22T15:30:00Z
// Phase: D3H2 - Basic IFRS 9 Services Implementation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Sequelize, Winston, Joi
// Purpose: IFRS 9 calculation audit trail and compliance tracking
// ============================================================================

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Logger } from 'winston';
import * as Joi from 'joi';
import { CalculationAuditLog, UserSession } from '../../models/ifrs9';
import { getTenantModels } from '../../database/tenant-context';
import { ConfigurationService } from '../configuration/configuration.service';

export interface AuditLogInput {
  tenantId: string;
  userId: string;
  sessionId?: string;
  eventType: string;
  eventCategory: 'calculation' | 'configuration' | 'data_upload' | 'system' | 'user_action';
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  businessDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditTrailQuery {
  tenantId: string;
  entityType?: string;
  entityId?: string;
  eventType?: string;
  eventCategory?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditTrailResponse {
  auditLogs: AuditLogEntry[];
  totalCount: number;
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    eventTypes: { [key: string]: number };
    eventCategories: { [key: string]: number };
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  sessionId?: string;
  eventType: string;
  eventCategory: string;
  entityType: string;
  entityId: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  businessDate?: Date;
}

export interface ComplianceReport {
  reportId: string;
  tenantId: string;
  reportType: 'audit_trail' | 'data_lineage' | 'calculation_history' | 'user_activity';
  periodStart: Date;
  periodEnd: Date;
  generatedDate: Date;
  generatedBy: string;
  summary: any;
  details: any[];
  exportFormat?: 'pdf' | 'excel' | 'csv';
}

const auditLogInputSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  sessionId: Joi.string().uuid().optional(),
  eventType: Joi.string().required(),
  eventCategory: Joi.string().valid('calculation', 'configuration', 'data_upload', 'system', 'user_action').required(),
  entityType: Joi.string().required(),
  entityId: Joi.string().required(),
  description: Joi.string().required(),
  oldValues: Joi.any().optional(),
  newValues: Joi.any().optional(),
  metadata: Joi.any().optional(),
  businessDate: Joi.date().optional(),
  ipAddress: Joi.string().ip().optional(),
  userAgent: Joi.string().optional()
});

const auditTrailQuerySchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
  entityType: Joi.string().optional(),
  entityId: Joi.string().optional(),
  eventType: Joi.string().optional(),
  eventCategory: Joi.string().optional(),
  userId: Joi.string().uuid().optional(),
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  offset: Joi.number().integer().min(0).default(0)
});

@Injectable()
export class CalculationAuditService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(CalculationAuditLog) private auditLogModel: typeof CalculationAuditLog,
    @InjectModel(UserSession) private userSessionModel: typeof UserSession,
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'CalculationAuditService' });
  }

  /**
   * Log calculation event for audit trail
   */
  async logCalculationEvent(input: AuditLogInput): Promise<void> {
    // Validate input
    const { error, value } = auditLogInputSchema.validate(input);
    if (error) {
      this.logger.error('Invalid audit log input', { error: error.message });
      return; // Don't throw error for audit logging
    }

    const validatedInput = value as AuditLogInput;

    try {
      // Get tenant models
      const models = await getTenantModels(validatedInput.tenantId);

      // Extract changes if old and new values provided
      const changes = this.extractChanges(
        validatedInput.oldValues,
        validatedInput.newValues
      );

      // Create audit log entry
      await models.CalculationAuditLog.create({
        tenantId: validatedInput.tenantId,
        userId: validatedInput.userId,
        sessionId: validatedInput.sessionId,
        correlationId: this.generateCorrelationId(),
        eventType: validatedInput.eventType,
        eventCategory: validatedInput.eventCategory,
        entityType: validatedInput.entityType,
        entityId: validatedInput.entityId,
        description: validatedInput.description,
        oldValues: validatedInput.oldValues,
        newValues: validatedInput.newValues,
        changedFields: changes.map(c => c.field),
        metadata: {
          changes,
          ...validatedInput.metadata
        },
        ipAddress: validatedInput.ipAddress,
        userAgent: validatedInput.userAgent,
        businessDate: validatedInput.businessDate,
        timestamp: new Date()
      });

      this.logger.info('Audit event logged', {
        tenantId: validatedInput.tenantId,
        eventType: validatedInput.eventType,
        entityType: validatedInput.entityType,
        entityId: validatedInput.entityId
      });

    } catch (error) {
      this.logger.error('Failed to log audit event', {
        tenantId: validatedInput.tenantId,
        eventType: validatedInput.eventType,
        error: error.message
      });
      // Don't throw error for audit logging failures
    }
  }

  /**
   * Query audit trail with filtering and pagination
   */
  async queryAuditTrail(query: AuditTrailQuery): Promise<AuditTrailResponse> {
    // Validate query
    const { error, value } = auditTrailQuerySchema.validate(query);
    if (error) {
      throw new Error(`Invalid audit trail query: ${error.message}`);
    }

    const validatedQuery = value as AuditTrailQuery;

    this.logger.info('Querying audit trail', {
      tenantId: validatedQuery.tenantId,
      entityType: validatedQuery.entityType,
      eventType: validatedQuery.eventType
    });

    try {
      // Get tenant models
      const models = await getTenantModels(validatedQuery.tenantId);

      // Build where clause
      const whereClause: any = {
        tenantId: validatedQuery.tenantId
      };

      if (validatedQuery.entityType) {
        whereClause.entityType = validatedQuery.entityType;
      }

      if (validatedQuery.entityId) {
        whereClause.entityId = validatedQuery.entityId;
      }

      if (validatedQuery.eventType) {
        whereClause.eventType = validatedQuery.eventType;
      }

      if (validatedQuery.eventCategory) {
        whereClause.eventCategory = validatedQuery.eventCategory;
      }

      if (validatedQuery.userId) {
        whereClause.userId = validatedQuery.userId;
      }

      if (validatedQuery.fromDate || validatedQuery.toDate) {
        whereClause.timestamp = {};
        if (validatedQuery.fromDate) {
          whereClause.timestamp[models.Sequelize.Op.gte] = validatedQuery.fromDate;
        }
        if (validatedQuery.toDate) {
          whereClause.timestamp[models.Sequelize.Op.lte] = validatedQuery.toDate;
        }
      }

      // Get audit logs with user information
      const auditLogs = await models.CalculationAuditLog.findAll({
        where: whereClause,
        include: [{
          model: models.User,
          as: 'User',
          attributes: ['id', 'username', 'fullName', 'email']
        }],
        order: [['timestamp', 'DESC']],
        limit: validatedQuery.limit,
        offset: validatedQuery.offset
      });

      // Get total count
      const totalCount = await models.CalculationAuditLog.count({
        where: whereClause
      });

      // Generate summary statistics
      const summary = await this.generateAuditSummary(
        models,
        whereClause
      );

      // Transform audit logs
      const auditLogEntries: AuditLogEntry[] = auditLogs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        userId: log.userId,
        userName: log.User ? `${log.User.fullName} (${log.User.username})` : 'Unknown',
        sessionId: log.sessionId,
        eventType: log.eventType,
        eventCategory: log.eventCategory,
        entityType: log.entityType,
        entityId: log.entityId,
        description: log.description,
        changes: log.metadata?.changes || [],
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        businessDate: log.businessDate
      }));

      return {
        auditLogs: auditLogEntries,
        totalCount,
        summary
      };

    } catch (error) {
      this.logger.error('Audit trail query failed', {
        tenantId: validatedQuery.tenantId,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Audit trail query failed: ${error.message}`);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    tenantId: string,
    reportType: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    this.logger.info('Generating compliance report', {
      tenantId,
      reportType,
      periodStart,
      periodEnd
    });

    try {
      switch (reportType) {
        case 'audit_trail':
          return await this.generateAuditTrailReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'data_lineage':
          return await this.generateDataLineageReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'calculation_history':
          return await this.generateCalculationHistoryReport(tenantId, periodStart, periodEnd, generatedBy);
        case 'user_activity':
          return await this.generateUserActivityReport(tenantId, periodStart, periodEnd, generatedBy);
        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }

    } catch (error) {
      this.logger.error('Compliance report generation failed', {
        tenantId,
        reportType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(input: {
    tenantId?: string;
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventCategory: string;
    description: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const auditInput: AuditLogInput = {
        tenantId: input.tenantId || 'system',
        userId: input.userId || 'system',
        sessionId: input.sessionId,
        eventType: input.eventType,
        eventCategory: input.eventCategory,
        entityType: 'security',
        entityId: 'system',
        description: input.description,
        metadata: {
          severity: input.severity || 'medium',
          ...input.metadata
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent
      };

      await this.logCalculationEvent(auditInput);

      // Log to security log as well
      this.logger.warn('Security event', {
        eventType: input.eventType,
        severity: input.severity,
        description: input.description,
        metadata: input.metadata
      });

    } catch (error) {
      this.logger.error('Failed to log security event', {
        eventType: input.eventType,
        error: error.message
      });
    }
  }

  // Private helper methods
  private extractChanges(oldValues: any, newValues: any): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (!oldValues || !newValues) {
      return changes;
    }

    // Compare objects and extract changed fields
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue
        });
      }
    }

    return changes;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateAuditSummary(
    models: any,
    whereClause: any
  ): Promise<any> {
    try {
      // Count total events
      const totalEvents = await models.CalculationAuditLog.count({
        where: whereClause
      });

      // Count unique users
      const uniqueUsers = await models.CalculationAuditLog.count({
        where: whereClause,
        distinct: true,
        col: 'userId'
      });

      // Count by event types
      const eventTypes = await models.CalculationAuditLog.findAll({
        where: whereClause,
        attributes: [
          'eventType',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        group: ['eventType']
      });

      // Count by event categories
      const eventCategories = await models.CalculationAuditLog.findAll({
        where: whereClause,
        attributes: [
          'eventCategory',
          [models.Sequelize.fn('COUNT', models.Sequelize.col('id')), 'count']
        ],
        group: ['eventCategory']
      });

      return {
        totalEvents,
        uniqueUsers,
        eventTypes: eventTypes.reduce((acc: any, item: any) => {
          acc[item.eventType] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        eventCategories: eventCategories.reduce((acc: any, item: any) => {
          acc[item.eventCategory] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      };

    } catch (error) {
      this.logger.error('Failed to generate audit summary', {
        error: error.message
      });
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        eventTypes: {},
        eventCategories: {}
      };
    }
  }

  // Report generation methods (simplified implementations)
  private async generateAuditTrailReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    const auditTrail = await this.queryAuditTrail({
      tenantId,
      fromDate: periodStart,
      toDate: periodEnd,
      limit: 10000 // Large limit for report
    });

    return {
      reportId: `audit_trail_${Date.now()}`,
      tenantId,
      reportType: 'audit_trail',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: auditTrail.summary,
      details: auditTrail.auditLogs
    };
  }

  private async generateDataLineageReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified data lineage report
    return {
      reportId: `data_lineage_${Date.now()}`,
      tenantId,
      reportType: 'data_lineage',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { dataFlows: 0, transformations: 0 },
      details: []
    };
  }

  private async generateCalculationHistoryReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified calculation history report
    return {
      reportId: `calc_history_${Date.now()}`,
      tenantId,
      reportType: 'calculation_history',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { calculations: 0, recalculations: 0 },
      details: []
    };
  }

  private async generateUserActivityReport(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<ComplianceReport> {
    // Simplified user activity report
    return {
      reportId: `user_activity_${Date.now()}`,
      tenantId,
      reportType: 'user_activity',
      periodStart,
      periodEnd,
      generatedDate: new Date(),
      generatedBy,
      summary: { activeUsers: 0, totalSessions: 0 },
      details: []
    };
  }
}
