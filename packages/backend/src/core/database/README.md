# 🗄️ Centralized Multi-Database Configuration System

## Overview

The IFRS9 Multi-Tenant Platform includes a comprehensive centralized database configuration system that manages multiple database servers, connections, and monitoring. This system provides enterprise-grade features for security, health monitoring, and connection management across different deployment environments.

## Architecture

### Core Components

1. **DatabaseRegistry** - Central database catalog with environment-based discovery
2. **ConnectionFactory** - Universal connection manager with pool management
3. **HealthMonitor** - Real-time health monitoring and alerting system
4. **SecurityValidator** - Security validation and compliance checking

### Database Topology

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DS1 Primary    │    │   DS2 Analytics  │    │   RDS Production │
│ 192.168.0.85    │    │ 192.168.0.106   │    │ Alibaba Cloud    │
│     Port: 5432   │    │     Port: 5433   │    │   Port: 5432     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Platform Admin│    │ • FRS9PRO       │    │ • IAF Production │
│ • Shared Svcs   │    │ • IFRS9_pro     │    │ • FRS9PRO        │
│ • Tenant DBs    │    │                 │    │ • IFRS9_pro     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Configuration

### Environment Variables Template

```bash
# =================================
# PRIMARY DATABASE SERVERS
# =================================
DS1_HOST=localhost
DS1_PORT=5432
DS1_USER=postgres
DS1_PASSWORD=postgres
DS1_SSL=false

DS2_HOST=192.168.0.106
DS2_PORT=5433
DS2_USER=postgres
DS2_PASSWORD=postgres
DS2_SSL=false

# --------------------------------------------------------------------------
# CORE PLATFORM DATABASES (DS1)
# --------------------------------------------------------------------------
PLATFORM_ADMIN_DB=ifrspro_platform_admin
PLATFORM_ADMIN_HOST=${DS1_HOST}
PLATFORM_ADMIN_PORT=${DS1_PORT}
PLATFORM_ADMIN_USER=${DS1_USER}
PLATFORM_ADMIN_PASSWORD=${DS1_PASSWORD}

SHARED_SERVICES_DB=ifrspro_shared_services
SHARED_SERVICES_HOST=${DS1_HOST}
SHARED_SERVICES_PORT=${DS1_PORT}
SHARED_SERVICES_USER=${DS1_USER}
SHARED_SERVICES_PASSWORD=${DS1_PASSWORD}

# --------------------------------------------------------------------------
# LEGACY FRS9 DATABASES (DS2)
# --------------------------------------------------------------------------
FRS9_LEGACY_DB=FRS9PRO
FRS9_LEGACY_HOST=${DS2_HOST}
FRS9_LEGACY_PORT=${DS2_PORT}
FRS9_LEGACY_USER=${DS2_USER}
FRS9_LEGACY_PASSWORD=${DS2_PASSWORD}

IFRS9_ANALYTICS_DB=IFRS9_pro
IFRS9_ANALYTICS_HOST=${DS2_HOST}
IFRS9_ANALYTICS_PORT=${DS2_PORT}
IFRS9_ANALYTICS_USER=${DS2_USER}
IFRS9_ANALYTICS_PASSWORD=${DS2_PASSWORD}

# --------------------------------------------------------------------------
# IAF PRODUCTION DATABASE (RDS)
# --------------------------------------------------------------------------
IAF_RDS_HOST=pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com
IAF_RDS_PORT=5432
IAF_RDS_DB=ifrspro_tenant_iaf
IAF_RDS_USER=admin_iaf
IAF_RDS_PASSWORD=P@ssw0rd2025!
IAF_RDS_SSL=true

# --------------------------------------------------------------------------
# TENANT DATABASES REGISTRY
# --------------------------------------------------------------------------
TENANT_DANA_DB=ifrspro_tenant_dana
TENANT_DANA_HOST=${DS1_HOST}
TENANT_DANA_PORT=${DS1_PORT}
TENANT_DANA_USER=${DS1_USER}
TENANT_DANA_PASSWORD=${DS1_PASSWORD}
TENANT_DANA_SSL=false

TENANT_METRO_DB=ifrspro_tenant_demo_conventional
TENANT_METRO_HOST=${DS1_HOST}
TENANT_METRO_PORT=${DS1_PORT}
TENANT_METRO_USER=${DS1_USER}
TENANT_METRO_PASSWORD=${DS1_PASSWORD}
TENANT_METRO_SSL=false

TENANT_SYARIAH_DB=ifrspro_tenant_demo_syariah
TENANT_SYARIAH_HOST=${DS1_HOST}
TENANT_SYARIAH_PORT=${DS1_PORT}
TENANT_SYARIAH_USER=${DS1_USER}
TENANT_SYARIAH_PASSWORD=${DS1_PASSWORD}
TENANT_SYARIAH_SSL=false
```

## Usage Examples

### Database Registry

```typescript
import { databaseRegistry } from './core/database/DatabaseRegistry';

// Load databases from environment
databaseRegistry.loadFromEnvironment();

// Get all databases
const allDatabases = databaseRegistry.getAll();

// Get specific database
const platformDB = databaseRegistry.get('platform_admin');

// Filter databases
const tenantDBs = databaseRegistry.getTenantDatabases();
const criticalDBs = databaseRegistry.getCriticalDatabases();

// Get system statistics
const stats = databaseRegistry.getRegistryStats();
const topology = databaseRegistry.getSystemTopology();
```

### Connection Factory

```typescript
import { connectionFactory } from './core/database/ConnectionFactory';

// Get database connection
const pool = await connectionFactory.getConnection('platform_admin');
const sequelize = await connectionFactory.getSequelizeConnection('platform_admin');

// Execute queries
const result = await connectionFactory.executeQuery(
  'platform_admin',
  'SELECT COUNT(*) FROM users'
);

// Test connection
const testResult = await connectionFactory.testConnection('platform_admin');

// Test all connections
const allTests = await connectionFactory.testAllConnections();

// Get connection metrics
const metrics = connectionFactory.getMetrics('platform_admin');
const allMetrics = connectionFactory.getAllMetrics();
```

### Health Monitoring

```typescript
import { databaseHealthMonitor } from './core/database/HealthMonitor';

// Check single database health
const healthStatus = await databaseHealthMonitor.checkDatabaseHealthEnhanced(
  'platform_admin',
  { detailed: true, timeout: 5000 }
);

// Check all databases
const systemHealth = await databaseHealthMonitor.checkAllDatabaseHealth();

// Start monitoring
databaseHealthMonitor.startMonitoringDatabase('platform_admin', 30000); // 30 seconds
databaseHealthMonitor.startAllMonitoring();

// Get monitoring status
const status = databaseHealthMonitor.getEnhancedMonitoringStatus();
const attention = databaseHealthMonitor.getDatabasesNeedingAttention();

// Configure alert thresholds
databaseHealthMonitor.setAlertThresholds({
  responseTimeWarning: 2000,
  responseTimeCritical: 10000
});
```

### Security Validation

```typescript
import { databaseSecurityValidator } from './core/database/SecurityValidator';

// Validate all databases
const securityResults = databaseSecurityValidator.validateAllDatabases({
  strictMode: true,
  checkPasswordComplexity: true,
  enforceSSL: true,
  minPasswordLength: 16
});

// Validate specific database
const securityResult = databaseSecurityValidator.validateDatabaseSecurity(
  'platform_admin',
  {
    checkCompliance: true,
    allowPublicHosts: false
  }
);

// Configure validation options
databaseSecurityValidator.setDefaultOptions({
  strictMode: false,
  minPasswordLength: 12,
  requireSpecialChars: true
});
```

## API Integration Examples

### Express API Endpoints

```typescript
// Database health check endpoint
app.get('/api/v1/database/health', async (req, res) => {
  try {
    const health = await databaseHealthMonitor.checkAllDatabaseHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database registry information
app.get('/api/v1/database/registry', (req, res) => {
  const registry = databaseRegistry.exportConfiguration();
  res.json({
    success: true,
    data: registry
  });
});

// Database security validation
app.get('/api/v1/database/security', async (req, res) => {
  const security = await databaseSecurityValidator.validateAllDatabases();
  res.json({
    success: true,
    data: security
  });
});

// Connection metrics
app.get('/api/v1/database/metrics', (req, res) => {
  const metrics = connectionFactory.getAllMetrics();
  const stats = connectionFactory.getConnectionStats();

  res.json({
    success: true,
    data: {
      metrics,
      statistics: stats
    }
  });
});
```

### Database Service Integration

```typescript
// Service class using the database configuration system
export class UserService {
  private async getPlatformConnection() {
    return await connectionFactory.getConnection('platform_admin');
  }

  private async getTenantConnection(tenantId: string) {
    return await connectionFactory.getConnection(`tenant_${tenantId}`);
  }

  async getUserCount(): Promise<number> {
    const result = await connectionFactory.executeQuery(
      'platform_admin',
      'SELECT COUNT(*) as count FROM users'
    );
    return parseInt(result.rows[0].count);
  }

  async getTenantUserCount(tenantId: string): Promise<number> {
    const result = await connectionFactory.executeQuery(
      `tenant_${tenantId}`,
      'SELECT COUNT(*) as count FROM core.users'
    );
    return parseInt(result.rows[0].count);
  }
}
```

## Migration Guide

### From Direct Database Connections

**Before:**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ifrspro_platform_admin',
  user: 'postgres',
  password: 'postgres'
});
```

**After:**
```typescript
import { connectionFactory } from './core/database/ConnectionFactory';

const pool = await connectionFactory.getConnection('platform_admin');
// Or for Sequelize:
const sequelize = await connectionFactory.getSequelizeConnection('platform_admin');
```

### Benefits of Migration

1. **Centralized Management**: All database connections managed in one place
2. **Environment Flexibility**: Automatic switching between development and production
3. **Health Monitoring**: Real-time monitoring and alerting
4. **Security Validation**: Automated security checks and compliance
5. **Connection Pooling**: Optimized connection management
6. **Multi-Server Support**: Support for multiple database servers
7. **Tenant Discovery**: Automatic tenant database discovery

## Production Deployment

### Environment Setup

1. **Development Environment**:
   ```bash
   # Uses local databases (DS1, DS2)
   DS1_HOST=localhost
   DS2_HOST=192.168.0.106
   ```

2. **IAF Production Environment**:
   ```bash
   # Uses RDS databases
   IAF_RDS_HOST=pgm-d9j5id443p7876n9.pgsql.ap-southeast-5.rds.aliyuncs.com
   ```

### Configuration Validation

```typescript
// Validate configuration on startup
import { databaseRegistry, databaseHealthMonitor, databaseSecurityValidator } from './core/database';

async function validateConfiguration() {
  try {
    // Load registry
    databaseRegistry.loadFromEnvironment();

    // Test connections
    const testResults = await connectionFactory.testAllConnections();

    // Validate security
    const securityResults = databaseSecurityValidator.validateAllDatabases({
      strictMode: process.env.NODE_ENV === 'production'
    });

    // Check health
    const healthResults = await databaseHealthMonitor.checkAllDatabaseHealth();

    console.log('✅ Database configuration validated successfully');
  } catch (error) {
    console.error('❌ Database configuration validation failed:', error);
    process.exit(1);
  }
}
```

### Monitoring Setup

```typescript
// Start health monitoring in production
if (process.env.NODE_ENV === 'production') {
  databaseHealthMonitor.startAllMonitoring(60000); // Every minute

  // Configure alerts
  databaseHealthMonitor.setAlertThresholds({
    responseTimeWarning: 1000,
    responseTimeCritical: 5000,
    connectionUtilizationWarning: 0.7,
    connectionUtilizationCritical: 0.9
  });
}
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**:
   - Increase timeout in ConnectionOptions
   - Check network connectivity
   - Verify database server status

2. **SSL Configuration**:
   - Ensure SSL certificates are properly configured
   - Verify database server SSL settings
   - Check firewall rules

3. **Connection Pool Exhaustion**:
   - Increase maxConnections in database definition
   - Optimize connection usage
   - Monitor connection metrics

### Debug Commands

```typescript
// Check registry status
console.log(databaseRegistry.getRegistryStats());

// Test specific database
console.log(await connectionFactory.testConnection('platform_admin'));

// Check health status
console.log(await databaseHealthMonitor.checkDatabaseHealthEnhanced('platform_admin'));

// Validate security
console.log(databaseSecurityValidator.validateDatabaseSecurity('platform_admin'));
```

## Best Practices

1. **Always use environment variables** for database credentials
2. **Enable SSL** for production databases
3. **Monitor connection pools** to prevent exhaustion
4. **Regular security audits** of database configurations
5. **Implement connection retry logic** for resilience
6. **Use health checks** for proactive monitoring
7. **Follow principle of least privilege** for database access

## Performance Considerations

1. **Connection Pool Sizing**:
   - Set appropriate min/max connections
   - Monitor pool utilization
   - Adjust based on application load

2. **Health Check Frequency**:
   - Balance between monitoring and overhead
   - Use different intervals for critical vs non-critical databases
   - Implement exponential backoff for failed checks

3. **Security Validation**:
   - Cache validation results where appropriate
   - Avoid excessive password complexity checks
   - Validate configuration changes only when modified