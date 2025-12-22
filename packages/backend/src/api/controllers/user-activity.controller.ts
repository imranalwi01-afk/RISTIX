// packages/backend/src/api/controllers/user-activity.controller.ts
// ============================================================================
// COMPREHENSIVE USER ACTIVITY TRACKING API CONTROLLER - IAF IFRS9 PLATFORM
// ============================================================================
// Purpose: Enhanced API endpoints for user activity management with real-time monitoring
// Author: Generated for IAF IFRS9 Step 01 Implementation
// Date: 2025-01-11

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserActivityService } from '../../core/services/user-activity/user-activity.service';
import { TenantContext } from '../../types/tenant.types';
import { UserActivityInput, SessionTrackingInput, PerformanceMetricsInput, SecurityEventInput } from '../../core/services/user-activity/user-activity.service';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const userActivitySchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().min(1).max(255),
  activityType: z.string().min(1).max(100),
  actionPerformed: z.string().min(1).max(255),
  targetEntity: z.string().max(100).optional(),
  targetId: z.string().uuid().optional(),
  targetName: z.string().max(500).optional(),
  pageUrl: z.string().url().optional(),
  referrerUrl: z.string().url().optional(),
  requestPath: z.string().max(500).optional(),
  requestMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  apiEndpoint: z.string().max(500).optional(),
  actionResult: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']),
  errorMessage: z.string().optional(),
  errorCode: z.string().max(100).optional(),
  responseTimeMs: z.number().int().positive().optional(),
  serverProcessingTimeMs: z.number().int().positive().optional(),
  clientRenderTimeMs: z.number().int().positive().optional(),
  ipAddress: z.string().regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).optional(),
  userAgent: z.string().max(500).optional(),
  deviceType: z.string().max(50).optional(),
  browserName: z.string().max(100).optional(),
  browserVersion: z.string().max(50).optional(),
  osName: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  moduleAccessed: z.string().max(100).optional(),
  businessProcess: z.string().max(100).optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  complianceRelevant: z.boolean().optional(),
  regulatoryImpact: z.boolean().optional(),
  gdprBasis: z.string().max(100).optional(),
  dataClassification: z.string().max(50).optional(),
  sessionDurationMs: z.number().int().positive().optional(),
  pageDwellTimeMs: z.number().int().positive().optional(),
  userEngagementScore: z.number().int().min(0).max(100).optional(),
  memoryUsageMb: z.number().positive().optional(),
  cpuUsagePercent: z.number().min(0).max(100).optional(),
  databaseQueryTimeMs: z.number().int().positive().optional(),
  cacheHitRatio: z.number().min(0).max(1).optional(),
  metadata: z.any().optional(),
  tags: z.array(z.string()).optional()
});

const sessionTrackingSchema = z.object({
  sessionId: z.string().min(1).max(255),
  userId: z.string().uuid().optional(),
  sessionStart: z.date().optional(),
  sessionEnd: z.date().optional(),
  sessionStatus: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'TERMINATED', 'TIMEOUT']).optional(),
  firstPageVisited: z.string().url().optional(),
  lastPageVisited: z.string().url().optional(),
  totalPageViews: z.number().int().min(0).optional(),
  totalActions: z.number().int().min(0).optional(),
  totalErrors: z.number().int().min(0).optional(),
  ipAddress: z.string().regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).optional(),
  userAgent: z.string().max(500).optional(),
  deviceType: z.string().max(50).optional(),
  browserName: z.string().max(100).optional(),
  browserVersion: z.string().max(50).optional(),
  osName: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  avgResponseTimeMs: z.number().positive().optional(),
  maxResponseTimeMs: z.number().int().positive().optional(),
  minResponseTimeMs: z.number().int().positive().optional(),
  totalDataTransferredMb: z.number().positive().optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional(),
  modulesAccessed: z.array(z.string()).optional(),
  failedLoginAttempts: z.number().int().min(0).optional(),
  securityEvents: z.number().int().min(0).optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  userEngagementScore: z.number().int().min(0).max(100).optional(),
  bounceRate: z.number().min(0).max(100).optional(),
  metadata: z.any().optional()
});

const performanceMetricsSchema = z.object({
  activityLogId: z.string().uuid().optional(),
  sessionId: z.string().max(255).optional(),
  metricType: z.string().min(1).max(50),
  metricName: z.string().min(1).max(100),
  startTime: z.date(),
  endTime: z.date(),
  durationMs: z.number().int().positive(),
  memoryUsageMb: z.number().positive().optional(),
  cpuUsagePercent: z.number().min(0).max(100).optional(),
  diskUsageMb: z.number().positive().optional(),
  networkIoMb: z.number().positive().optional(),
  databaseQueryTimeMs: z.number().int().positive().optional(),
  databaseQueriesCount: z.number().int().min(0).optional(),
  databaseRowsAffected: z.number().int().min(0).optional(),
  apiEndpoint: z.string().max(500).optional(),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  httpStatusCode: z.number().int().min(100).max(599).optional(),
  responseSizeBytes: z.number().int().min(0).optional(),
  pageLoadTimeMs: z.number().int().positive().optional(),
  domContentLoadedTimeMs: z.number().int().positive().optional(),
  firstContentfulPaintTimeMs: z.number().int().positive().optional(),
  largestContentfulPaintTimeMs: z.number().int().positive().optional(),
  moduleAccessed: z.string().max(100).optional(),
  businessProcess: z.string().max(100).optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional(),
  performanceCategory: z.enum(['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL']).optional(),
  slaCompliance: z.boolean().optional(),
  metadata: z.any().optional(),
  tags: z.array(z.string()).optional()
});

const securityEventSchema = z.object({
  eventType: z.string().min(1).max(50),
  eventSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  eventDescription: z.string().min(1),
  eventCategory: z.string().max(50).optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().max(255).optional(),
  ipAddress: z.string().regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).optional(),
  userAgent: z.string().max(500).optional(),
  requestPath: z.string().max(500).optional(),
  requestMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  moduleAccessed: z.string().max(100).optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional(),
  assignedTo: z.string().uuid().optional(),
  investigationNotes: z.string().optional(),
  resolutionDetails: z.string().optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  businessImpact: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  complianceRelevant: z.boolean().optional(),
  regulatoryImpact: z.boolean().optional(),
  metadata: z.any().optional()
});

const activityQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().max(255).optional(),
  activityType: z.string().max(100).optional(),
  actionResult: z.enum(['SUCCESS', 'FAILURE', 'PARTIAL']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  bankingType: z.enum(['conventional', 'syariah', 'dual']).optional(),
  complianceRelevant: z.boolean().optional(),
  moduleAccessed: z.string().max(100).optional(),
  ipAddress: z.string().regex(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  searchTerm: z.string().max(255).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
  sortBy: z.string().max(100).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional()
});

// ============================================================================
// USER ACTIVITY CONTROLLER
// ============================================================================

export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  // ============================================================================
  // USER ACTIVITY LOGGING ENDPOINTS
  // ============================================================================

  /**
   * Log user activity
   * POST /api/v1/user-activity/logs
   */
  public logUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate request body
      const validationResult = userActivitySchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
        return;
      }

      // Enrich with request context
      const enrichedInput = {
        ...validationResult.data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestPath: req.path,
        requestMethod: req.method
      };

      const activityLog = await this.userActivityService.logUserActivity(tenantContext, enrichedInput);

      res.status(201).json({
        success: true,
        data: activityLog,
        message: 'User activity logged successfully'
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
      next(error);
    }
  };

  /**
   * Log multiple user activities (batch)
   * POST /api/v1/user-activity/logs/batch
   */
  public logBatchUserActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { activities } = req.body;

      if (!Array.isArray(activities) || activities.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Activities array is required and cannot be empty'
        });
        return;
      }

      // Validate each activity
      const validatedActivities = [];
      const validationErrors = [];

      for (let i = 0; i < activities.length; i++) {
        const validationResult = userActivitySchema.safeParse(activities[i]);
        if (validationResult.success) {
          validatedActivities.push({
            ...validationResult.data,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            requestPath: req.path,
            requestMethod: req.method
          });
        } else {
          validationErrors.push({
            index: i,
            errors: validationResult.error.issues
          });
        }
      }

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed for some activities',
          details: validationErrors
        });
        return;
      }

      // Process activities in batch
      const results = [];
      for (const activity of validatedActivities) {
        try {
          const result = await this.userActivityService.logUserActivity(tenantContext, activity);
          results.push({ success: true, data: result });
        } catch (error) {
          results.push({ success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      res.status(201).json({
        success: true,
        data: {
          total: results.length,
          success: successCount,
          failures: failureCount,
          results
        },
        message: `Batch processing completed: ${successCount} successful, ${failureCount} failed`
      });
    } catch (error) {
      console.error('Error logging batch user activities:', error);
      next(error);
    }
  };

  // ============================================================================
  // SESSION TRACKING ENDPOINTS
  // ============================================================================

  /**
   * Track or update session
   * POST /api/v1/user-activity/sessions
   */
  public trackSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate request body
      const validationResult = sessionTrackingSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
        return;
      }

      // Enrich with request context
      const enrichedInput = {
        ...validationResult.data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const sessionData = await this.userActivityService.trackSession(tenantContext, enrichedInput);

      res.status(201).json({
        success: true,
        data: sessionData,
        message: 'Session tracked successfully'
      });
    } catch (error) {
      console.error('Error tracking session:', error);
      next(error);
    }
  };

  /**
   * Get session details
   * GET /api/v1/user-activity/sessions/:sessionId
   */
  public getSessionDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }

      // Query session details
      const result = await this.userActivityService.queryUserActivities(tenantContext, {
        sessionId,
        limit: 1,
        offset: 0
      });

      if (result.activities.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      // Get additional session analytics
      const sessionActivities = await this.userActivityService.queryUserActivities(tenantContext, {
        sessionId,
        limit: 1000,
        offset: 0
      });

      res.status(200).json({
        success: true,
        data: {
          session: result.activities[0],
          activities: sessionActivities.activities,
          statistics: sessionActivities.statistics,
          totalActivities: sessionActivities.total
        }
      });
    } catch (error) {
      console.error('Error getting session details:', error);
      next(error);
    }
  };

  // ============================================================================
  // ACTIVITY QUERY ENDPOINTS
  // ============================================================================

  /**
   * Query user activities
   * GET /api/v1/user-activity/activities
   */
  public queryActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate query parameters
      const validationResult = activityQuerySchema.safeParse(req.query);
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

      const result = await this.userActivityService.queryUserActivities(tenantContext, filters);

      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: {
          total: result.total,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
          hasMore: (filters.offset || 0) + (filters.limit || 50) < result.total
        },
        statistics: result.statistics,
        filters: filters
      });
    } catch (error) {
      console.error('Error querying activities:', error);
      next(error);
    }
  };

  /**
   * Get user activity statistics
   * GET /api/v1/user-activity/statistics
   */
  public getActivityStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate query parameters
      const validationResult = activityQuerySchema.omit({ limit: true, offset: true, sortBy: true, sortOrder: true }).safeParse(req.query);
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

      const statistics = await this.userActivityService.calculateActivityStatistics(tenantContext, filters);

      res.status(200).json({
        success: true,
        data: statistics,
        filters: filters
      });
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      next(error);
    }
  };

  // ============================================================================
  // REAL-TIME MONITORING ENDPOINTS
  // ============================================================================

  /**
   * Get real-time activity monitoring
   * GET /api/v1/user-activity/real-time
   */
  public getRealTimeMonitoring = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { timeWindowMinutes } = req.query;

      const timeWindow = timeWindowMinutes ? parseInt(timeWindowMinutes as string) : 5;

      const monitoringData = await this.userActivityService.getRealTimeActivityMonitoring(
        tenantContext,
        timeWindow
      );

      res.status(200).json({
        success: true,
        data: monitoringData,
        timeWindowMinutes: timeWindow,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting real-time monitoring data:', error);
      next(error);
    }
  };

  /**
   * Get live activity feed
   * GET /api/v1/user-activity/live-feed
   */
  public getLiveActivityFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { limit = 20, riskLevel = 'HIGH' } = req.query;

      // Get recent high-risk activities
      const result = await this.userActivityService.queryUserActivities(tenantContext, {
        riskLevel: riskLevel as any,
        dateFrom: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        limit: parseInt(limit as string),
        offset: 0,
        sortBy: 'activity_timestamp',
        sortOrder: 'DESC'
      });

      // Set headers for Server-Sent Events (SSE)
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial data
      res.write(`data: ${JSON.stringify({
        type: 'initial',
        data: result.activities,
        total: result.total
      })}\n\n`);

      // Set up interval for real-time updates (would use WebSocket in production)
      const interval = setInterval(async () => {
        try {
          const latestResult = await this.userActivityService.queryUserActivities(tenantContext, {
            riskLevel: riskLevel as any,
            dateFrom: new Date(Date.now() - 60 * 1000), // Last minute
            limit: 5,
            offset: 0,
            sortBy: 'activity_timestamp',
            sortOrder: 'DESC'
          });

          if (latestResult.activities.length > 0) {
            res.write(`data: ${JSON.stringify({
              type: 'update',
              data: latestResult.activities,
              timestamp: new Date().toISOString()
            })}\n\n`);
          }
        } catch (error) {
          console.error('Error in live feed update:', error);
        }
      }, 5000); // Update every 5 seconds

      // Clean up on disconnect
      req.on('close', () => {
        clearInterval(interval);
      });
    } catch (error) {
      console.error('Error getting live activity feed:', error);
      next(error);
    }
  };

  // ============================================================================
  // PERFORMANCE MONITORING ENDPOINTS
  // ============================================================================

  /**
   * Log performance metrics
   * POST /api/v1/user-activity/performance
   */
  public logPerformanceMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate request body
      const validationResult = performanceMetricsSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
        return;
      }

      const performanceData = await this.userActivityService.logPerformanceMetrics(
        tenantContext,
        validationResult.data
      );

      res.status(201).json({
        success: true,
        data: performanceData,
        message: 'Performance metrics logged successfully'
      });
    } catch (error) {
      console.error('Error logging performance metrics:', error);
      next(error);
    }
  };

  /**
   * Get performance analytics
   * GET /api/v1/user-activity/performance/analytics
   */
  public getPerformanceAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { period = '24h', module } = req.query;

      // Calculate time range
      let dateFrom: Date;
      switch (period) {
        case '1h':
          dateFrom = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '24h':
          dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const filters: any = {
        dateFrom,
        dateTo: new Date(),
        limit: 10000,
        offset: 0
      };

      if (module) {
        filters.moduleAccessed = module;
      }

      const result = await this.userActivityService.queryUserActivities(tenantContext, filters);

      // Calculate performance analytics
      const performanceAnalytics = this.calculatePerformanceAnalytics(result.activities);

      res.status(200).json({
        success: true,
        data: performanceAnalytics,
        period,
        module,
        totalRecords: result.total
      });
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      next(error);
    }
  };

  // ============================================================================
  // SECURITY EVENT ENDPOINTS
  // ============================================================================

  /**
   * Log security event
   * POST /api/v1/user-activity/security/events
   */
  public logSecurityEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;

      // Validate request body
      const validationResult = securityEventSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.issues
        });
        return;
      }

      // Enrich with request context
      const enrichedInput = {
        ...validationResult.data,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        requestPath: req.path,
        requestMethod: req.method
      };

      const securityEventData = await this.userActivityService.logSecurityEvent(tenantContext, enrichedInput);

      res.status(201).json({
        success: true,
        data: securityEventData,
        message: 'Security event logged successfully'
      });
    } catch (error) {
      console.error('Error logging security event:', error);
      next(error);
    }
  };

  /**
   * Get security events
   * GET /api/v1/user-activity/security/events
   */
  public getSecurityEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { severity, status, limit = 50, offset = 0 } = req.query;

      // Build filters for security events
      const filters: any = {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        dateTo: new Date(),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // Query user activities that might be security events
      const result = await this.userActivityService.queryUserActivities(tenantContext, filters);

      // Filter and categorize security-related activities
      const securityEvents = result.activities.filter(activity => {
        return activity.riskLevel === 'HIGH' || activity.riskLevel === 'CRITICAL' ||
               activity.complianceRelevant ||
               activity.activityType.includes('SECURITY') ||
               activity.activityType.includes('AUTHENTICATION');
      });

      res.status(200).json({
        success: true,
        data: securityEvents,
        pagination: {
          total: securityEvents.length,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: filters.offset + filters.limit < securityEvents.length
        }
      });
    } catch (error) {
      console.error('Error getting security events:', error);
      next(error);
    }
  };

  // ============================================================================
  // EXPORT ENDPOINTS
  // ============================================================================

  /**
   * Export user activities
   * GET /api/v1/user-activity/export
   */
  public exportUserActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { format = 'csv', ...filters } = req.query;

      // Validate format
      if (!['csv', 'json', 'excel'].includes(format as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid export format. Supported formats: csv, json, excel'
        });
        return;
      }

      // Validate and parse filters
      const validationResult = activityQuerySchema.omit({ limit: true, offset: true }).safeParse(filters);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid filter parameters',
          details: validationResult.error.issues
        });
        return;
      }

      const exportFilters = {
        ...validationResult.data,
        dateFrom: validationResult.data.dateFrom ? new Date(validationResult.data.dateFrom) : undefined,
        dateTo: validationResult.data.dateTo ? new Date(validationResult.data.dateTo) : undefined
      };

      const exportData = await this.userActivityService.exportUserActivities(
        tenantContext,
        exportFilters,
        format as 'csv' | 'json' | 'excel'
      );

      // Set appropriate headers
      res.setHeader('Content-Type', exportData.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);

      if (format === 'json') {
        res.json({
          success: true,
          data: exportData.data,
          filename: exportData.filename,
          exportedAt: new Date().toISOString(),
          totalRecords: exportData.data.length
        });
      } else {
        res.send(exportData.data);
      }
    } catch (error) {
      console.error('Error exporting user activities:', error);
      next(error);
    }
  };

  /**
   * Generate compliance report
   * POST /api/v1/user-activity/compliance/reports
   */
  public generateComplianceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { reportType, dateFrom, dateTo, format = 'json' } = req.body;

      if (!reportType || !dateFrom || !dateTo) {
        res.status(400).json({
          success: false,
          error: 'Report type, date from, and date to are required'
        });
        return;
      }

      // Validate report type
      const validReportTypes = ['GDPR', 'SOX', 'BASEL', 'AAOIFI', 'INTERNAL_AUDIT'];
      if (!validReportTypes.includes(reportType)) {
        res.status(400).json({
          success: false,
          error: `Invalid report type. Supported types: ${validReportTypes.join(', ')}`
        });
        return;
      }

      // Query activities for the report period
      const result = await this.userActivityService.queryUserActivities(tenantContext, {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        limit: 10000,
        offset: 0
      });

      // Generate compliance report
      const reportData = this.generateComplianceReportData(reportType, result.activities, result.statistics);

      const report = {
        reportType,
        generatedAt: new Date().toISOString(),
        period: { from: dateFrom, to: dateTo },
        generatedBy: req.user?.id,
        tenantId: tenantContext.tenantId,
        data: reportData,
        summary: this.generateReportSummary(reportData),
        totalRecords: result.total
      };

      res.status(200).json({
        success: true,
        data: report,
        message: `${reportType} compliance report generated successfully`
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      next(error);
    }
  };

  // ============================================================================
  // DASHBOARD ENDPOINTS
  // ============================================================================

  /**
   * Get dashboard data
   * GET /api/v1/user-activity/dashboard
   */
  public getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext = req.tenantContext as TenantContext;
      const { period = '24h' } = req.query;

      // Calculate time range
      let dateFrom: Date;
      switch (period) {
        case '1h':
          dateFrom = new Date(Date.now() - 60 * 60 * 1000);
          break;
        case '24h':
          dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      // Get data for different dashboard components
      const [
        activities,
        realTimeData,
        performanceData
      ] = await Promise.all([
        this.userActivityService.queryUserActivities(tenantContext, {
          dateFrom,
          dateTo: new Date(),
          limit: 1000,
          offset: 0
        }),
        this.userActivityService.getRealTimeActivityMonitoring(tenantContext, 15),
        this.userActivityService.queryUserActivities(tenantContext, {
          dateFrom,
          dateTo: new Date(),
          limit: 100,
          offset: 0
        })
      ]);

      const dashboardData = {
        summary: activities.statistics,
        realTime: realTimeData,
        performance: this.calculatePerformanceAnalytics(activities.activities),
        recentActivities: activities.activities.slice(0, 10),
        alerts: this.generateDashboardAlerts(activities.statistics),
        period,
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      next(error);
    }
  };

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Calculate performance analytics from activities
   */
  private calculatePerformanceAnalytics(activities: any[]): any {
    const performanceData = activities.filter(a => a.responseTimeMs);

    if (performanceData.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        p50ResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        slaComplianceRate: 0,
        performanceDistribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
          critical: 0
        }
      };
    }

    const responseTimes = performanceData.map(a => a.responseTimeMs).sort((a, b) => a - b);
    const totalActivities = performanceData.length;
    const threshold2000ms = 2000; // 2 seconds SLA

    return {
      avgResponseTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / totalActivities),
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      p50ResponseTime: responseTimes[Math.floor(totalActivities * 0.5)],
      p95ResponseTime: responseTimes[Math.floor(totalActivities * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(totalActivities * 0.99)],
      slaComplianceRate: Math.round((performanceData.filter(a => a.responseTimeMs <= threshold2000ms).length / totalActivities) * 100),
      performanceDistribution: {
        excellent: performanceData.filter(a => a.responseTimeMs <= 500).length,
        good: performanceData.filter(a => a.responseTimeMs > 500 && a.responseTimeMs <= 1000).length,
        average: performanceData.filter(a => a.responseTimeMs > 1000 && a.responseTimeMs <= 2000).length,
        poor: performanceData.filter(a => a.responseTimeMs > 2000 && a.responseTimeMs <= 5000).length,
        critical: performanceData.filter(a => a.responseTimeMs > 5000).length
      }
    };
  }

  /**
   * Generate compliance report data
   */
  private generateComplianceReportData(reportType: string, activities: any[], statistics: any): any {
    const baseData = {
      totalActivities: activities.length,
      complianceRelevantActivities: activities.filter(a => a.complianceRelevant).length,
      highRiskActivities: activities.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length,
      failedActivities: activities.filter(a => a.actionResult === 'FAILURE').length,
      uniqueUsers: statistics.uniqueUsers,
      avgResponseTime: statistics.avgResponseTime,
      activitiesByRiskLevel: statistics.riskDistribution,
      activitiesByModule: statistics.topModules,
      activitiesByResult: statistics.resultDistribution
    };

    switch (reportType) {
      case 'GDPR':
        return {
          ...baseData,
          gdprSpecific: {
            dataProcessingActivities: activities.filter(a => a.activityType.includes('DATA')).length,
            consentRelatedActivities: activities.filter(a => a.tags?.includes('GDPR_CONSENT')).length,
            dataExportActivities: activities.filter(a => a.activityType === 'DATA_EXPORT').length,
            piiAccessEvents: activities.filter(a => a.dataClassification === 'SENSITIVE').length
          }
        };

      case 'SOX':
        return {
          ...baseData,
          soxSpecific: {
            financialActivities: activities.filter(a => a.businessProcess?.includes('FINANCIAL')).length,
            configurationChanges: activities.filter(a => a.activityType === 'CONFIGURATION_CHANGE').length,
            approvalActivities: activities.filter(a => a.activityType === 'APPROVAL_ACTION').length,
            auditTrailEvents: activities.filter(a => a.complianceRelevant).length
          }
        };

      case 'BASEL':
        return {
          ...baseData,
          baselSpecific: {
            riskAssessmentActivities: activities.filter(a => a.riskLevel !== 'LOW').length,
            calculationActivities: activities.filter(a => a.moduleAccessed?.includes('Calculation')).length,
            modelValidationActivities: activities.filter(a => a.activityType.includes('VALIDATION')).length,
            capitalAdequacyEvents: activities.filter(a => a.tags?.includes('BASEL_CA')).length
          }
        };

      case 'AAOIFI':
        return {
          ...baseData,
          aaoifiSpecific: {
            syariahActivities: activities.filter(a => a.bankingType === 'syariah').length,
            complianceChecks: activities.filter(a => a.tags?.includes('AAOIFI_COMPLIANCE')).length,
            islamicFinanceActivities: activities.filter(a => a.moduleAccessed?.includes('Syariah')).length,
            shariahBoardEvents: activities.filter(a => a.tags?.includes('SHARIAH_BOARD')).length
          }
        };

      default:
        return baseData;
    }
  }

  /**
   * Generate report summary
   */
  private generateReportSummary(reportData: any): any {
    const totalActivities = reportData.totalActivities || 0;
    const complianceRate = totalActivities > 0 ?
      ((reportData.complianceRelevantActivities || 0) / totalActivities) * 100 : 0;

    return {
      totalRecords: totalActivities,
      complianceScore: Math.round(complianceRate),
      riskLevel: reportData.highRiskActivities > 0 ? 'HIGH' :
                 reportData.failedActivities > totalActivities * 0.05 ? 'MEDIUM' : 'LOW',
      recommendations: this.generateRecommendations(reportData)
    };
  }

  /**
   * Generate recommendations based on report data
   */
  private generateRecommendations(reportData: any): string[] {
    const recommendations = [];

    if (reportData.highRiskActivities > 10) {
      recommendations.push('Consider reviewing high-risk activities and implementing additional security measures');
    }

    if (reportData.failedActivities > reportData.totalActivities * 0.1) {
      recommendations.push('High failure rate detected. Review error handling and system reliability');
    }

    if (reportData.avgResponseTime > 2000) {
      recommendations.push('Average response time exceeds 2 seconds. Consider performance optimization');
    }

    if (reportData.complianceRelevantActivities < reportData.totalActivities * 0.5) {
      recommendations.push('Consider improving compliance tracking for regulatory activities');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance and compliance metrics are within acceptable ranges');
    }

    return recommendations;
  }

  /**
   * Generate dashboard alerts
   */
  private generateDashboardAlerts(statistics: any): any[] {
    const alerts = [];

    if (statistics.criticalRiskActivities > 0) {
      alerts.push({
        level: 'critical',
        title: 'Critical Risk Activities Detected',
        message: `${statistics.criticalRiskActivities} critical risk activities require immediate attention`,
        action: 'Review security events and investigate high-risk activities'
      });
    }

    if (statistics.failedActivities > statistics.totalActivities * 0.1) {
      alerts.push({
        level: 'warning',
        title: 'High Failure Rate',
        message: `${((statistics.failedActivities / statistics.totalActivities) * 100).toFixed(1)}% of activities are failing`,
        action: 'Review error logs and system performance'
      });
    }

    if (statistics.avgResponseTime > 3000) {
      alerts.push({
        level: 'warning',
        title: 'Poor Performance',
        message: `Average response time is ${statistics.avgResponseTime}ms`,
        action: 'Investigate performance bottlenecks and optimize system resources'
      });
    }

    if (statistics.complianceRelevantActivities > 0) {
      alerts.push({
        level: 'info',
        title: 'Compliance Activities',
        message: `${statistics.complianceRelevantActivities} compliance-relevant activities recorded`,
        action: 'Review compliance reports and ensure regulatory requirements are met'
      });
    }

    return alerts;
  }
}

export default UserActivityController;