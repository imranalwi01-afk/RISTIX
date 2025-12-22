// packages/backend/src/core/services/logging/winston.service.ts
import winston from 'winston';
import path from 'path';

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp?: Date;
  metadata?: any;
  userId?: string;
  tenantId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class WinstonService {
  private logger: winston.Logger;
  private static instance: WinstonService;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for production
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error'
        }),
        
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log')
        })
      ]
    });

    // Create logs directory if it doesn't exist
    this.ensureLogDirectory();
  }

  public static getInstance(): WinstonService {
    if (!WinstonService.instance) {
      WinstonService.instance = new WinstonService();
    }
    return WinstonService.instance;
  }

  private ensureLogDirectory(): void {
    const logsDir = path.join(process.cwd(), 'logs');
    try {
      const fs = require('fs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  public log(entry: LogEntry): void {
    const logData = {
      ...entry,
      timestamp: entry.timestamp || new Date(),
      service: 'ifrs9-backend',
      environment: process.env.NODE_ENV || 'development'
    };

    this.logger.log(entry.level, entry.message, logData);
  }

  public info(message: string, metadata?: any): void {
    this.log({
      level: 'info',
      message,
      metadata
    });
  }

  public warn(message: string, metadata?: any): void {
    this.log({
      level: 'warn',
      message,
      metadata
    });
  }

  public error(message: string, error?: Error | any, metadata?: any): void {
    this.log({
      level: 'error',
      message,
      metadata: {
        ...metadata,
        error: error?.message,
        stack: error?.stack
      }
    });
  }

  public debug(message: string, metadata?: any): void {
    this.log({
      level: 'debug',
      message,
      metadata
    });
  }

  public logRequest(requestId: string, method: string, url: string, userId?: string, tenantId?: string, ipAddress?: string): void {
    this.info('HTTP Request', {
      requestId,
      method,
      url,
      userId,
      tenantId,
      ipAddress,
      type: 'HTTP_REQUEST'
    });
  }

  public logResponse(requestId: string, statusCode: number, responseTime: number): void {
    this.info('HTTP Response', {
      requestId,
      statusCode,
      responseTime,
      type: 'HTTP_RESPONSE'
    });
  }

  public logDatabaseQuery(query: string, parameters?: any[], executionTime?: number, tenantId?: string): void {
    this.debug('Database Query', {
      query,
      parameters,
      executionTime,
      tenantId,
      type: 'DATABASE_QUERY'
    });
  }

  public logSecurityEvent(event: string, userId?: string, tenantId?: string, ipAddress?: string, details?: any): void {
    this.warn('Security Event', {
      event,
      userId,
      tenantId,
      ipAddress,
      details,
      type: 'SECURITY_EVENT'
    });
  }

  public logBusinessEvent(event: string, entityType: string, entityId: string, action: string, userId?: string, tenantId?: string, details?: any): void {
    this.info('Business Event', {
      event,
      entityType,
      entityId,
      action,
      userId,
      tenantId,
      details,
      type: 'BUSINESS_EVENT'
    });
  }

  public logAuditTrail(action: string, entityType: string, entityId: string, oldValues?: any, newValues?: any, userId?: string, tenantId?: string): void {
    this.info('Audit Trail', {
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      userId,
      tenantId,
      type: 'AUDIT_TRAIL'
    });
  }

  // Multi-tenant logging helpers
  public logTenantOperation(operation: string, tenantId: string, details?: any, userId?: string): void {
    this.info('Tenant Operation', {
      operation,
      tenantId,
      details,
      userId,
      type: 'TENANT_OPERATION'
    });
  }

  public logConfigurationChange(key: string, oldValue: any, newValue: any, userId?: string, tenantId?: string): void {
    this.info('Configuration Change', {
      key,
      oldValue,
      newValue,
      userId,
      tenantId,
      type: 'CONFIGURATION_CHANGE'
    });
  }

  public logWorkflowEvent(workflowType: string, workflowId: string, status: string, assignee?: string, tenantId?: string, details?: any): void {
    this.info('Workflow Event', {
      workflowType,
      workflowId,
      status,
      assignee,
      tenantId,
      details,
      type: 'WORKFLOW_EVENT'
    });
  }

  // Banking-specific logging
  public logBankingOperation(operation: string, accountId?: string, amount?: number, currency?: string, bankingType?: 'conventional' | 'syariah', userId?: string, tenantId?: string): void {
    this.info('Banking Operation', {
      operation,
      accountId,
      amount,
      currency,
      bankingType,
      userId,
      tenantId,
      type: 'BANKING_OPERATION'
    });
  }

  public logIFRS9Calculation(calculationType: string, portfolioId?: string, calculationResults?: any, userId?: string, tenantId?: string): void {
    this.info('IFRS9 Calculation', {
      calculationType,
      portfolioId,
      calculationResults,
      userId,
      tenantId,
      type: 'IFRS9_CALCULATION'
    });
  }

  public logSyariahCompliance(event: string, entityType: string, entityId: string, complianceStatus: boolean, details?: any, userId?: string, tenantId?: string): void {
    this.info('Syariah Compliance', {
      event,
      entityType,
      entityId,
      complianceStatus,
      details,
      userId,
      tenantId,
      type: 'SYARIAH_COMPLIANCE'
    });
  }
}

// Export singleton instance
export const winstonService = WinstonService.getInstance();
export default winstonService;