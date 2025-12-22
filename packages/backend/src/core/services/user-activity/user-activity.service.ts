// packages/backend/src/core/services/user-activity/user-activity.service.ts
// ============================================================================
// COMPREHENSIVE USER ACTIVITY TRACKING SERVICE - IAF IFRS9 PLATFORM
// ============================================================================
// Purpose: Advanced user activity logging with session tracking, performance monitoring, and compliance
// Author: Generated for IAF IFRS9 Step 01 Implementation
// Date: 2025-01-11

import { Sequelize, Transaction, Op, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { TenantContext } from '../../../types/tenant.types';
import { UserActivityLog, PerformanceMetrics, SecurityEvent } from '../../../types/audit.types';

// Import with try-catch to handle missing dependencies
let DatabaseService: any;
let ConfigurationService: any;
let SecurityService: any;

try {
  DatabaseService = require('../database/database.service').DatabaseService;
} catch (error) {
  console.warn('⚠️ DatabaseService not available in UserActivityService');
  DatabaseService = null;
}

try {
  ConfigurationService = require('../configuration/configuration.service').ConfigurationService;
} catch (error) {
  console.warn('⚠️ ConfigurationService not available in UserActivityService');
  ConfigurationService = null;
}

try {
  SecurityService = require('../security/security.service').SecurityService;
} catch (error) {
  console.warn('⚠️ SecurityService not available in UserActivityService');
  SecurityService = null;
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface UserActivityInput {
  userId: string;
  sessionId: string;
  activityType: string;
  actionPerformed: string;
  targetEntity?: string;
  targetId?: string;
  targetName?: string;
  pageUrl?: string;
  referrerUrl?: string;
  requestPath?: string;
  requestMethod?: string;
  apiEndpoint?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  errorCode?: string;
  responseTimeMs?: number;
  serverProcessingTimeMs?: number;
  clientRenderTimeMs?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  moduleAccessed?: string;
  businessProcess?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceRelevant?: boolean;
  regulatoryImpact?: boolean;
  gdprBasis?: string;
  dataClassification?: string;
  sessionDurationMs?: number;
  pageDwellTimeMs?: number;
  userEngagementScore?: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  databaseQueryTimeMs?: number;
  cacheHitRatio?: number;
  metadata?: any;
  tags?: string[];
}

export interface SessionTrackingInput {
  sessionId: string;
  userId?: string;
  sessionStart?: Date;
  sessionEnd?: Date;
  sessionStatus?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'TERMINATED' | 'TIMEOUT';
  firstPageVisited?: string;
  lastPageVisited?: string;
  totalPageViews?: number;
  totalActions?: number;
  totalErrors?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  avgResponseTimeMs?: number;
  maxResponseTimeMs?: number;
  minResponseTimeMs?: number;
  totalDataTransferredMb?: number;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  modulesAccessed?: string[];
  failedLoginAttempts?: number;
  securityEvents?: number;
  riskScore?: number;
  userEngagementScore?: number;
  bounceRate?: number;
  metadata?: any;
}

export interface PerformanceMetricsInput {
  activityLogId?: string;
  sessionId?: string;
  metricType: string;
  metricName: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  diskUsageMb?: number;
  networkIoMb?: number;
  databaseQueryTimeMs?: number;
  databaseQueriesCount?: number;
  databaseRowsAffected?: number;
  apiEndpoint?: string;
  httpMethod?: string;
  httpStatusCode?: number;
  responseSizeBytes?: number;
  pageLoadTimeMs?: number;
  domContentLoadedTimeMs?: number;
  firstContentfulPaintTimeMs?: number;
  largestContentfulPaintTimeMs?: number;
  moduleAccessed?: string;
  businessProcess?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  performanceCategory?: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'CRITICAL';
  slaCompliance?: boolean;
  metadata?: any;
  tags?: string[];
}

export interface SecurityEventInput {
  eventType: string;
  eventSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventDescription: string;
  eventCategory?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
  moduleAccessed?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  assignedTo?: string;
  investigationNotes?: string;
  resolutionDetails?: string;
  riskScore?: number;
  businessImpact?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceRelevant?: boolean;
  regulatoryImpact?: boolean;
  metadata?: any;
}

export interface ActivityAnalyticsFilters {
  userId?: string;
  sessionId?: string;
  activityType?: string;
  actionResult?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  bankingType?: 'conventional' | 'syariah' | 'dual';
  complianceRelevant?: boolean;
  moduleAccessed?: string;
  ipAddress?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ActivityStatistics {
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  partialActivities: number;
  criticalRiskActivities: number;
  highRiskActivities: number;
  mediumRiskActivities: number;
  lowRiskActivities: number;
  uniqueUsers: number;
  uniqueSessions: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  totalErrors: number;
  complianceRelevantActivities: number;
  topModules: { module: string; count: number }[];
  topUsers: { userId: string; userName: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  riskDistribution: { risk: string; count: number }[];
  resultDistribution: { result: string; count: number }[];
  bankingTypeDistribution: { type: string; count: number }[];
  moduleEngagement: { module: string; avgEngagement: number; totalUsers: number }[];
  performanceMetrics: {
    avgPageLoadTime: number;
    avgServerResponseTime: number;
    avgClientRenderTime: number;
    slaComplianceRate: number;
  };
}

// ============================================================================
// USER ACTIVITY SERVICE
// ============================================================================

export class UserActivityService {
  private readonly databaseService: any;
  private readonly configService: any;
  private readonly securityService: any;
  private config: any;

  constructor(
    databaseService?: any,
    configService?: any,
    securityService?: any
  ) {
    this.databaseService = databaseService;
    this.configService = configService;
    this.securityService = securityService;

    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    try {
      if (this.configService && this.configService.getServiceConfig) {
        this.config = await this.configService.getServiceConfig('userActivity', {
          enableRealTimeMonitoring: true,
          enableGeolocationTracking: true,
          enablePerformanceMonitoring: true,
          enableComplianceMonitoring: true,
          highResponseTimeThresholdMs: 2000,
          criticalResponseTimeThresholdMs: 5000,
          sessionTimeoutMinutes: 30,
          maxFailedLoginAttempts: 5,
          defaultRiskLevel: 'LOW',
          enableSecurityEventDetection: true,
          enableDataRetention: true,
          userActivityRetentionDays: 2555,
          sessionTrackingRetentionDays: 1095,
          performanceMetricsRetentionDays: 730,
          securityEventsRetentionDays: 3650
        });
      } else {
        this.config = {
          enableRealTimeMonitoring: true,
          enableGeolocationTracking: true,
          enablePerformanceMonitoring: true,
          enableComplianceMonitoring: true,
          highResponseTimeThresholdMs: 2000,
          criticalResponseTimeThresholdMs: 5000,
          sessionTimeoutMinutes: 30,
          maxFailedLoginAttempts: 5,
          defaultRiskLevel: 'LOW',
          enableSecurityEventDetection: true,
          enableDataRetention: true,
          userActivityRetentionDays: 2555,
          sessionTrackingRetentionDays: 1095,
          performanceMetricsRetentionDays: 730,
          securityEventsRetentionDays: 3650
        };
      }
    } catch (error) {
      console.warn('⚠️ Error loading user activity configuration:', error);
    }
  }

  // ============================================================================
  // USER ACTIVITY LOGGING
  // ============================================================================

  /**
   * Log user activity with comprehensive tracking
   */
  async logUserActivity(
    tenantContext: TenantContext,
    input: UserActivityInput,
    transaction?: Transaction
  ): Promise<UserActivityLog> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      // Enrich input data with additional tracking
      const enrichedInput = await this.enrichActivityInput(tenantContext, input);

      // Create activity log entry
      const activityLog = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        userId: input.userId,
        sessionId: input.sessionId,
        correlationId: uuidv4(),
        activityType: input.activityType,
        actionPerformed: input.actionPerformed,
        activityDescription: this.generateActivityDescription(input),
        targetEntity: input.targetEntity,
        targetId: input.targetId,
        targetName: input.targetName,
        pageUrl: input.pageUrl,
        referrerUrl: input.referrerUrl,
        requestPath: input.requestPath,
        requestMethod: input.requestMethod,
        apiEndpoint: input.apiEndpoint,
        actionResult: input.actionResult,
        errorMessage: input.errorMessage,
        errorCode: input.errorCode,
        responseTimeMs: input.responseTimeMs,
        serverProcessingTimeMs: input.serverProcessingTimeMs,
        clientRenderTimeMs: input.clientRenderTimeMs,
        ipAddress: enrichedInput.ipAddress,
        countryCode: enrichedInput.countryCode,
        countryName: enrichedInput.countryName,
        city: enrichedInput.city,
        userAgent: input.userAgent,
        deviceType: input.deviceType || enrichedInput.deviceType,
        browserName: input.browserName || enrichedInput.browserName,
        browserVersion: input.browserVersion || enrichedInput.browserVersion,
        osName: input.osName || enrichedInput.osName,
        osVersion: input.osVersion || enrichedInput.osVersion,
        moduleAccessed: input.moduleAccessed,
        businessProcess: input.businessProcess,
        bankingType: input.bankingType,
        riskLevel: this.calculateRiskLevel(input),
        complianceRelevant: input.complianceRelevant || this.isComplianceRelevant(input),
        regulatoryImpact: input.regulatoryImpact || this.isRegulatoryImpact(input),
        gdprBasis: input.gdprBasis,
        dataClassification: input.dataClassification || this.classifyData(input),
        sessionDurationMs: input.sessionDurationMs,
        pageDwellTimeMs: input.pageDwellTimeMs,
        userEngagementScore: input.userEngagementScore,
        memoryUsageMb: input.memoryUsageMb,
        cpuUsagePercent: input.cpuUsagePercent,
        databaseQueryTimeMs: input.databaseQueryTimeMs,
        cacheHitRatio: input.cacheHitRatio,
        metadata: input.metadata,
        tags: input.tags || [],
        activityTimestamp: new Date(),
        createdAt: new Date()
      };

      const result = await db.query(
        `INSERT INTO audit.user_activity_logs (
          id, tenant_id, user_id, session_id, correlation_id, activity_type, action_performed,
          activity_description, target_entity, target_id, target_name, page_url, referrer_url,
          request_path, request_method, api_endpoint, action_result, error_message, error_code,
          response_time_ms, server_processing_time_ms, client_render_time_ms, ip_address,
          country_code, country_name, city, user_agent, device_type, browser_name, browser_version,
          os_name, os_version, module_accessed, business_process, banking_type, risk_level,
          compliance_relevant, regulatory_impact, gdpr_basis, data_classification,
          session_duration_ms, page_dwell_time_ms, user_engagement_score, memory_usage_mb,
          cpu_usage_percent, database_query_time_ms, cache_hit_ratio, metadata, tags,
          activity_timestamp, created_at
        ) VALUES (
          :id, :tenantId, :userId, :sessionId, :correlationId, :activityType, :actionPerformed,
          :activityDescription, :targetEntity, :targetId, :targetName, :pageUrl, :referrerUrl,
          :requestPath, :requestMethod, :apiEndpoint, :actionResult, :errorMessage, :errorCode,
          :responseTimeMs, :serverProcessingTimeMs, :clientRenderTimeMs, :ipAddress,
          :countryCode, :countryName, :city, :userAgent, :deviceType, :browserName, :browserVersion,
          :osName, :osVersion, :moduleAccessed, :businessProcess, :bankingType, :riskLevel,
          :complianceRelevant, :regulatoryImpact, :gdprBasis, :dataClassification,
          :sessionDurationMs, :pageDwellTimeMs, :userEngagementScore, :memoryUsageMb,
          :cpuUsagePercent, :databaseQueryTimeMs, :cacheHitRatio, :metadata, :tags,
          :activityTimestamp, :createdAt
        ) RETURNING *`,
        {
          replacements: activityLog,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      // Update session tracking
      await this.updateSessionTracking(tenantContext, input, transaction);

      // Log performance metrics if enabled
      if (this.config.enablePerformanceMonitoring && input.responseTimeMs) {
        await this.logPerformanceMetrics(tenantContext, {
          activityLogId: result[0].id,
          sessionId: input.sessionId,
          metricType: 'USER_ACTIVITY',
          metricName: 'Response Time',
          startTime: new Date(Date.now() - (input.responseTimeMs || 0)),
          endTime: new Date(),
          durationMs: input.responseTimeMs,
          responseSizeBytes: 0,
          pageLoadTimeMs: input.clientRenderTimeMs,
          httpStatusCode: input.actionResult === 'SUCCESS' ? 200 : 500,
          performanceCategory: this.categorizePerformance(input.responseTimeMs),
          slaCompliance: input.responseTimeMs <= this.config.highResponseTimeThresholdMs,
          moduleAccessed: input.moduleAccessed,
          bankingType: input.bankingType
        }, transaction);
      }

      // Check for security events
      if (this.config.enableSecurityEventDetection) {
        await this.detectSecurityEvents(tenantContext, activityLog, transaction);
      }

      return result[0];
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw new Error(`Failed to log user activity: ${error.message}`);
    }
  }

  // ============================================================================
  // SESSION TRACKING
  // ============================================================================

  /**
   * Track or update session information
   */
  async trackSession(
    tenantContext: TenantContext,
    input: SessionTrackingInput,
    transaction?: Transaction
  ): Promise<any> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      const sessionData = {
        tenantId: tenantContext.tenantId,
        sessionId: input.sessionId,
        userId: input.userId,
        sessionStart: input.sessionStart || new Date(),
        sessionEnd: input.sessionEnd,
        sessionStatus: input.sessionStatus || 'ACTIVE',
        firstPageVisited: input.firstPageVisited,
        lastPageVisited: input.lastPageVisited,
        totalPageViews: input.totalPageViews || 0,
        totalActions: input.totalActions || 0,
        totalErrors: input.totalErrors || 0,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceType: input.deviceType,
        browserName: input.browserName,
        browserVersion: input.browserVersion,
        osName: input.osName,
        osVersion: input.osVersion,
        avgResponseTimeMs: input.avgResponseTimeMs,
        maxResponseTimeMs: input.maxResponseTimeMs,
        minResponseTimeMs: input.minResponseTimeMs,
        totalDataTransferredMb: input.totalDataTransferredMb,
        bankingType: input.bankingType,
        modulesAccessed: input.modulesAccessed || [],
        failedLoginAttempts: input.failedLoginAttempts || 0,
        securityEvents: input.securityEvents || 0,
        riskScore: input.riskScore || 0,
        userEngagementScore: input.userEngagementScore || 0,
        bounceRate: input.bounceRate,
        metadata: input.metadata
      };

      // Use UPSERT to handle new or existing sessions
      const result = await db.query(
        `INSERT INTO audit.session_tracking (
          tenant_id, session_id, user_id, session_start, session_end, session_status,
          first_page_visited, last_page_visited, total_page_views, total_actions, total_errors,
          ip_address, user_agent, device_type, browser_name, browser_version, os_name, os_version,
          avg_response_time_ms, max_response_time_ms, min_response_time_ms, total_data_transferred_mb,
          banking_type, modules_accessed, failed_login_attempts, security_events, risk_score,
          user_engagement_score, bounce_rate, metadata
        ) VALUES (
          :tenantId, :sessionId, :userId, :sessionStart, :sessionEnd, :sessionStatus,
          :firstPageVisited, :lastPageVisited, :totalPageViews, :totalActions, :totalErrors,
          :ipAddress, :userAgent, :deviceType, :browserName, :browserVersion, :osName, :osVersion,
          :avgResponseTimeMs, :maxResponseTimeMs, :minResponseTimeMs, :totalDataTransferredMb,
          :bankingType, :modulesAccessed, :failedLoginAttempts, :securityEvents, :riskScore,
          :userEngagementScore, :bounceRate, :metadata
        )
        ON CONFLICT (session_id)
        DO UPDATE SET
          session_end = EXCLUDED.session_end,
          session_status = EXCLUDED.session_status,
          last_page_visited = EXCLUDED.last_page_visited,
          total_page_views = EXCLUDED.total_page_views,
          total_actions = EXCLUDED.total_actions,
          total_errors = EXCLUDED.total_errors,
          avg_response_time_ms = EXCLUDED.avg_response_time_ms,
          max_response_time_ms = EXCLUDED.max_response_timeMs,
          min_response_time_ms = EXCLUDED.minResponseTimeMs,
          total_data_transferred_mb = EXCLUDED.totalDataTransferredMb,
          modules_accessed = EXCLUDED.modulesAccessed,
          failed_login_attempts = EXCLUDED.failedLoginAttempts,
          security_events = EXCLUDED.securityEvents,
          risk_score = EXCLUDED.riskScore,
          user_engagement_score = EXCLUDED.userEngagementScore,
          bounce_rate = EXCLUDED.bounceRate,
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
        RETURNING *`,
        {
          replacements: sessionData,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      return result[0];
    } catch (error) {
      console.error('Error tracking session:', error);
      throw new Error(`Failed to track session: ${error.message}`);
    }
  }

  /**
   * Update session tracking with activity information
   */
  private async updateSessionTracking(
    tenantContext: TenantContext,
    activityInput: UserActivityInput,
    transaction?: Transaction
  ): Promise<void> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      // Update session with latest activity information
      await db.query(
        `UPDATE audit.session_tracking SET
          last_page_visited = :pageUrl,
          total_actions = total_actions + 1,
          total_errors = total_errors + CASE WHEN :actionResult = 'FAILURE' THEN 1 ELSE 0 END,
          session_status = 'ACTIVE',
          modules_accessed = array_append(modules_accessed, :moduleAccessed)
        WHERE session_id = :sessionId`,
        {
          replacements: {
            pageUrl: activityInput.pageUrl,
            actionPerformed: activityInput.actionPerformed,
            actionResult: activityInput.actionResult,
            moduleAccessed: activityInput.moduleAccessed,
            sessionId: activityInput.sessionId
          },
          type: db.QueryTypes.UPDATE,
          transaction
        }
      );
    } catch (error) {
      console.warn('Error updating session tracking:', error);
      // Don't throw - session update failure shouldn't break activity logging
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  /**
   * Log performance metrics
   */
  async logPerformanceMetrics(
    tenantContext: TenantContext,
    input: PerformanceMetricsInput,
    transaction?: Transaction
  ): Promise<PerformanceMetrics> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      const metricsData = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        userId: (input as any).userId, // Will be populated from activity context
        sessionId: input.sessionId,
        activityLogId: input.activityLogId,
        metricType: input.metricType,
        metricName: input.metricName,
        startTime: input.startTime,
        endTime: input.endTime,
        durationMs: input.durationMs,
        memoryUsageMb: input.memoryUsageMb,
        cpuUsagePercent: input.cpuUsagePercent,
        diskUsageMb: input.diskUsageMb,
        networkIoMb: input.networkIoMb,
        databaseQueryTimeMs: input.databaseQueryTimeMs,
        databaseQueriesCount: input.databaseQueriesCount,
        databaseRowsAffected: input.databaseRowsAffected,
        apiEndpoint: input.apiEndpoint,
        httpMethod: input.httpMethod,
        httpStatusCode: input.httpStatusCode,
        responseSizeBytes: input.responseSizeBytes,
        pageLoadTimeMs: input.pageLoadTimeMs,
        domContentLoadedTimeMs: input.domContentLoadedTimeMs,
        firstContentfulPaintTimeMs: input.firstContentfulPaintTimeMs,
        largestContentfulPaintTimeMs: input.largestContentfulPaintTimeMs,
        moduleAccessed: input.moduleAccessed,
        businessProcess: input.businessProcess,
        bankingType: input.bankingType,
        performanceCategory: input.performanceCategory || this.categorizePerformance(input.durationMs),
        slaCompliance: input.slaCompliance !== undefined ? input.slaCompliance : input.durationMs <= this.config.highResponseTimeThresholdMs,
        metadata: input.metadata,
        tags: input.tags || [],
        createdAt: new Date()
      };

      const result = await db.query(
        `INSERT INTO audit.performance_metrics (
          id, tenant_id, user_id, session_id, activity_log_id, metric_type, metric_name,
          start_time, end_time, duration_ms, memory_usage_mb, cpu_usage_percent, disk_usage_mb,
          network_io_mb, database_query_time_ms, database_queries_count, database_rows_affected,
          api_endpoint, http_method, http_status_code, response_size_bytes, page_load_time_ms,
          dom_content_loaded_time_ms, first_contentful_paint_time_ms, largest_contentful_paint_time_ms,
          module_accessed, business_process, banking_type, performance_category, sla_compliance,
          metadata, tags, created_at
        ) VALUES (
          :id, :tenantId, :userId, :sessionId, :activityLogId, :metricType, :metricName,
          :startTime, :endTime, :durationMs, :memoryUsageMb, :cpuUsagePercent, :diskUsageMb,
          :networkIoMb, :databaseQueryTimeMs, :databaseQueriesCount, :databaseRowsAffected,
          :apiEndpoint, :httpMethod, :httpStatusCode, :responseSizeBytes, :pageLoadTimeMs,
          :domContentLoadedTimeMs, :firstContentfulPaintTimeMs, :largestContentfulPaintTimeMs,
          :moduleAccessed, :businessProcess, :bankingType, :performanceCategory, :slaCompliance,
          :metadata, :tags, :createdAt
        ) RETURNING *`,
        {
          replacements: metricsData,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      return result[0];
    } catch (error) {
      console.error('Error logging performance metrics:', error);
      throw new Error(`Failed to log performance metrics: ${error.message}`);
    }
  }

  // ============================================================================
  // SECURITY EVENT TRACKING
  // ============================================================================

  /**
   * Log security events
   */
  async logSecurityEvent(
    tenantContext: TenantContext,
    input: SecurityEventInput,
    transaction?: Transaction
  ): Promise<SecurityEvent> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      const securityEventData = {
        id: uuidv4(),
        tenantId: tenantContext.tenantId,
        eventType: input.eventType,
        eventSeverity: input.eventSeverity,
        eventStatus: 'OPEN',
        eventDescription: input.eventDescription,
        eventCategory: input.eventCategory,
        userId: input.userId,
        sessionId: input.sessionId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        requestPath: input.requestPath,
        requestMethod: input.requestMethod,
        moduleAccessed: input.moduleAccessed,
        bankingType: input.bankingType,
        assignedTo: input.assignedTo,
        investigationNotes: input.investigationNotes,
        resolutionDetails: input.resolutionDetails,
        riskScore: input.riskScore || this.calculateSecurityRiskScore(input),
        businessImpact: input.businessImpact || this.assessBusinessImpact(input),
        complianceRelevant: input.complianceRelevant || this.isComplianceRelevantSecurityEvent(input),
        regulatoryImpact: input.regulatoryImpact || this.isRegulatoryImpactSecurityEvent(input),
        metadata: input.metadata,
        eventTimestamp: new Date(),
        detectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.query(
        `INSERT INTO audit.security_events (
          id, tenant_id, event_type, event_severity, event_status, event_description,
          event_category, user_id, session_id, ip_address, user_agent, request_path,
          request_method, module_accessed, banking_type, assigned_to, investigation_notes,
          resolution_details, risk_score, business_impact, compliance_relevant, regulatory_impact,
          metadata, event_timestamp, detected_at, created_at, updated_at
        ) VALUES (
          :id, :tenantId, :eventType, :eventSeverity, :eventStatus, :eventDescription,
          :eventCategory, :userId, :sessionId, :ipAddress, :userAgent, :requestPath,
          :requestMethod, :moduleAccessed, :bankingType, :assignedTo, :investigationNotes,
          :resolutionDetails, :riskScore, :businessImpact, :complianceRelevant, :regulatoryImpact,
          :metadata, :eventTimestamp, :detectedAt, :createdAt, :updatedAt
        ) RETURNING *`,
        {
          replacements: securityEventData,
          type: db.QueryTypes.INSERT,
          transaction
        }
      );

      // Update session tracking with security event count
      if (input.sessionId) {
        await this.incrementSessionSecurityEvents(tenantContext, input.sessionId, transaction);
      }

      return result[0];
    } catch (error) {
      console.error('Error logging security event:', error);
      throw new Error(`Failed to log security event: ${error.message}`);
    }
  }

  // ============================================================================
  // QUERY AND ANALYTICS METHODS
  // ============================================================================

  /**
   * Query user activities with filters
   */
  async queryUserActivities(
    tenantContext: TenantContext,
    filters: ActivityAnalyticsFilters
  ): Promise<{ activities: UserActivityLog[]; total: number; statistics: ActivityStatistics }> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      let whereClause = 'WHERE tenant_id = :tenantId';
      const replacements: any = { tenantId: tenantContext.tenantId };

      // Build where clause based on filters
      if (filters.userId) {
        whereClause += ' AND user_id = :userId';
        replacements.userId = filters.userId;
      }

      if (filters.sessionId) {
        whereClause += ' AND session_id = :sessionId';
        replacements.sessionId = filters.sessionId;
      }

      if (filters.activityType) {
        whereClause += ' AND activity_type = :activityType';
        replacements.activityType = filters.activityType;
      }

      if (filters.actionResult) {
        whereClause += ' AND action_result = :actionResult';
        replacements.actionResult = filters.actionResult;
      }

      if (filters.riskLevel) {
        whereClause += ' AND risk_level = :riskLevel';
        replacements.riskLevel = filters.riskLevel;
      }

      if (filters.bankingType) {
        whereClause += ' AND banking_type = :bankingType';
        replacements.bankingType = filters.bankingType;
      }

      if (filters.complianceRelevant !== undefined) {
        whereClause += ' AND compliance_relevant = :complianceRelevant';
        replacements.complianceRelevant = filters.complianceRelevant;
      }

      if (filters.moduleAccessed) {
        whereClause += ' AND module_accessed = :moduleAccessed';
        replacements.moduleAccessed = filters.moduleAccessed;
      }

      if (filters.ipAddress) {
        whereClause += ' AND ip_address = :ipAddress';
        replacements.ipAddress = filters.ipAddress;
      }

      if (filters.dateFrom) {
        whereClause += ' AND activity_timestamp >= :dateFrom';
        replacements.dateFrom = filters.dateFrom;
      }

      if (filters.dateTo) {
        whereClause += ' AND activity_timestamp <= :dateTo';
        replacements.dateTo = filters.dateTo;
      }

      if (filters.searchTerm) {
        whereClause += ' AND (action_performed ILIKE :searchTerm OR target_entity ILIKE :searchTerm OR module_accessed ILIKE :searchTerm)';
        replacements.searchTerm = `%${filters.searchTerm}%`;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM audit.user_activity_logs ${whereClause}`;
      const countResult = await db.query(countQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });
      const total = countResult[0].total;

      // Get paginated results
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      const sortBy = filters.sortBy || 'activity_timestamp';
      const sortOrder = filters.sortOrder || 'DESC';

      const dataQuery = `
        SELECT * FROM audit.user_activity_logs
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT :limit OFFSET :offset
      `;

      replacements.limit = limit;
      replacements.offset = offset;

      const activities = await db.query(dataQuery, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get statistics
      const statistics = await this.calculateActivityStatistics(tenantContext, filters);

      return { activities, total, statistics };
    } catch (error) {
      console.error('Error querying user activities:', error);
      throw new Error(`Failed to query user activities: ${error.message}`);
    }
  }

  /**
   * Get real-time activity monitoring data
   */
  async getRealTimeActivityMonitoring(
    tenantContext: TenantContext,
    timeWindowMinutes: number = 5
  ): Promise<any> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

      const monitoringData = await db.query(`
        SELECT
          COUNT(*) as total_activities,
          COUNT(CASE WHEN action_result = 'SUCCESS' THEN 1 END) as successful_activities,
          COUNT(CASE WHEN action_result = 'FAILURE' THEN 1 END) as failed_activities,
          COUNT(CASE WHEN risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) as high_risk_activities,
          COUNT(DISTINCT user_id) as active_users,
          COUNT(DISTINCT session_id) as active_sessions,
          AVG(response_time_ms) as avg_response_time,
          MAX(response_time_ms) as max_response_time,
          COUNT(CASE WHEN compliance_relevant = TRUE THEN 1 END) as compliance_activities,
          array_agg(DISTINCT module_accessed) as active_modules,
          json_agg(json_build_object(
            'activity_type', activity_type,
            'count', count
          )) as activity_distribution
        FROM audit.user_activity_logs
        WHERE tenant_id = :tenantId
          AND activity_timestamp >= :timeWindow
        GROUP BY activity_type
      `, {
        replacements: {
          tenantId: tenantContext.tenantId,
          timeWindow
        },
        type: db.QueryTypes.SELECT
      });

      return monitoringData;
    } catch (error) {
      console.error('Error getting real-time monitoring data:', error);
      throw new Error(`Failed to get real-time monitoring data: ${error.message}`);
    }
  }

  /**
   * Generate activity statistics
   */
  async calculateActivityStatistics(
    tenantContext: TenantContext,
    filters: ActivityAnalyticsFilters
  ): Promise<ActivityStatistics> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      let whereClause = 'WHERE tenant_id = :tenantId';
      const replacements: any = { tenantId: tenantContext.tenantId };

      // Apply same filters as main query
      if (filters.dateFrom) {
        whereClause += ' AND activity_timestamp >= :dateFrom';
        replacements.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        whereClause += ' AND activity_timestamp <= :dateTo';
        replacements.dateTo = filters.dateTo;
      }
      if (filters.userId) {
        whereClause += ' AND user_id = :userId';
        replacements.userId = filters.userId;
      }

      // Get basic statistics
      const basicStats = await db.query(`
        SELECT
          COUNT(*) as total_activities,
          COUNT(CASE WHEN action_result = 'SUCCESS' THEN 1 END) as successful_activities,
          COUNT(CASE WHEN action_result = 'FAILURE' THEN 1 END) as failed_activities,
          COUNT(CASE WHEN action_result = 'PARTIAL' THEN 1 END) as partial_activities,
          COUNT(CASE WHEN risk_level = 'CRITICAL' THEN 1 END) as critical_risk_activities,
          COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_activities,
          COUNT(CASE WHEN risk_level = 'MEDIUM' THEN 1 END) as medium_risk_activities,
          COUNT(CASE WHEN risk_level = 'LOW' THEN 1 END) as low_risk_activities,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions,
          AVG(response_time_ms) as avg_response_time,
          MAX(response_time_ms) as max_response_time,
          MIN(response_time_ms) as min_response_time,
          COUNT(CASE WHEN action_result = 'FAILURE' THEN 1 END) as total_errors,
          COUNT(CASE WHEN compliance_relevant = TRUE THEN 1 END) as compliance_activities
        FROM audit.user_activity_logs ${whereClause}
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get top modules
      const topModules = await db.query(`
        SELECT module_accessed, COUNT(*) as count
        FROM audit.user_activity_logs ${whereClause}
        WHERE module_accessed IS NOT NULL
        GROUP BY module_accessed
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get top users
      const topUsers = await db.query(`
        SELECT ual.user_id, u.name as user_name, COUNT(*) as count
        FROM audit.user_activity_logs ual
        LEFT JOIN core.users u ON ual.user_id = u.id
        ${whereClause}
        GROUP BY ual.user_id, u.name
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get hourly distribution
      const hourlyDistribution = await db.query(`
        SELECT EXTRACT(HOUR FROM activity_timestamp) as hour, COUNT(*) as count
        FROM audit.user_activity_logs ${whereClause}
        GROUP BY EXTRACT(HOUR FROM activity_timestamp)
        ORDER BY hour
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get result distribution
      const resultDistribution = await db.query(`
        SELECT action_result, COUNT(*) as count
        FROM audit.user_activity_logs ${whereClause}
        GROUP BY action_result
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      // Get performance metrics
      const performanceMetrics = await db.query(`
        SELECT
          AVG(page_load_time_ms) as avg_page_load_time,
          AVG(server_processing_time_ms) as avg_server_response_time,
          AVG(client_render_time_ms) as avg_client_render_time,
          COUNT(CASE WHEN response_time_ms <= 2000 THEN 1 END) * 100.0 / COUNT(*) as sla_compliance_rate
        FROM audit.user_activity_logs ${whereClause}
      `, {
        replacements,
        type: db.QueryTypes.SELECT
      });

      const stats = basicStats[0] || {};

      return {
        totalActivities: parseInt(stats.total_activities) || 0,
        successfulActivities: parseInt(stats.successful_activities) || 0,
        failedActivities: parseInt(stats.failed_activities) || 0,
        partialActivities: parseInt(stats.partial_activities) || 0,
        criticalRiskActivities: parseInt(stats.critical_risk_activities) || 0,
        highRiskActivities: parseInt(stats.high_risk_activities) || 0,
        mediumRiskActivities: parseInt(stats.medium_risk_activities) || 0,
        lowRiskActivities: parseInt(stats.low_risk_activities) || 0,
        uniqueUsers: parseInt(stats.unique_users) || 0,
        uniqueSessions: parseInt(stats.unique_sessions) || 0,
        avgResponseTime: Math.round(parseFloat(stats.avg_response_time) || 0),
        maxResponseTime: parseInt(stats.max_response_time) || 0,
        minResponseTime: parseInt(stats.min_response_time) || 0,
        totalErrors: parseInt(stats.total_errors) || 0,
        complianceRelevantActivities: parseInt(stats.compliance_activities) || 0,
        topModules: topModules.map(m => ({ module: m.module_accessed, count: parseInt(m.count) })),
        topUsers: topUsers.map(u => ({
          userId: u.user_id,
          userName: u.user_name || 'Unknown User',
          count: parseInt(u.count)
        })),
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: parseInt(hourlyDistribution.find(h => Math.floor(h.hour) === i)?.count || 0)
        })),
        riskDistribution: [
          { risk: 'LOW', count: parseInt(stats.low_risk_activities) || 0 },
          { risk: 'MEDIUM', count: parseInt(stats.medium_risk_activities) || 0 },
          { risk: 'HIGH', count: parseInt(stats.high_risk_activities) || 0 },
          { risk: 'CRITICAL', count: parseInt(stats.critical_risk_activities) || 0 }
        ],
        resultDistribution: resultDistribution.map(r => ({
          result: r.action_result,
          count: parseInt(r.count)
        })),
        bankingTypeDistribution: [], // Would need additional query
        moduleEngagement: [], // Would need additional complex query
        performanceMetrics: {
          avgPageLoadTime: Math.round(parseFloat(performanceMetrics[0]?.avg_page_load_time) || 0),
          avgServerResponseTime: Math.round(parseFloat(performanceMetrics[0]?.avg_server_response_time) || 0),
          avgClientRenderTime: Math.round(parseFloat(performanceMetrics[0]?.avg_client_render_time) || 0),
          slaComplianceRate: Math.round(parseFloat(performanceMetrics[0]?.sla_compliance_rate) || 0)
        }
      };
    } catch (error) {
      console.error('Error calculating activity statistics:', error);
      throw new Error(`Failed to calculate activity statistics: ${error.message}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Enrich activity input with additional data
   */
  private async enrichActivityInput(tenantContext: TenantContext, input: UserActivityInput): Promise<any> {
    const enriched = { ...input };

    // Add geolocation data if enabled
    if (this.config.enableGeolocationTracking && input.ipAddress) {
      try {
        const geoData = await this.getGeolocationData(input.ipAddress);
        enriched.countryCode = geoData.countryCode;
        enriched.countryName = geoData.countryName;
        enriched.city = geoData.city;
      } catch (error) {
        console.warn('Failed to get geolocation data:', error);
      }
    }

    // Parse user agent for device/browser info
    if (input.userAgent && (!input.deviceType || !input.browserName)) {
      const userAgentData = this.parseUserAgent(input.userAgent);
      enriched.deviceType = input.deviceType || userAgentData.deviceType;
      enriched.browserName = input.browserName || userAgentData.browserName;
      enriched.browserVersion = input.browserVersion || userAgentData.browserVersion;
      enriched.osName = input.osName || userAgentData.osName;
      enriched.osVersion = input.osVersion || userAgentData.osVersion;
    }

    return enriched;
  }

  /**
   * Get geolocation data from IP address
   */
  private async getGeolocationData(ipAddress: string): Promise<any> {
    // This would integrate with a geolocation service like MaxMind GeoIP2
    // For now, return placeholder data
    return {
      countryCode: 'ID',
      countryName: 'Indonesia',
      city: 'Jakarta'
    };
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent: string): any {
    // Simple user agent parsing - in production would use a proper parser library
    const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)\/(\d+\.\d+)/);
    const osMatch = userAgent.match(/\(([^)]+)\)/);

    return {
      deviceType: /Mobile|Android|iPhone/.test(userAgent) ? 'Mobile' : 'Desktop',
      browserName: browserMatch ? browserMatch[1] : 'Unknown',
      browserVersion: browserMatch ? browserMatch[2] : 'Unknown',
      osName: osMatch ? osMatch[1].split(';')[0].trim() : 'Unknown',
      osVersion: 'Unknown'
    };
  }

  /**
   * Generate activity description
   */
  private generateActivityDescription(input: UserActivityInput): string {
    return `${input.activityType}: ${input.actionPerformed}${input.targetEntity ? ` on ${input.targetEntity}` : ''}`;
  }

  /**
   * Calculate risk level for activity
   */
  private calculateRiskLevel(input: UserActivityInput): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (input.riskLevel) {
      return input.riskLevel;
    }

    // Default risk calculation logic
    if (input.actionResult === 'FAILURE' && input.complianceRelevant) {
      return 'HIGH';
    }

    if (input.actionResult === 'FAILURE') {
      return 'MEDIUM';
    }

    if (input.complianceRelevant || input.regulatoryImpact) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Check if activity is compliance relevant
   */
  private isComplianceRelevant(input: UserActivityInput): boolean {
    const complianceActivities = [
      'USER_MANAGEMENT', 'CONFIGURATION_CHANGE', 'DATA_EXPORT',
      'FINANCIAL_CALCULATION', 'APPROVAL_ACTION', 'SECURITY'
    ];

    return complianceActivities.includes(input.activityType) ||
           input.moduleAccessed?.includes('Configuration') ||
           input.moduleAccessed?.includes('User Management');
  }

  /**
   * Check if activity has regulatory impact
   */
  private isRegulatoryImpact(input: UserActivityInput): boolean {
    const regulatoryActivities = [
      'FINANCIAL_CALCULATION', 'REGULATORY_REPORT', 'COMPLIANCE_AUDIT'
    ];

    return regulatoryActivities.includes(input.activityType) ||
           input.businessProcess?.includes('Regulatory') ||
           input.businessProcess?.includes('Compliance');
  }

  /**
   * Classify data sensitivity
   */
  private classifyData(input: UserActivityInput): string {
    const sensitiveKeywords = ['customer', 'account', 'financial', 'personal', 'payment'];

    if (sensitiveKeywords.some(keyword =>
      input.actionPerformed.toLowerCase().includes(keyword) ||
      input.targetEntity?.toLowerCase().includes(keyword)
    )) {
      return 'SENSITIVE';
    }

    return 'NORMAL';
  }

  /**
   * Categorize performance
   */
  private categorizePerformance(responseTimeMs: number): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'CRITICAL' {
    if (responseTimeMs <= 500) return 'EXCELLENT';
    if (responseTimeMs <= 1000) return 'GOOD';
    if (responseTimeMs <= 2000) return 'AVERAGE';
    if (responseTimeMs <= 5000) return 'POOR';
    return 'CRITICAL';
  }

  /**
   * Detect security events from activity
   */
  private async detectSecurityEvents(tenantContext: TenantContext, activity: any, transaction?: Transaction): Promise<void> {
    // Check for failed login attempts
    if (activity.activityType === 'AUTHENTICATION' && activity.actionResult === 'FAILURE') {
      await this.logSecurityEvent(tenantContext, {
        eventType: 'FAILED_LOGIN',
        eventSeverity: 'MEDIUM',
        eventDescription: `Failed login attempt for user ${activity.userId}`,
        eventCategory: 'Authentication',
        userId: activity.userId,
        sessionId: activity.sessionId,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        requestPath: activity.requestPath,
        requestMethod: activity.requestMethod,
        complianceRelevant: true,
        metadata: {
          activityId: activity.id,
          errorMessage: activity.errorMessage
        }
      }, transaction);
    }

    // Check for suspicious activities
    if (activity.riskLevel === 'CRITICAL') {
      await this.logSecurityEvent(tenantContext, {
        eventType: 'SUSPICIOUS_ACTIVITY',
        eventSeverity: 'HIGH',
        eventDescription: `Critical risk activity detected: ${activity.actionPerformed}`,
        eventCategory: 'Security',
        userId: activity.userId,
        sessionId: activity.sessionId,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        requestPath: activity.requestPath,
        requestMethod: activity.requestMethod,
        moduleAccessed: activity.moduleAccessed,
        complianceRelevant: true,
        regulatoryImpact: true,
        riskScore: 80,
        businessImpact: 'HIGH',
        metadata: {
          activityId: activity.id,
          riskLevel: activity.riskLevel
        }
      }, transaction);
    }
  }

  /**
   * Calculate security risk score
   */
  private calculateSecurityRiskScore(input: SecurityEventInput): number {
    let score = 0;

    // Base score from severity
    switch (input.eventSeverity) {
      case 'CRITICAL': score += 80; break;
      case 'HIGH': score += 60; break;
      case 'MEDIUM': score += 40; break;
      case 'LOW': score += 20; break;
    }

    // Add score for certain event types
    const highRiskEvents = ['UNAUTHORIZED_ACCESS', 'DATA_BREACH', 'PRIVILEGE_ESCALATION'];
    if (highRiskEvents.includes(input.eventType)) {
      score += 20;
    }

    // Add score for compliance relevance
    if (input.complianceRelevant || input.regulatoryImpact) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(input: SecurityEventInput): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (input.eventSeverity === 'CRITICAL') return 'CRITICAL';
    if (input.eventSeverity === 'HIGH') return 'HIGH';

    const highImpactEvents = ['DATA_BREACH', 'SYSTEM_COMPROMISE', 'FINANCIAL_FRAUD'];
    if (highImpactEvents.includes(input.eventType)) {
      return 'CRITICAL';
    }

    const mediumImpactEvents = ['UNAUTHORIZED_ACCESS', 'PRIVILEGE_ESCALATION'];
    if (mediumImpactEvents.includes(input.eventType)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Check if security event is compliance relevant
   */
  private isComplianceRelevantSecurityEvent(input: SecurityEventInput): boolean {
    const complianceEvents = [
      'DATA_BREACH', 'UNAUTHORIZED_ACCESS', 'PRIVILEGE_ESCALATION',
      'FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY'
    ];

    return complianceEvents.includes(input.eventType) ||
           input.eventCategory === 'Compliance' ||
           input.eventCategory === 'Regulatory';
  }

  /**
   * Check if security event has regulatory impact
   */
  private isRegulatoryImpactSecurityEvent(input: SecurityEventInput): boolean {
    const regulatoryEvents = [
      'DATA_BREACH', 'SYSTEM_COMPROMISE', 'FINANCIAL_FRAUD',
      'REGULATORY_VIOLATION', 'COMPLIANCE_BREACH'
    ];

    return regulatoryEvents.includes(input.eventType) ||
           input.eventCategory === 'Regulatory';
  }

  /**
   * Increment session security events count
   */
  private async incrementSessionSecurityEvents(tenantContext: TenantContext, sessionId: string, transaction?: Transaction): Promise<void> {
    try {
      const db = await this.databaseService.getTenantDatabase(tenantContext.tenantId);

      await db.query(
        'UPDATE audit.session_tracking SET security_events = security_events + 1 WHERE session_id = :sessionId',
        {
          replacements: { sessionId },
          type: db.QueryTypes.UPDATE,
          transaction
        }
      );
    } catch (error) {
      console.warn('Error incrementing session security events:', error);
    }
  }

  /**
   * Export user activities data
   */
  async exportUserActivities(
    tenantContext: TenantContext,
    filters: ActivityAnalyticsFilters,
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): Promise<any> {
    try {
      // Get all matching activities (no pagination for export)
      const exportFilters = { ...filters, limit: 10000, offset: 0 };
      const result = await this.queryUserActivities(tenantContext, exportFilters);

      const exportData = result.activities.map(activity => ({
        id: activity.id,
        timestamp: activity.activityTimestamp,
        userId: activity.userId,
        sessionId: activity.sessionId,
        activityType: activity.activityType,
        actionPerformed: activity.actionPerformed,
        targetEntity: activity.targetEntity,
        targetId: activity.targetId,
        pageUrl: activity.pageUrl,
        moduleAccessed: activity.moduleAccessed,
        actionResult: activity.actionResult,
        errorMessage: activity.errorMessage,
        responseTimeMs: activity.responseTimeMs,
        ipAddress: activity.ipAddress,
        deviceType: activity.deviceType,
        browserName: activity.browserName,
        bankingType: activity.bankingType,
        riskLevel: activity.riskLevel,
        complianceRelevant: activity.complianceRelevant,
        metadata: activity.metadata
      }));

      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === 'json') {
        return {
          data: exportData,
          filename: `user-activities-${tenantContext.tenantSlug}-${timestamp}.json`,
          contentType: 'application/json'
        };
      }

      if (format === 'csv') {
        const csv = this.convertToCSV(exportData);
        return {
          data: csv,
          filename: `user-activities-${tenantContext.tenantSlug}-${timestamp}.csv`,
          contentType: 'text/csv'
        };
      }

      // Excel format would require additional library implementation
      return {
        data: exportData,
        filename: `user-activities-${tenantContext.tenantSlug}-${timestamp}.json`,
        contentType: 'application/json'
      };
    } catch (error) {
      console.error('Error exporting user activities:', error);
      throw new Error(`Failed to export user activities: ${error.message}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const csvRow = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
  }
}

export default UserActivityService;