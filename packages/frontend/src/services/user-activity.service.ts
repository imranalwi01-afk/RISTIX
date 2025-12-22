// packages/frontend/src/services/user-activity.service.ts
// ============================================================================
// USER ACTIVITY TRACKING API SERVICE - IAF IFRS9 PLATFORM
// ============================================================================
// Purpose: Frontend service for user activity tracking API integration
// Author: Generated for IAF IFRS9 Step 01 Implementation
// Date: 2025-01-11

import { apiClient } from './api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface UserActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  sessionId: string;
  correlationId: string;
  activityType: string;
  actionPerformed: string;
  activityDescription?: string;
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
  countryCode?: string;
  countryName?: string;
  city?: string;
  userAgent?: string;
  deviceType?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  osVersion?: string;
  moduleAccessed?: string;
  businessProcess?: string;
  bankingType?: 'conventional' | 'syariah' | 'dual';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceRelevant: boolean;
  regulatoryImpact: boolean;
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
  activityTimestamp: string;
  createdAt: string;
}

export interface SessionTracking {
  id: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  sessionStart: string;
  sessionEnd?: string;
  sessionDurationMs?: number;
  sessionStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'TERMINATED' | 'TIMEOUT';
  firstPageVisited?: string;
  lastPageVisited?: string;
  totalPageViews: number;
  totalActions: number;
  totalErrors: number;
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
  createdAt: string;
  updatedAt: string;
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

export interface ActivityFilters {
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

export interface ActivityQueryResult {
  activities: UserActivityLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  statistics: ActivityStatistics;
  filters: ActivityFilters;
}

export interface RealTimeMonitoringData {
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  highRiskActivities: number;
  activeUsers: number;
  activeSessions: number;
  avgResponseTime: number;
  maxResponseTime: number;
  complianceActivities: number;
  activeModules: string[];
  activityDistribution: any[];
}

export interface PerformanceAnalytics {
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  slaComplianceRate: number;
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    critical: number;
  };
}

export interface SecurityEvent {
  id: string;
  tenantId: string;
  eventType: string;
  eventSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventStatus: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
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
  eventTimestamp: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  reportType: string;
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  generatedBy?: string;
  tenantId: string;
  data: any;
  summary: {
    totalRecords: number;
    complianceScore: number;
    riskLevel: string;
    recommendations: string[];
  };
  totalRecords: number;
}

export interface DashboardData {
  summary: ActivityStatistics;
  realTime: RealTimeMonitoringData;
  performance: PerformanceAnalytics;
  recentActivities: UserActivityLog[];
  alerts: DashboardAlert[];
  period: string;
  timestamp: string;
}

export interface DashboardAlert {
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
}

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
  requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  apiEndpoint?: string;
  actionResult: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  errorMessage?: string;
  errorCode?: string;
  responseTimeMs?: number;
  serverProcessingTimeMs?: number;
  clientRenderTimeMs?: number;
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
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
  requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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

// ============================================================================
// USER ACTIVITY SERVICE CLASS
// ============================================================================

class UserActivityService {
  private readonly baseUrl = '/api/v1/user-activity';

  // ============================================================================
  // USER ACTIVITY LOGGING METHODS
  // ============================================================================

  /**
   * Log user activity
   */
  async logUserActivity(input: UserActivityInput): Promise<UserActivityLog> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/logs`, input);
      return response.data.data;
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  }

  /**
   * Log multiple user activities (batch)
   */
  async logBatchUserActivities(activities: UserActivityInput[]): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/logs/batch`, { activities });
      return response.data.data;
    } catch (error) {
      console.error('Error logging batch user activities:', error);
      throw error;
    }
  }

  // ============================================================================
  // SESSION TRACKING METHODS
  // ============================================================================

  /**
   * Track or update session
   */
  async trackSession(input: SessionTrackingInput): Promise<SessionTracking> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sessions`, input);
      return response.data.data;
    } catch (error) {
      console.error('Error tracking session:', error);
      throw error;
    }
  }

  /**
   * Get session details
   */
  async getSessionDetails(sessionId: string): Promise<{
    session: SessionTracking;
    activities: UserActivityLog[];
    statistics: ActivityStatistics;
    totalActivities: number;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting session details:', error);
      throw error;
    }
  }

  // ============================================================================
  // ACTIVITY QUERY METHODS
  // ============================================================================

  /**
   * Query user activities
   */
  async queryActivities(filters: ActivityFilters): Promise<ActivityQueryResult> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/activities`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error querying activities:', error);
      throw error;
    }
  }

  /**
   * Get user activity statistics
   */
  async getActivityStatistics(filters?: Partial<ActivityFilters>): Promise<ActivityStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      throw error;
    }
  }

  // ============================================================================
  // REAL-TIME MONITORING METHODS
  // ============================================================================

  /**
   * Get real-time activity monitoring
   */
  async getRealTimeMonitoring(timeWindowMinutes: number = 5): Promise<RealTimeMonitoringData> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/real-time`, {
        params: { timeWindowMinutes }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting real-time monitoring data:', error);
      throw error;
    }
  }

  /**
   * Get live activity feed (Server-Sent Events)
   */
  getLiveActivityFeed(
    timeWindowMinutes: number = 15,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'HIGH',
    limit: number = 20,
    onMessage: (data: any) => void,
    onError: (error: any) => void
  ): EventSource | null {
    try {
      const url = new URL(`${this.baseUrl}/live-feed`, apiClient.defaults.baseURL);
      url.searchParams.set('timeWindowMinutes', timeWindowMinutes.toString());
      url.searchParams.set('riskLevel', riskLevel);
      url.searchParams.set('limit', limit.toString());

      const eventSource = new EventSource(url.toString());

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing live feed data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Live feed error:', error);
        onError(error);
      };

      return eventSource;
    } catch (error) {
      console.error('Error creating live activity feed:', error);
      onError(error);
      return null;
    }
  }

  // ============================================================================
  // PERFORMANCE MONITORING METHODS
  // ============================================================================

  /**
   * Log performance metrics
   */
  async logPerformanceMetrics(input: PerformanceMetricsInput): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/performance`, input);
      return response.data.data;
    } catch (error) {
      console.error('Error logging performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(
    period: '1h' | '24h' | '7d' | '30d' = '24h',
    module?: string
  ): Promise<PerformanceAnalytics> {
    try {
      const params: any = { period };
      if (module) {
        params.module = module;
      }

      const response = await apiClient.get(`${this.baseUrl}/performance/analytics`, { params });
      return response.data.data.performance;
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      throw error;
    }
  }

  // ============================================================================
  // SECURITY EVENT METHODS
  // ============================================================================

  /**
   * Log security event
   */
  async logSecurityEvent(input: SecurityEventInput): Promise<SecurityEvent> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/security/events`, input);
      return response.data.data;
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    filters?: {
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    data: SecurityEvent[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/security/events`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error getting security events:', error);
      throw error;
    }
  }

  // ============================================================================
  // EXPORT METHODS
  // ============================================================================

  /**
   * Export user activities
   */
  async exportUserActivities(
    filters: ActivityFilters,
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): Promise<void> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export`, {
        params: { ...filters, format },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `user-activities.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting user activities:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: 'GDPR' | 'SOX' | 'BASEL' | 'AAOIFI' | 'INTERNAL_AUDIT',
    dateFrom: string,
    dateTo: string,
    format: 'json' | 'pdf' = 'json'
  ): Promise<ComplianceReport> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/compliance/reports`, {
        reportType,
        dateFrom,
        dateTo,
        format
      });
      return response.data.data;
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  // ============================================================================
  // DASHBOARD METHODS
  // ============================================================================

  /**
   * Get dashboard data
   */
  async getDashboardData(period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<DashboardData> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/dashboard`, {
        params: { period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // ============================================================================
  // HEALTH CHECK METHODS
  // ============================================================================

  /**
   * Check service health
   */
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    service: string;
    version: string;
    tenantId?: string;
    features: {
      realTimeMonitoring: boolean;
      performanceMonitoring: boolean;
      securityEventDetection: boolean;
      complianceReporting: boolean;
      geolocationTracking: boolean;
      sessionTracking: boolean;
    };
    endpoints: string[];
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/health`);
      return response.data.data;
    } catch (error) {
      console.error('Error checking service health:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Auto-logout user activity tracking on component unmount
   */
  autoLogoutTracking(sessionId: string): void {
    try {
      this.trackSession({
        sessionId,
        sessionStatus: 'TERMINATED',
        sessionEnd: new Date()
      }).catch(error => {
        console.warn('Error auto-logging session termination:', error);
      });
    } catch (error) {
      console.warn('Error in auto-logout tracking:', error);
    }
  }

  /**
   * Track page view with automatic performance monitoring
   */
  trackPageView(
    sessionId: string,
    userId: string,
    pageUrl: string,
    moduleAccessed: string,
    additionalData?: any
  ): void {
    try {
      const startTime = performance.now();

      // Log page view start
      this.logUserActivity({
        userId,
        sessionId,
        activityType: 'PAGE_VIEW',
        actionPerformed: `View ${moduleAccessed}`,
        pageUrl,
        moduleAccessed,
        actionResult: 'SUCCESS',
        metadata: {
          ...additionalData,
          pageLoadStartTime: startTime
        }
      }).catch(error => {
        console.warn('Error tracking page view:', error);
      });

      // Auto-log page load completion
      const handlePageLoad = () => {
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);

        this.logUserActivity({
          userId,
          sessionId,
          activityType: 'PAGE_LOAD',
          actionPerformed: `Page loaded: ${moduleAccessed}`,
          pageUrl,
          moduleAccessed,
          actionResult: 'SUCCESS',
          responseTimeMs: loadTime,
          clientRenderTimeMs: loadTime,
          metadata: {
            ...additionalData,
            pageLoadStartTime: startTime,
            pageLoadEndTime: endTime
          }
        }).catch(error => {
          console.warn('Error tracking page load:', error);
        });
      };

      // Handle page load events
      if (document.readyState === 'complete') {
        handlePageLoad();
      } else {
        window.addEventListener('load', handlePageLoad, { once: true });
      }
    } catch (error) {
      console.warn('Error in page view tracking:', error);
    }
  }

  /**
   * Track user interaction with automatic performance measurement
   */
  trackUserInteraction(
    sessionId: string,
    userId: string,
    activityType: string,
    actionPerformed: string,
    targetEntity?: string,
    targetId?: string,
    moduleAccessed?: string,
    additionalData?: any
  ): void {
    try {
      const startTime = performance.now();

      // Log interaction start
      this.logUserActivity({
        userId,
        sessionId,
        activityType,
        actionPerformed,
        targetEntity,
        targetId,
        moduleAccessed,
        actionResult: 'SUCCESS',
        metadata: {
          ...additionalData,
          interactionStartTime: startTime
        }
      }).catch(error => {
        console.warn('Error tracking user interaction:', error);
      });

      // Simulate interaction completion (in real implementation, this would be called after the action completes)
      setTimeout(() => {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        this.logUserActivity({
          userId,
          sessionId,
          activityType: `${activityType}_COMPLETE`,
          actionPerformed: `${actionPerformed} (completed)`,
          targetEntity,
          targetId,
          moduleAccessed,
          actionResult: 'SUCCESS',
          responseTimeMs: duration,
          metadata: {
            ...additionalData,
            interactionStartTime: startTime,
            interactionEndTime: endTime
          }
        }).catch(error => {
          console.warn('Error tracking interaction completion:', error);
        });
      }, 100); // Simulated interaction time
    } catch (error) {
      console.warn('Error in user interaction tracking:', error);
    }
  }

  /**
   * Track error with context
   */
  trackError(
    sessionId: string,
    userId: string,
    error: Error | string,
    context?: {
      activityType?: string;
      actionPerformed?: string;
      moduleAccessed?: string;
      targetEntity?: string;
      additionalData?: any;
    }
  ): void {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const stackTrace = typeof error === 'object' ? error.stack : undefined;

      this.logUserActivity({
        userId,
        sessionId,
        activityType: context?.activityType || 'ERROR',
        actionPerformed: context?.actionPerformed || 'System Error',
        targetEntity: context?.targetEntity,
        moduleAccessed: context?.moduleAccessed,
        actionResult: 'FAILURE',
        errorMessage,
        errorCode: typeof error === 'object' ? error.name : undefined,
        riskLevel: 'HIGH',
        complianceRelevant: true,
        metadata: {
          ...context?.additionalData,
          stackTrace,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      }).catch(error => {
        console.warn('Error tracking error:', error);
      });
    } catch (error) {
      console.warn('Error in error tracking:', error);
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const userActivityService = new UserActivityService();

export default UserActivityService;