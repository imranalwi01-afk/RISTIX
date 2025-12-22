// packages/backend/src/test/user-activity-tracking.test.ts
// ============================================================================
// COMPREHENSIVE USER ACTIVITY TRACKING TEST SUITE - IAF IFRS9 PLATFORM
// ============================================================================
// Purpose: Test the complete user activity tracking system with real database integration
// Author: Generated for IAF IFRS9 Step 01 Implementation
// Date: 2025-01-11

import { DatabaseManager } from '../../config/database';
import { UserActivityService } from '../../core/services/user-activity/user-activity.service';
import { AuditService } from '../../core/services/audit/audit.service';
import { TenantContext } from '../../types/tenant.types';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  tenantId: 'iaf',
  tenantSlug: 'iaf',
  bankingType: 'conventional' as const,
  testUser: {
    id: 'test-user-id-001',
    name: 'Test User',
    email: 'test@iaf.com'
  },
  testSession: {
    id: 'test-session-id-001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

// ============================================================================
// USER ACTIVITY TRACKING TEST SUITE
// ============================================================================

class UserActivityTrackingTestSuite {
  private databaseManager: DatabaseManager;
  private userActivityService: UserActivityService;
  private auditService: AuditService;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.userActivityService = new UserActivityService();
    this.auditService = new AuditService(this.databaseManager);
  }

  /**
   * Run complete test suite
   */
  async runTestSuite(): Promise<void> {
    console.log('🚀 Starting User Activity Tracking Test Suite');
    console.log('==================================================');

    try {
      // Initialize database connections
      await this.initializeDatabase();

      // Run individual test modules
      await this.testDatabaseSchema();
      await this.testUserActivityLogging();
      await this.testSessionTracking();
      await this.testPerformanceMetrics();
      await this.testSecurityEvents();
      await this.testRealTimeMonitoring();
      await this.testActivityQueries();
      await this.testComplianceReporting();
      await this.testDataExport();

      console.log('✅ All tests completed successfully!');

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    }
  }

  /**
   * Initialize database connections
   */
  private async initializeDatabase(): Promise<void> {
    console.log('📊 Initializing database connections...');

    try {
      await this.databaseManager.initializeConnections();

      // Test database health
      const healthStatus = await this.databaseManager.healthCheck();

      if (healthStatus.status !== 'healthy') {
        throw new Error(`Database not healthy: ${healthStatus.status}`);
      }

      console.log('✅ Database connections initialized successfully');
      console.log(`   - Platform DB: ${healthStatus.platform ? '✅' : '❌'}`);
      console.log(`   - Shared DB: ${healthStatus.shared ? '✅' : '❌'}`);
      console.log(`   - FRS9 DB: ${healthStatus.frs9_legacy ? '✅' : '❌'}`);
      console.log(`   - Tenant DBs: ${Object.keys(healthStatus.tenants || {}).length} connected`);

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Test database schema
   */
  private async testDatabaseSchema(): Promise<void> {
    console.log('🗄️ Testing database schema...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      const db = tenantContext.database;

      // Test user activity logs table
      const activityTableCheck = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'audit' AND table_name = 'user_activity_logs'
        ORDER BY ordinal_position
      `, {
        type: db.QueryTypes.SELECT
      });

      if (activityTableCheck.length === 0) {
        throw new Error('user_activity_logs table not found in audit schema');
      }

      console.log(`✅ user_activity_logs table: ${activityTableCheck.length} columns`);

      // Test session tracking table
      const sessionTableCheck = await db.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'audit' AND table_name = 'session_tracking'
      `, {
        type: db.QueryTypes.SELECT
      });

      if (sessionTableCheck[0].count === 0) {
        throw new Error('session_tracking table not found in audit schema');
      }

      console.log('✅ session_tracking table exists');

      // Test performance metrics table
      const performanceTableCheck = await db.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'audit' AND table_name = 'performance_metrics'
      `, {
        type: db.QueryTypes.SELECT
      });

      if (performanceTableCheck[0].count === 0) {
        throw new Error('performance_metrics table not found in audit schema');
      }

      console.log('✅ performance_metrics table exists');

      // Test security events table
      const securityTableCheck = await db.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'audit' AND table_name = 'security_events'
      `, {
        type: db.QueryTypes.SELECT
      });

      if (securityTableCheck[0].count === 0) {
        throw new Error('security_events table not found in audit schema');
      }

      console.log('✅ security_events table exists');

      console.log('✅ Database schema validation completed');

    } catch (error) {
      console.error('❌ Database schema test failed:', error);
      throw error;
    }
  }

  /**
   * Test user activity logging
   */
  private async testUserActivityLogging(): Promise<void> {
    console.log('📝 Testing user activity logging...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test basic activity logging
      const activityLog = await this.userActivityService.logUserActivity(tenantContext, {
        userId: TEST_CONFIG.testUser.id,
        sessionId: TEST_CONFIG.testSession.id,
        activityType: 'USER_LOGIN',
        actionPerformed: 'User logged in to system',
        pageUrl: '/dashboard',
        requestPath: '/api/v1/auth/login',
        requestMethod: 'POST',
        actionResult: 'SUCCESS',
        responseTimeMs: 250,
        ipAddress: TEST_CONFIG.testSession.ipAddress,
        userAgent: TEST_CONFIG.testSession.userAgent,
        moduleAccessed: 'Authentication',
        bankingType: TEST_CONFIG.bankingType,
        complianceRelevant: true,
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });

      if (!activityLog || !activityLog.id) {
        throw new Error('Failed to create activity log');
      }

      console.log(`✅ Activity log created: ${activityLog.id}`);
      console.log(`   - Activity Type: ${activityLog.activityType}`);
      console.log(`   - Risk Level: ${activityLog.riskLevel}`);
      console.log(`   - Compliance Relevant: ${activityLog.complianceRelevant}`);

      // Test batch activity logging
      const batchActivities = [
        {
          userId: TEST_CONFIG.testUser.id,
          sessionId: TEST_CONFIG.testSession.id,
          activityType: 'PAGE_VIEW',
          actionPerformed: 'Viewed dashboard',
          pageUrl: '/dashboard',
          actionResult: 'SUCCESS',
          responseTimeMs: 150,
          moduleAccessed: 'Dashboard'
        },
        {
          userId: TEST_CONFIG.testUser.id,
          sessionId: TEST_CONFIG.testSession.id,
          activityType: 'DATA_ACCESS',
          actionPerformed: 'Accessed portfolio data',
          pageUrl: '/portfolio',
          actionResult: 'SUCCESS',
          responseTimeMs: 320,
          moduleAccessed: 'Portfolio',
          complianceRelevant: true
        }
      ];

      for (const activity of batchActivities) {
        const result = await this.userActivityService.logUserActivity(tenantContext, activity);
        if (!result || !result.id) {
          throw new Error('Failed to create batch activity log');
        }
      }

      console.log('✅ Batch activity logging completed');

    } catch (error) {
      console.error('❌ User activity logging test failed:', error);
      throw error;
    }
  }

  /**
   * Test session tracking
   */
  private async testSessionTracking(): Promise<void> {
    console.log('🔄 Testing session tracking...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test session creation
      const sessionData = await this.userActivityService.trackSession(tenantContext, {
        sessionId: TEST_CONFIG.testSession.id,
        userId: TEST_CONFIG.testUser.id,
        sessionStart: new Date(),
        firstPageVisited: '/dashboard',
        lastPageVisited: '/portfolio',
        totalPageViews: 5,
        totalActions: 12,
        totalErrors: 0,
        ipAddress: TEST_CONFIG.testSession.ipAddress,
        userAgent: TEST_CONFIG.testSession.userAgent,
        deviceType: 'Desktop',
        browserName: 'Chrome',
        bankingType: TEST_CONFIG.bankingType,
        riskScore: 15,
        userEngagementScore: 85
      });

      if (!sessionData || !sessionData.id) {
        throw new Error('Failed to track session');
      }

      console.log(`✅ Session tracked: ${sessionData.id}`);
      console.log(`   - User ID: ${sessionData.userId}`);
      console.log(`   - Page Views: ${sessionData.totalPageViews}`);
      console.log(`   - Risk Score: ${sessionData.riskScore}`);

      // Test session update
      const updatedSession = await this.userActivityService.trackSession(tenantContext, {
        sessionId: TEST_CONFIG.testSession.id,
        totalPageViews: 8,
        totalActions: 18,
        lastPageVisited: '/reports',
        userEngagementScore: 90
      });

      if (!updatedSession) {
        throw new Error('Failed to update session');
      }

      console.log('✅ Session update completed');

    } catch (error) {
      console.error('❌ Session tracking test failed:', error);
      throw error;
    }
  }

  /**
   * Test performance metrics
   */
  private async testPerformanceMetrics(): Promise<void> {
    console.log('⚡ Testing performance metrics...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test performance metrics logging
      const performanceData = await this.userActivityService.logPerformanceMetrics(tenantContext, {
        sessionId: TEST_CONFIG.testSession.id,
        metricType: 'API_PERFORMANCE',
        metricName: 'Portfolio Data Load',
        startTime: new Date(Date.now() - 500),
        endTime: new Date(),
        durationMs: 500,
        memoryUsageMb: 128,
        cpuUsagePercent: 25,
        databaseQueryTimeMs: 150,
        databaseQueriesCount: 5,
        databaseRowsAffected: 50,
        apiEndpoint: '/api/v1/portfolio/accounts',
        httpMethod: 'GET',
        httpStatusCode: 200,
        responseSizeBytes: 102400,
        pageLoadTimeMs: 300,
        moduleAccessed: 'Portfolio',
        bankingType: TEST_CONFIG.bankingType,
        performanceCategory: 'GOOD',
        slaCompliance: true
      });

      if (!performanceData || !performanceData.id) {
        throw new Error('Failed to log performance metrics');
      }

      console.log(`✅ Performance metrics logged: ${performanceData.id}`);
      console.log(`   - Duration: ${performanceData.durationMs}ms`);
      console.log(`   - Performance Category: ${performanceData.performanceCategory}`);
      console.log(`   - SLA Compliance: ${performanceData.slaCompliance}`);

    } catch (error) {
      console.error('❌ Performance metrics test failed:', error);
      throw error;
    }
  }

  /**
   * Test security events
   */
  private async testSecurityEvents(): Promise<void> {
    console.log('🔒 Testing security events...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test security event logging
      const securityEvent = await this.userActivityService.logSecurityEvent(tenantContext, {
        eventType: 'SUSPICIOUS_LOGIN',
        eventSeverity: 'MEDIUM',
        eventDescription: 'Multiple failed login attempts detected',
        eventCategory: 'Authentication',
        userId: TEST_CONFIG.testUser.id,
        sessionId: TEST_CONFIG.testSession.id,
        ipAddress: '192.168.1.200',
        userAgent: 'Suspicious User Agent',
        requestPath: '/api/v1/auth/login',
        requestMethod: 'POST',
        moduleAccessed: 'Authentication',
        bankingType: TEST_CONFIG.bankingType,
        complianceRelevant: true,
        regulatoryImpact: false,
        riskScore: 65,
        businessImpact: 'MEDIUM',
        metadata: {
          failedAttempts: 3,
          lockoutDuration: 300,
          lastAttemptTime: new Date().toISOString()
        }
      });

      if (!securityEvent || !securityEvent.id) {
        throw new Error('Failed to log security event');
      }

      console.log(`✅ Security event logged: ${securityEvent.id}`);
      console.log(`   - Event Type: ${securityEvent.eventType}`);
      console.log(`   - Severity: ${securityEvent.eventSeverity}`);
      console.log(`   - Risk Score: ${securityEvent.riskScore}`);

      // Test critical security event
      const criticalEvent = await this.userActivityService.logSecurityEvent(tenantContext, {
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        eventSeverity: 'CRITICAL',
        eventDescription: 'Unauthorized access attempt to sensitive data',
        eventCategory: 'Security',
        userId: 'unknown-attacker',
        ipAddress: '10.0.0.1',
        requestPath: '/api/v1/admin/users',
        requestMethod: 'GET',
        moduleAccessed: 'Admin',
        complianceRelevant: true,
        regulatoryImpact: true,
        riskScore: 95,
        businessImpact: 'CRITICAL',
        metadata: {
          attemptedEndpoint: '/admin/users',
          attackVector: 'SQL Injection',
          blockedByFirewall: true
        }
      });

      if (!criticalEvent || !criticalEvent.id) {
        throw new Error('Failed to log critical security event');
      }

      console.log(`✅ Critical security event logged: ${criticalEvent.id}`);

    } catch (error) {
      console.error('❌ Security events test failed:', error);
      throw error;
    }
  }

  /**
   * Test real-time monitoring
   */
  private async testRealTimeMonitoring(): Promise<void> {
    console.log('📊 Testing real-time monitoring...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test real-time monitoring data
      const monitoringData = await this.userActivityService.getRealTimeActivityMonitoring(tenantContext, 5);

      if (!monitoringData) {
        throw new Error('Failed to get real-time monitoring data');
      }

      console.log('✅ Real-time monitoring data retrieved');
      console.log(`   - Time Window: 5 minutes`);
      console.log(`   - Data Points: ${Array.isArray(monitoringData) ? monitoringData.length : 'Object'}`);

    } catch (error) {
      console.error('❌ Real-time monitoring test failed:', error);
      throw error;
    }
  }

  /**
   * Test activity queries
   */
  private async testActivityQueries(): Promise<void> {
    console.log('🔍 Testing activity queries...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test activity query with filters
      const queryResult = await this.userActivityService.queryUserActivities(tenantContext, {
        userId: TEST_CONFIG.testUser.id,
        activityType: 'USER_LOGIN',
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        dateTo: new Date(),
        limit: 10,
        offset: 0,
        sortBy: 'activity_timestamp',
        sortOrder: 'DESC'
      });

      if (!queryResult) {
        throw new Error('Failed to query activities');
      }

      console.log('✅ Activity query completed');
      console.log(`   - Total Activities: ${queryResult.total}`);
      console.log(`   - Retrieved: ${queryResult.activities.length}`);
      console.log(`   - Statistics Available: ${queryResult.statistics ? 'Yes' : 'No'}`);

      // Test activity statistics
      const statistics = await this.userActivityService.calculateActivityStatistics(tenantContext, {
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dateTo: new Date()
      });

      if (!statistics) {
        throw new Error('Failed to calculate statistics');
      }

      console.log('✅ Activity statistics calculated');
      console.log(`   - Total Activities: ${statistics.totalActivities}`);
      console.log(`   - Unique Users: ${statistics.uniqueUsers}`);
      console.log(`   - Avg Response Time: ${statistics.avgResponseTime}ms`);

    } catch (error) {
      console.error('❌ Activity queries test failed:', error);
      throw error;
    }
  }

  /**
   * Test compliance reporting
   */
  private async testComplianceReporting(): Promise<void> {
    console.log('📋 Testing compliance reporting...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test GDPR compliance report data
      const gdprQuery = await this.userActivityService.queryUserActivities(tenantContext, {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        dateTo: new Date(),
        complianceRelevant: true,
        limit: 1000
      });

      if (!gdprQuery) {
        throw new Error('Failed to query GDPR activities');
      }

      console.log('✅ GDPR compliance data retrieved');
      console.log(`   - Compliance Activities: ${gdprQuery.activities.filter(a => a.complianceRelevant).length}`);
      console.log(`   - High Risk Activities: ${gdprQuery.activities.filter(a => a.riskLevel === 'HIGH').length}`);

      // Test SOX compliance report data
      const soxQuery = await this.userActivityService.queryUserActivities(tenantContext, {
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        dateTo: new Date(),
        activityType: 'FINANCIAL_CALCULATION',
        limit: 1000
      });

      console.log('✅ SOX compliance data retrieved');
      console.log(`   - Financial Activities: ${soxQuery.activities.length}`);

    } catch (error) {
      console.error('❌ Compliance reporting test failed:', error);
      throw error;
    }
  }

  /**
   * Test data export
   */
  private async testDataExport(): Promise<void> {
    console.log('💾 Testing data export...');

    try {
      const tenantContext: TenantContext = {
        tenantId: TEST_CONFIG.tenantId,
        tenantSlug: TEST_CONFIG.tenantSlug,
        bankingType: TEST_CONFIG.bankingType,
        database: await this.databaseManager.getTenantDB(TEST_CONFIG.tenantId)
      };

      // Test CSV export
      const csvExport = await this.userActivityService.exportUserActivities(tenantContext, {
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        limit: 100
      }, 'csv');

      if (!csvExport || !csvExport.data) {
        throw new Error('Failed to export CSV data');
      }

      console.log('✅ CSV export completed');
      console.log(`   - Filename: ${csvExport.filename}`);
      console.log(`   - Content Type: ${csvExport.contentType}`);
      console.log(`   - Data Size: ${csvExport.data.length} characters`);

      // Test JSON export
      const jsonExport = await this.userActivityService.exportUserActivities(tenantContext, {
        dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        limit: 50
      }, 'json');

      if (!jsonExport || !jsonExport.data) {
        throw new Error('Failed to export JSON data');
      }

      console.log('✅ JSON export completed');
      console.log(`   - Filename: ${jsonExport.filename}`);
      console.log(`   - Records: ${Array.isArray(jsonExport.data) ? jsonExport.data.length : 'N/A'}`);

    } catch (error) {
      console.error('❌ Data export test failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// TEST EXECUTION
// ============================================================================

async function main(): Promise<void> {
  const testSuite = new UserActivityTrackingTestSuite();

  try {
    await testSuite.runTestSuite();
    console.log('\n🎉 User Activity Tracking Test Suite Completed Successfully!');
    console.log('==================================================');

    // Display summary of what was tested
    console.log('\n📊 Test Summary:');
    console.log('✅ Database Schema Validation');
    console.log('✅ User Activity Logging');
    console.log('✅ Session Tracking');
    console.log('✅ Performance Metrics');
    console.log('✅ Security Events');
    console.log('✅ Real-time Monitoring');
    console.log('✅ Activity Queries');
    console.log('✅ Compliance Reporting');
    console.log('✅ Data Export');

    console.log('\n🔧 Next Steps:');
    console.log('1. Run the backend server: npm run dev');
    console.log('2. Test API endpoints with Postman/curl');
    console.log('3. Verify frontend integration');
    console.log('4. Monitor dashboard for real-time data');

  } catch (error) {
    console.error('\n💥 Test Suite Failed:', error);
    process.exit(1);
  }
}

// Run test suite if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { UserActivityTrackingTestSuite };