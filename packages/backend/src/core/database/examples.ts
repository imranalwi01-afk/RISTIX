// packages/backend/src/core/database/examples.ts

/**
 * Database Configuration System - Usage Examples
 *
 * This file demonstrates practical usage patterns for the centralized
 * multi-database configuration system in various scenarios.
 */

import {
  databaseRegistry,
  DatabaseDefinition
} from './DatabaseRegistry';
import {
  connectionFactory,
  ConnectionOptions
} from './ConnectionFactory';
import {
  databaseHealthMonitor,
  HealthCheckOptions
} from './HealthMonitor';
import {
  databaseSecurityValidator,
  SecurityValidationOptions
} from './SecurityValidator';

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Database Connection
 */
export async function basicConnectionExample() {
  console.log('🔌 Basic Database Connection Example');

  // Get a connection pool
  const pool = await connectionFactory.getConnection('platform_admin');

  // Execute a simple query
  const result = await connectionFactory.executeQuery(
    'platform_admin',
    'SELECT COUNT(*) FROM users'
  );

  console.log(`Total users: ${result.rows[0].count}`);
}

/**
 * Example 2: Sequelize Connection Usage
 */
export async function sequelizeConnectionExample() {
  console.log('🔌 Sequelize Connection Example');

  // Get Sequelize instance
  const sequelize = await connectionFactory.getSequelizeConnection('platform_admin');

  // Using Sequelize ORM
  const [results] = await sequelize.query('SELECT COUNT(*) FROM users', {
    type: sequelize.QueryTypes.SELECT
  });

  console.log(`Total users (Sequelize): ${results[0].count}`);
}

// ============================================================================
// ADVANCED USAGE EXAMPLES
// ============================================================================

/**
 * Example 3: Multi-Database Operations
 */
export async function multiDatabaseExample() {
  console.log('🗄️ Multi-Database Operations Example');

  // Get counts from different databases
  const platformCount = await connectionFactory.executeQuery(
    'platform_admin',
    'SELECT COUNT(*) as count FROM users'
  );

  const sharedCount = await connectionFactory.executeQuery(
    'shared_services',
    'SELECT COUNT(*) as count FROM menu_items'
  );

  const legacyCount = await connectionFactory.executeQuery(
    'frs9_legacy',
    'SELECT COUNT(*) as count FROM frs9_param_commonh'
  );

  console.log({
    platformUsers: platformCount.rows[0].count,
    sharedMenuItems: sharedCount.rows[0].count,
    legacyParameters: legacyCount.rows[0].count
  });
}

/**
 * Example 4: Tenant-Specific Operations
 */
export async function tenantOperationsExample() {
  console.log('🏢 Tenant-Specific Operations Example');

  // Get list of all tenant databases
  const tenantDBs = databaseRegistry.getTenantDatabases();

  console.log(`Found ${tenantDBs.length} tenant databases:`);

  for (const tenant of tenantDBs) {
    try {
      // Get connection metrics for tenant
      const metrics = connectionFactory.getMetrics(tenant.id);

      console.log(`Tenant ${tenant.id}:`, {
        database: tenant.database,
        active: tenant.isActive,
        connections: metrics?.totalConnections || 0,
        lastUsed: metrics?.lastUsed
      });
    } catch (error) {
      console.warn(`Error getting metrics for tenant ${tenant.id}:`, error.message);
    }
  }
}

/**
 * Example 5: Custom Connection Options
 */
export async function customConnectionOptionsExample() {
  console.log('⚙️ Custom Connection Options Example');

  const options: ConnectionOptions = {
    type: 'pool',
    maxConnections: 20,
    timeout: 5000,
    retries: 3,
    monitoring: true,
    healthCheck: true,
    customPoolConfig: {
      min: 5,
      max: 25,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 15000
    }
  };

  // Create connection with custom options
  const pool = await connectionFactory.getConnection('platform_admin', options);

  console.log('Custom connection created with options:', {
    maxConnections: options.maxConnections,
    timeout: options.timeout,
    monitoring: options.monitoring
  });
}

// ============================================================================
// HEALTH MONITORING EXAMPLES
// ============================================================================

/**
 * Example 6: Health Check Operations
 */
export async function healthCheckExample() {
  console.log('🏥 Health Check Example');

  // Check single database health
  const healthStatus = await databaseHealthMonitor.checkDatabaseHealthEnhanced(
    'platform_admin',
    {
      timeout: 3000,
      retryCount: 2,
      detailed: true
    }
  );

  console.log('Health Status:', {
    database: healthStatus.databaseName,
    status: healthStatus.status,
    responseTime: healthStatus.responseTime,
    error: healthStatus.error,
    details: healthStatus.details
  });

  // Check all databases
  const systemHealth = await databaseHealthMonitor.checkAllDatabaseHealth({
    detailed: true,
    timeout: 5000
  });

  console.log('System Health Summary:', {
    overall: systemHealth.overall,
    healthy: systemHealth.summary.healthy,
    unhealthy: systemHealth.summary.unhealthy,
    degraded: systemHealth.summary.degraded,
    averageResponseTime: systemHealth.summary.averageResponseTime
  });
}

/**
 * Example 7: Health Monitoring Setup
 */
export function healthMonitoringSetupExample() {
  console.log('🔄 Health Monitoring Setup Example');

  // Start monitoring specific database
  databaseHealthMonitor.startMonitoringDatabase('platform_admin', 30000); // 30 seconds

  // Start monitoring all databases
  databaseHealthMonitor.startAllMonitoring(60000); // 1 minute

  // Configure custom alert thresholds
  databaseHealthMonitor.setAlertThresholds({
    responseTimeWarning: 2000,
    responseTimeCritical: 10000,
    connectionUtilizationWarning: 0.7,
    connectionUtilizationCritical: 0.9,
    errorRateWarning: 0.05,
    errorRateCritical: 0.1
  });

  console.log('Health monitoring configured with custom thresholds');
}

/**
 * Example 8: Health Status Analysis
 */
export async function healthStatusAnalysisExample() {
  console.log('📊 Health Status Analysis Example');

  // Get databases needing attention
  const attention = databaseHealthMonitor.getDatabasesNeedingAttention();

  console.log('Databases Needing Attention:');
  console.log(`  Unhealthy: ${attention.unhealthy.length}`);
  console.log(`  Degraded: ${attention.degraded.length}`);
  console.log(`  Warnings: ${attention.warnings.length}`);

  // Get health history for a database
  const history = databaseHealthMonitor.getHealthStatusHistory('platform_admin', 10);

  console.log(`Health history for platform_admin (last ${history.length} checks):`);
  history.forEach((status, index) => {
    console.log(`  ${index + 1}. ${status.status} - ${status.responseTime}ms - ${status.lastCheck.toISOString()}`);
  });

  // Get monitoring status
  const status = databaseHealthMonitor.getEnhancedMonitoringStatus();

  console.log('Monitoring Status:', {
    activeMonitors: status.activeMonitors.length,
    monitoringCoverage: `${status.monitoringCoverage}%`,
    alertThresholds: status.alertThresholds
  });
}

// ============================================================================
// SECURITY VALIDATION EXAMPLES
// ============================================================================

/**
 * Example 9: Security Validation
 */
export async function securityValidationExample() {
  console.log('🔒 Security Validation Example');

  // Validate all databases with strict security requirements
  const securityResults = databaseSecurityValidator.validateAllDatabases({
    strictMode: true,
    checkPasswordComplexity: true,
    checkHostSecurity: true,
    checkCompliance: true,
    minPasswordLength: 16,
    requireSpecialChars: true,
    allowPublicHosts: false,
    enforceSSL: true
  });

  console.log('Security Validation Results:');
  securityResults.forEach(result => {
    console.log(`\n${result.databaseName} (${result.databaseId}):`);
    console.log(`  Valid: ${result.isValid}`);
    console.log(`  Security Level: ${result.securityLevel}`);
    console.log(`  Errors: ${result.errors.length}`);
    console.log(`  Warnings: ${result.warnings.length}`);
    console.log(`  SSL Configured: ${result.details.sslConfigured}`);
    console.log(`  Password Strength: ${result.details.passwordComplexity.strength}`);
    console.log(`  Host Risk Level: ${result.details.hostSecurity.riskLevel}`);

    if (result.recommendations.length > 0) {
      console.log(`  Recommendations:`);
      result.recommendations.forEach(rec => console.log(`    - ${rec}`));
    }
  });
}

/**
 * Example 10: Compliance Checking
 */
export async function complianceCheckingExample() {
  console.log('📋 Compliance Checking Example');

  // Validate with specific compliance requirements
  const complianceOptions: SecurityValidationOptions = {
    strictMode: false,
    checkCompliance: true,
    enforceSSL: true
  };

  const results = databaseSecurityValidator.validateAllDatabases(complianceOptions);

  console.log('Compliance Status:');
  results.forEach(result => {
    const compliance = result.details.complianceStatus;
    console.log(`\n${result.databaseName}:`);
    console.log(`  Encryption Required: ${compliance.encryptionRequired}`);
    console.log(`  Encryption Compliant: ${compliance.encryptionCompliant}`);
    console.log(`  Audit Trail Required: ${compliance.auditTrailRequired}`);
    console.log(`  Audit Trail Compliant: ${compliance.auditTrailCompliant}`);
    console.log(`  GDPR Compliant: ${compliance.gdprCompliant}`);
    console.log(`  SOX Compliant: ${compliance.soxCompliant}`);
  });
}

// ============================================================================
// REGISTRY MANAGEMENT EXAMPLES
// ============================================================================

/**
 * Example 11: Database Registry Operations
 */
export function databaseRegistryExample() {
  console.log('📚 Database Registry Example');

  // Load databases from environment
  databaseRegistry.loadFromEnvironment();

  // Get all databases with filtering
  const criticalDBs = databaseRegistry.getCriticalDatabases();
  const healthyDBs = databaseRegistry.list({ isActive: true });
  const tenantDBs = databaseRegistry.getTenantDatabases();
  const ds1DBs = databaseRegistry.getDatabasesByHost('localhost');

  console.log('Registry Statistics:');
  console.log(`  Critical Databases: ${criticalDBs.length}`);
  console.log(`  Healthy Databases: ${healthyDBs.length}`);
  console.log(`  Tenant Databases: ${tenantDBs.length}`);
  console.log(`  DS1 Databases: ${ds1DBs.length}`);

  // Get comprehensive statistics
  const stats = databaseRegistry.getRegistryStats();
  console.log('\nDetailed Statistics:', stats);

  // Get system topology
  const topology = databaseRegistry.getSystemTopology();
  console.log('\nSystem Topology:', topology);

  // Export configuration
  const exportedConfig = databaseRegistry.exportConfiguration();
  console.log(`\nExported Configuration Version: ${exportedConfig.version}`);
  console.log(`Total Databases: ${exportedConfig.databases.length}`);
}

/**
 * Example 12: Dynamic Database Registration
 */
export function dynamicDatabaseRegistrationExample() {
  console.log('➕ Dynamic Database Registration Example');

  // Add a new tenant database
  const newDatabase: DatabaseDefinition = {
    id: 'tenant_newcompany',
    name: 'New Company Tenant Database',
    type: 'tenant',
    server: 'DS1',
    host: 'localhost',
    port: 5432,
    database: 'ifrspro_tenant_newcompany',
    username: 'postgres',
    password: 'secure_password_123!',
    ssl: false,
    maxConnections: 15,
    healthCheckInterval: 45000,
    tags: ['tenant', 'conventional', 'newcompany'],
    isActive: true,
    priority: 'normal'
  };

  // Register the new database
  databaseRegistry.upsertDatabase(newDatabase);

  console.log('Database registered:', {
    id: newDatabase.id,
    name: newDatabase.name,
    type: newDatabase.type,
    host: newDatabase.host
  });

  // Verify registration
  const retrieved = databaseRegistry.getDatabaseById(newDatabase.id);
  if (retrieved) {
    console.log('✅ Database registration successful');
  }
}

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

/**
 * Example 13: Robust Error Handling
 */
export async function robustErrorHandlingExample() {
  console.log('🛡️ Robust Error Handling Example');

  try {
    // Try to connect to non-existent database
    const pool = await connectionFactory.getConnection('nonexistent_db');
  } catch (error) {
    console.error('Expected error caught:', error.message);

    // Fallback to available database
    try {
      const pool = await connectionFactory.getConnection('platform_admin');
      console.log('✅ Fallback connection successful');
    } catch (fallbackError) {
      console.error('Fallback connection failed:', fallbackError.message);
    }
  }

  try {
    // Test connection with timeout
    const testResult = await connectionFactory.testConnection('platform_admin');
    if (testResult.success) {
      console.log(`✅ Connection test passed (${testResult.responseTime}ms)`);
    } else {
      console.log('❌ Connection test failed:', testResult.error);
    }
  } catch (error) {
    console.error('Connection test error:', error.message);
  }
}

/**
 * Example 14: Connection Resilience
 */
export async function connectionResilienceExample() {
  console.log('🔄 Connection Resilience Example');

  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to connect...`);

      const result = await connectionFactory.testConnection('platform_admin');

      if (result.success) {
        console.log(`✅ Connection successful on attempt ${attempt} (${result.responseTime}ms)`);
        break;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        console.error('All connection attempts failed');
        throw error;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// ============================================================================
// PERFORMANCE MONITORING EXAMPLES
// ============================================================================

/**
 * Example 15: Performance Metrics
 */
export async function performanceMetricsExample() {
  console.log('📈 Performance Metrics Example');

  // Get connection statistics
  const stats = connectionFactory.getConnectionStats();
  console.log('Connection Statistics:', stats);

  // Get detailed metrics for all databases
  const allMetrics = connectionFactory.getAllMetrics();
  console.log('\nDatabase Metrics:');

  Object.entries(allMetrics).forEach(([databaseId, metrics]) => {
    console.log(`\n${databaseId}:`);
    console.log(`  Total Connections: ${metrics.totalConnections}`);
    console.log(`  Average Response Time: ${metrics.averageResponseTime}ms`);
    console.log(`  Error Count: ${metrics.errorCount}`);
    console.log(`  Last Used: ${metrics.lastUsed.toISOString()}`);
    console.log(`  Use Count: ${metrics.useCount}`);
  });

  // Simulate some activity to update metrics
  console.log('\nSimulating database activity...');

  for (let i = 0; i < 5; i++) {
    const startTime = Date.now();
    await connectionFactory.executeQuery('platform_admin', 'SELECT 1');
    const responseTime = Date.now() - startTime;
    console.log(`Query ${i + 1}: ${responseTime}ms`);
  }

  // Check updated metrics
  const updatedStats = connectionFactory.getConnectionStats();
  console.log('\nUpdated Connection Statistics:', updatedStats);
}

// ============================================================================
// MAIN EXAMPLE RUNNER
// ============================================================================

/**
 * Run all examples (for demonstration)
 */
export async function runAllExamples() {
  console.log('🚀 Running Database Configuration System Examples\n');

  try {
    await basicConnectionExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await sequelizeConnectionExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await multiDatabaseExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await tenantOperationsExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await customConnectionOptionsExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await healthCheckExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await securityValidationExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await databaseRegistryExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await robustErrorHandlingExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await performanceMetricsExample();

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export all examples for individual testing
export {
  basicConnectionExample,
  sequelizeConnectionExample,
  multiDatabaseExample,
  tenantOperationsExample,
  customConnectionOptionsExample,
  healthCheckExample,
  healthMonitoringSetupExample,
  healthStatusAnalysisExample,
  securityValidationExample,
  complianceCheckingExample,
  databaseRegistryExample,
  dynamicDatabaseRegistrationExample,
  robustErrorHandlingExample,
  connectionResilienceExample,
  performanceMetricsExample
};