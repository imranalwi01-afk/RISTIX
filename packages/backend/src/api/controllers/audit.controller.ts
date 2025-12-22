// packages/backend/src/api/controllers/audit.controller.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuditService } from '../../core/services/audit/audit.service';
import { TenantContext } from '../../types/tenant.types';
import { AuditEventInput, UserActivityInput, DataAccessInput, CalculationAuditInput } from '../../types/audit.types';

// Validation schemas
const createAuditLogSchema = z.object({
  eventType: z.string().min(1).max(50),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid().optional(),
  entityName: z.string().max(255).optional(),
  oldValues: z.any().optional(),
  newValues: z.any().optional(),
  businessProcess: z.string().max(100).optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  complianceRelevant: z.boolean().optional(),
  regulatoryImpact: z.boolean().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  metadata: z.any().optional(),
  tags: z.array(z.string()).optional()
});

const userActivitySchema = z.object({
  activityType: z.string().min(1).max(50),
  pageUrl: z.string().url().optional(),
  actionPerformed: z.string().max(255).optional(),
  targetEntity: z.string().max(100).optional(),
  targetId: z.string().uuid().optional(),
  actionResult: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']).optional(),
  errorMessage: z.string().optional(),
  responseTimeMs: z.number().int().positive().optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  moduleAccessed: z.string().max(100).optional()
});

const auditQuerySchema = z.object({
  eventType: z.string().optional(),
  entityType: z.string().optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  complianceRelevant: z.boolean().optional(),
  bankingType: z.enum(['conventional', 'syariah']).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional()
});

export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Create audit log entry
   * POST /api/v1/audit/logs
   */
  public createAuditLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const userId = req.user?.id as string;
      const sessionId = (req as any).sessionId;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Validate request body
      const validationResult = createAuditLogSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
        return;
      }

      const auditInput = {
        ...validationResult.data,
        userId: req.user?.id as string,
        sessionId: (req as any).sessionId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const auditEntry = await this.auditService.createAuditLog(tenantContext, auditInput);

      res.status(201).json({
        success: true,
        data: auditEntry
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      next(error);
    }
  };

  /**
   * Query audit logs
   * GET /api/v1/audit/logs
   */
  public queryAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate query parameters
      const validationResult = auditQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.issues
        });
        return;
      }

      const filters = {
        ...validationResult.data,
        dateFrom: validationResult.data.dateFrom ? new Date(validationResult.data.dateFrom) : undefined,
        dateTo: validationResult.data.dateTo ? new Date(validationResult.data.dateTo) : undefined
      };

      const result = await this.auditService.queryAuditLogs(tenantContext, filters);

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 50) < result.total
        }
      });
    } catch (error) {
      console.error('Error querying audit logs:', error);
      next(error);
    }
  };

  /**
   * Generate compliance report
   * POST /api/v1/audit/compliance/report
   */
  public generateComplianceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { reportType, dateFrom, dateTo } = req.body;

      const report = await this.auditService.generateComplianceReport(
        tenantContext,
        reportType,
        new Date(dateFrom),
        new Date(dateTo)
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      next(error);
    }
  };

  /**
   * Export audit logs
   * GET /api/v1/audit/export
   */
  public exportAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { format = 'csv', ...queryParams } = req.query;

      const result = await this.auditService.queryAuditLogs(tenantContext, {
        ...queryParams,
        limit: 10000
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `audit-logs-${tenantContext.slug}-${timestamp}.${format}`;

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(this.convertToCSV(result.logs));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json({
          success: true,
          data: result.logs
        });
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      next(error);
    }
  };

  private convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';
    
    const headers = ['id', 'eventType', 'entityType', 'userId', 'timestamp', 'riskLevel', 'complianceRelevant'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => `"${log[header] || ''}"`);
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}
