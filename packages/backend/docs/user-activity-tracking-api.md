# User Activity Tracking API Documentation
## IAF IFRS9 Platform - Comprehensive Audit & Monitoring System

---

## 📋 Overview

The User Activity Tracking API provides comprehensive monitoring and auditing capabilities for the IAF IFRS9 platform. This system tracks all user interactions, performance metrics, security events, and provides real-time monitoring dashboards with compliance reporting features.

### 🔧 Base Configuration

- **Base URL**: `https://iaf-ifrs-be.danafin.com/api/v1/user-activity`
- **Authentication**: JWT Bearer Token required
- **Content-Type**: `application/json`
- **Tenant Context**: Required for all endpoints

### 🔐 Authentication Headers

```http
Authorization: Bearer <your-jwt-token>
X-Tenant-ID: <tenant-id>
Content-Type: application/json
```

---

## 🎯 Core Features

### ✅ **Implemented Features**

1. **User Activity Logging** - Complete audit trail of all user interactions
2. **Session Tracking** - Comprehensive session lifecycle management
3. **Performance Monitoring** - Real-time performance metrics collection
4. **Security Event Detection** - Automated security incident logging
5. **Real-time Monitoring** - Live activity feeds and dashboards
6. **Compliance Reporting** - GDPR, SOX, BASEL, AAOIFI reports
7. **Data Export** - CSV, JSON, Excel export capabilities
8. **Advanced Analytics** - Statistical analysis and insights

### 🏗️ **Architecture**

- **Database-per-tenant isolation** with complete data separation
- **Multi-layer audit trails** with immutable logging
- **Real-time processing** with sub-second response times
- **Compliance-ready** with regulatory reporting
- **Security-first** design with event detection

---

## 📊 API Endpoints

### 🔹 **User Activity Logging**

#### **POST /logs**
Log a single user activity with comprehensive tracking.

**Request Body:**
```json
{
  "userId": "uuid",
  "sessionId": "session-uuid",
  "activityType": "USER_LOGIN",
  "actionPerformed": "User logged in to system",
  "targetEntity": "Authentication",
  "targetId": "target-uuid",
  "targetName": "Login System",
  "pageUrl": "https://iaf-ifrs.danafin.com/dashboard",
  "referrerUrl": "https://iaf-ifrs.danafin.com/login",
  "requestPath": "/api/v1/auth/login",
  "requestMethod": "POST",
  "apiEndpoint": "/api/v1/auth/login",
  "actionResult": "SUCCESS",
  "errorMessage": null,
  "errorCode": null,
  "responseTimeMs": 250,
  "serverProcessingTimeMs": 150,
  "clientRenderTimeMs": 100,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "deviceType": "Desktop",
  "browserName": "Chrome",
  "browserVersion": "120.0",
  "osName": "Windows",
  "osVersion": "10.0",
  "moduleAccessed": "Authentication",
  "businessProcess": "User Authentication",
  "bankingType": "conventional",
  "riskLevel": "LOW",
  "complianceRelevant": true,
  "regulatoryImpact": false,
  "gdprBasis": "Legitimate Interest",
  "dataClassification": "NORMAL",
  "sessionDurationMs": 3600000,
  "pageDwellTimeMs": 45000,
  "userEngagementScore": 85,
  "memoryUsageMb": 128,
  "cpuUsagePercent": 25,
  "databaseQueryTimeMs": 45,
  "cacheHitRatio": 0.95,
  "metadata": {
    "customField": "value"
  },
  "tags": ["authentication", "success", "user-action"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "activity-uuid",
    "tenantId": "iaf",
    "userId": "user-uuid",
    "sessionId": "session-uuid",
    "activityType": "USER_LOGIN",
    "actionPerformed": "User logged in to system",
    "activityTimestamp": "2025-01-11T10:30:00.000Z",
    "riskLevel": "LOW",
    "complianceRelevant": true,
    "regulatoryImpact": false,
    "ipAddress": "192.168.1.100",
    "countryCode": "ID",
    "countryName": "Indonesia",
    "city": "Jakarta"
  },
  "message": "User activity logged successfully"
}
```

#### **POST /logs/batch**
Log multiple user activities in a single request.

**Request Body:**
```json
{
  "activities": [
    {
      "userId": "uuid",
      "sessionId": "session-uuid",
      "activityType": "PAGE_VIEW",
      "actionPerformed": "Viewed dashboard",
      "actionResult": "SUCCESS",
      "responseTimeMs": 150
    },
    {
      "userId": "uuid",
      "sessionId": "session-uuid",
      "activityType": "DATA_ACCESS",
      "actionPerformed": "Accessed portfolio data",
      "actionResult": "SUCCESS",
      "responseTimeMs": 320
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "success": 2,
    "failures": 0,
    "results": [
      {
        "success": true,
        "data": { "id": "activity-uuid-1" }
      },
      {
        "success": true,
        "data": { "id": "activity-uuid-2" }
      }
    ]
  },
  "message": "Batch processing completed: 2 successful, 0 failed"
}
```

### 🔹 **Session Tracking**

#### **POST /sessions**
Track or update session information.

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "userId": "user-uuid",
  "sessionStart": "2025-01-11T09:00:00.000Z",
  "sessionEnd": null,
  "sessionStatus": "ACTIVE",
  "firstPageVisited": "https://iaf-ifrs.danafin.com/dashboard",
  "lastPageVisited": "https://iaf-ifrs.danafin.com/portfolio",
  "totalPageViews": 15,
  "totalActions": 45,
  "totalErrors": 0,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "deviceType": "Desktop",
  "browserName": "Chrome",
  "bankingType": "conventional",
  "modulesAccessed": ["Dashboard", "Portfolio", "Reports"],
  "failedLoginAttempts": 0,
  "securityEvents": 0,
  "riskScore": 15,
  "userEngagementScore": 85,
  "bounceRate": 0.2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "tenantId": "iaf",
    "sessionId": "session-uuid",
    "userId": "user-uuid",
    "sessionStatus": "ACTIVE",
    "totalPageViews": 15,
    "totalActions": 45,
    "riskScore": 15,
    "userEngagementScore": 85
  },
  "message": "Session tracked successfully"
}
```

#### **GET /sessions/:sessionId**
Get detailed session information with all activities.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "userId": "user-uuid",
      "sessionStart": "2025-01-11T09:00:00.000Z",
      "sessionStatus": "ACTIVE",
      "totalPageViews": 15,
      "totalActions": 45,
      "riskScore": 15
    },
    "activities": [
      {
        "id": "activity-uuid",
        "activityType": "USER_LOGIN",
        "actionPerformed": "User logged in",
        "activityTimestamp": "2025-01-11T09:00:00.000Z",
        "actionResult": "SUCCESS"
      }
    ],
    "statistics": {
      "totalActivities": 45,
      "successfulActivities": 43,
      "failedActivities": 2,
      "avgResponseTime": 250
    },
    "totalActivities": 45
  }
}
```

### 🔹 **Activity Queries**

#### **GET /activities**
Query user activities with advanced filtering and pagination.

**Query Parameters:**
- `userId` (string): Filter by user ID
- `sessionId` (string): Filter by session ID
- `activityType` (string): Filter by activity type
- `actionResult` (string): Filter by action result (SUCCESS, FAILURE, PARTIAL)
- `riskLevel` (string): Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)
- `bankingType` (string): Filter by banking type (conventional, syariah, dual)
- `complianceRelevant` (boolean): Filter compliance-relevant activities
- `moduleAccessed` (string): Filter by module accessed
- `ipAddress` (string): Filter by IP address
- `dateFrom` (datetime): Filter activities from date
- `dateTo` (datetime): Filter activities to date
- `searchTerm` (string): Search in actions, entities, modules
- `limit` (number): Pagination limit (default: 50, max: 1000)
- `offset` (number): Pagination offset (default: 0)
- `sortBy` (string): Sort field (default: activity_timestamp)
- `sortOrder` (string): Sort order (ASC, DESC, default: DESC)

**Example Request:**
```
GET /api/v1/user-activity/activities?userId=user-uuid&dateFrom=2025-01-10T00:00:00.000Z&limit=20&sortBy=activity_timestamp&sortOrder=DESC
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity-uuid",
      "tenantId": "iaf",
      "userId": "user-uuid",
      "sessionId": "session-uuid",
      "activityType": "DATA_ACCESS",
      "actionPerformed": "Accessed portfolio data",
      "activityDescription": "DATA_ACCESS: Accessed portfolio data",
      "targetEntity": "Portfolio",
      "targetId": "portfolio-uuid",
      "pageUrl": "https://iaf-ifrs.danafin.com/portfolio",
      "requestMethod": "GET",
      "actionResult": "SUCCESS",
      "responseTimeMs": 320,
      "ipAddress": "192.168.1.100",
      "countryName": "Indonesia",
      "deviceType": "Desktop",
      "browserName": "Chrome",
      "moduleAccessed": "Portfolio",
      "businessProcess": "Portfolio Management",
      "bankingType": "conventional",
      "riskLevel": "MEDIUM",
      "complianceRelevant": true,
      "regulatoryImpact": false,
      "activityTimestamp": "2025-01-11T10:30:00.000Z",
      "userEngagementScore": 75,
      "tags": ["data-access", "portfolio", "compliance"]
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "statistics": {
    "totalActivities": 1250,
    "successfulActivities": 1180,
    "failedActivities": 45,
    "uniqueUsers": 25,
    "avgResponseTime": 285,
    "complianceRelevantActivities": 350
  },
  "filters": {
    "userId": "user-uuid",
    "dateFrom": "2025-01-10T00:00:00.000Z",
    "limit": 20,
    "offset": 0,
    "sortBy": "activity_timestamp",
    "sortOrder": "DESC"
  }
}
```

#### **GET /statistics**
Get comprehensive activity statistics and analytics.

**Query Parameters:**
- `userId` (string): Filter by user ID
- `activityType` (string): Filter by activity type
- `dateFrom` (datetime): Start date for statistics
- `dateTo` (datetime): End date for statistics
- `bankingType` (string): Filter by banking type
- `complianceRelevant` (boolean): Filter compliance activities

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalActivities": 5420,
    "successfulActivities": 5180,
    "failedActivities": 180,
    "partialActivities": 60,
    "criticalRiskActivities": 5,
    "highRiskActivities": 45,
    "mediumRiskActivities": 320,
    "lowRiskActivities": 5050,
    "uniqueUsers": 85,
    "uniqueSessions": 145,
    "avgResponseTime": 285,
    "maxResponseTime": 3500,
    "minResponseTime": 45,
    "totalErrors": 180,
    "complianceRelevantActivities": 1250,
    "topModules": [
      { "module": "Portfolio", "count": 1250 },
      { "module": "Dashboard", "count": 980 },
      { "module": "Reports", "count": 750 },
      { "module": "Authentication", "count": 620 }
    ],
    "topUsers": [
      { "userId": "user-uuid-1", "userName": "John Doe", "count": 150 },
      { "userId": "user-uuid-2", "userName": "Jane Smith", "count": 125 }
    ],
    "hourlyDistribution": [
      { "hour": 9, "count": 450 },
      { "hour": 10, "count": 680 },
      { "hour": 11, "count": 520 }
    ],
    "riskDistribution": [
      { "risk": "LOW", "count": 5050 },
      { "risk": "MEDIUM", "count": 320 },
      { "risk": "HIGH", "count": 45 },
      { "risk": "CRITICAL", "count": 5 }
    ],
    "resultDistribution": [
      { "result": "SUCCESS", "count": 5180 },
      { "result": "FAILURE", "count": 180 },
      { "result": "PARTIAL", "count": 60 }
    ],
    "performanceMetrics": {
      "avgPageLoadTime": 320,
      "avgServerResponseTime": 150,
      "avgClientRenderTime": 170,
      "slaComplianceRate": 92
    }
  },
  "filters": {
    "dateFrom": "2025-01-10T00:00:00.000Z",
    "dateTo": "2025-01-11T23:59:59.000Z"
  }
}
```

### 🔹 **Real-time Monitoring**

#### **GET /real-time**
Get real-time activity monitoring data.

**Query Parameters:**
- `timeWindowMinutes` (number): Time window in minutes (default: 5)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_activities": 45,
    "successful_activities": 42,
    "failed_activities": 3,
    "high_risk_activities": 2,
    "active_users": 12,
    "active_sessions": 15,
    "avg_response_time": 285,
    "max_response_time": 1200,
    "compliance_activities": 8,
    "active_modules": ["Dashboard", "Portfolio", "Reports"],
    "activity_distribution": [
      { "activity_type": "PAGE_VIEW", "count": 25 },
      { "activity_type": "DATA_ACCESS", "count": 12 },
      { "activity_type": "API_CALL", "count": 8 }
    ]
  },
  "timeWindowMinutes": 5,
  "timestamp": "2025-01-11T10:30:00.000Z"
}
```

#### **GET /live-feed**
Get Server-Sent Events stream of live activities.

**Query Parameters:**
- `limit` (number): Number of recent activities (default: 20)
- `riskLevel` (string): Filter by risk level (default: HIGH)

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Response Data (SSE format):**
```
data: {"type":"initial","data":[...],"total":45}

data: {"type":"update","data":[...],"timestamp":"2025-01-11T10:30:05.000Z"}
```

### 🔹 **Performance Monitoring**

#### **POST /performance**
Log detailed performance metrics.

**Request Body:**
```json
{
  "activityLogId": "activity-uuid",
  "sessionId": "session-uuid",
  "metricType": "API_PERFORMANCE",
  "metricName": "Portfolio Data Load",
  "startTime": "2025-01-11T10:29:30.000Z",
  "endTime": "2025-01-11T10:30:00.000Z",
  "durationMs": 30000,
  "memoryUsageMb": 256,
  "cpuUsagePercent": 35,
  "databaseQueryTimeMs": 15000,
  "databaseQueriesCount": 15,
  "databaseRowsAffected": 5000,
  "apiEndpoint": "/api/v1/portfolio/accounts",
  "httpMethod": "GET",
  "httpStatusCode": 200,
  "responseSizeBytes": 2048000,
  "pageLoadTimeMs": 25000,
  "domContentLoadedTimeMs": 18000,
  "firstContentfulPaintTimeMs": 12000,
  "largestContentfulPaintTimeMs": 22000,
  "moduleAccessed": "Portfolio",
  "businessProcess": "Portfolio Management",
  "bankingType": "conventional",
  "performanceCategory": "GOOD",
  "slaCompliance": true,
  "metadata": {
    "queryComplexity": "HIGH",
    "dataVolume": "LARGE"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "performance-uuid",
    "tenantId": "iaf",
    "metricType": "API_PERFORMANCE",
    "metricName": "Portfolio Data Load",
    "durationMs": 30000,
    "performanceCategory": "GOOD",
    "slaCompliance": true
  },
  "message": "Performance metrics logged successfully"
}
```

#### **GET /performance/analytics**
Get comprehensive performance analytics and insights.

**Query Parameters:**
- `period` (string): Time period (1h, 24h, 7d, 30d)
- `module` (string): Filter by module

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avgResponseTime": 285,
    "maxResponseTime": 3500,
    "minResponseTime": 45,
    "p50ResponseTime": 250,
    "p95ResponseTime": 800,
    "p99ResponseTime": 2000,
    "slaComplianceRate": 92,
    "performanceDistribution": {
      "excellent": 1200,
      "good": 800,
      "average": 300,
      "poor": 80,
      "critical": 20
    },
    "modulePerformance": {
      "Portfolio": { "avgTime": 320, "slaRate": 88 },
      "Dashboard": { "avgTime": 180, "slaRate": 95 },
      "Reports": { "avgTime": 450, "slaRate": 85 }
    }
  },
  "period": "24h",
  "module": "Portfolio",
  "totalRecords": 2400
}
```

### 🔹 **Security Events**

#### **POST /security/events**
Log security events and incidents.

**Request Body:**
```json
{
  "eventType": "SUSPICIOUS_LOGIN",
  "eventSeverity": "MEDIUM",
  "eventDescription": "Multiple failed login attempts detected",
  "eventCategory": "Authentication",
  "userId": "user-uuid",
  "sessionId": "session-uuid",
  "ipAddress": "192.168.1.200",
  "userAgent": "Suspicious User Agent",
  "requestPath": "/api/v1/auth/login",
  "requestMethod": "POST",
  "moduleAccessed": "Authentication",
  "bankingType": "conventional",
  "assignedTo": "security-team-uuid",
  "investigationNotes": "User attempted 5 failed logins within 2 minutes",
  "riskScore": 65,
  "businessImpact": "MEDIUM",
  "complianceRelevant": true,
  "regulatoryImpact": false,
  "metadata": {
    "failedAttempts": 5,
    "lockoutDuration": 300,
    "lastAttemptTime": "2025-01-11T10:28:00.000Z",
    "sourceIP": "192.168.1.200",
    "attackVector": "Brute Force"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "security-event-uuid",
    "tenantId": "iaf",
    "eventType": "SUSPICIOUS_LOGIN",
    "eventSeverity": "MEDIUM",
    "eventStatus": "OPEN",
    "eventDescription": "Multiple failed login attempts detected",
    "riskScore": 65,
    "businessImpact": "MEDIUM",
    "complianceRelevant": true,
    "eventTimestamp": "2025-01-11T10:30:00.000Z",
    "detectedAt": "2025-01-11T10:30:00.000Z"
  },
  "message": "Security event logged successfully"
}
```

#### **GET /security/events**
Query security events with filtering options.

**Query Parameters:**
- `severity` (string): Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)
- `status` (string): Filter by status (OPEN, INVESTIGATING, RESOLVED, CLOSED)
- `limit` (number): Pagination limit (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "security-event-uuid",
      "eventType": "SUSPICIOUS_LOGIN",
      "eventSeverity": "MEDIUM",
      "eventStatus": "OPEN",
      "eventDescription": "Multiple failed login attempts detected",
      "userId": "user-uuid",
      "ipAddress": "192.168.1.200",
      "moduleAccessed": "Authentication",
      "riskScore": 65,
      "businessImpact": "MEDIUM",
      "complianceRelevant": true,
      "eventTimestamp": "2025-01-11T10:28:00.000Z",
      "detectedAt": "2025-01-11T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### 🔹 **Export & Compliance**

#### **GET /export**
Export user activities data in various formats.

**Query Parameters:**
- `format` (string): Export format (csv, json, excel)
- `userId` (string): Filter by user ID
- `activityType` (string): Filter by activity type
- `dateFrom` (datetime): Export from date
- `dateTo` (datetime): Export to date
- `complianceRelevant` (boolean): Filter compliance activities

**Example Request:**
```
GET /api/v1/user-activity/export?format=csv&dateFrom=2025-01-01T00:00:00.000Z&dateTo=2025-01-11T23:59:59.000Z&complianceRelevant=true
```

**Response (200 OK) for CSV:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="user-activities-iaf-2025-01-11.csv"

id,timestamp,userId,sessionId,activityType,actionPerformed,targetEntity,pageUrl,moduleAccessed,actionResult,responseTimeMs,ipAddress,riskLevel,complianceRelevant
activity-uuid,2025-01-11T10:30:00.000Z,user-uuid,session-uuid,USER_LOGIN,User logged in,Authentication,/login,Authentication,SUCCESS,250,192.168.1.100,LOW,true
```

**Response (200 OK) for JSON:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity-uuid",
      "timestamp": "2025-01-11T10:30:00.000Z",
      "userId": "user-uuid",
      "sessionId": "session-uuid",
      "activityType": "USER_LOGIN",
      "actionPerformed": "User logged in",
      "targetEntity": "Authentication",
      "pageUrl": "https://iaf-ifrs.danafin.com/login",
      "moduleAccessed": "Authentication",
      "actionResult": "SUCCESS",
      "responseTimeMs": 250,
      "ipAddress": "192.168.1.100",
      "riskLevel": "LOW",
      "complianceRelevant": true
    }
  ],
  "filename": "user-activities-iaf-2025-01-11.json",
  "exportedAt": "2025-01-11T10:30:00.000Z",
  "totalRecords": 1250
}
```

#### **POST /compliance/reports**
Generate regulatory compliance reports.

**Request Body:**
```json
{
  "reportType": "GDPR",
  "dateFrom": "2025-01-01T00:00:00.000Z",
  "dateTo": "2025-01-31T23:59:59.000Z",
  "format": "json"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportType": "GDPR",
    "generatedAt": "2025-01-11T10:30:00.000Z",
    "period": {
      "from": "2025-01-01T00:00:00.000Z",
      "to": "2025-01-31T23:59:59.000Z"
    },
    "generatedBy": "user-uuid",
    "tenantId": "iaf",
    "data": {
      "totalActivities": 15420,
      "complianceRelevantActivities": 3250,
      "highRiskActivities": 125,
      "failedActivities": 485,
      "uniqueUsers": 85,
      "avgResponseTime": 285,
      "activitiesByRiskLevel": {
        "LOW": 12500,
        "MEDIUM": 2250,
        "HIGH": 150,
        "CRITICAL": 20
      },
      "gdprSpecific": {
        "dataProcessingActivities": 850,
        "consentRelatedActivities": 1200,
        "dataExportActivities": 45,
        "piiAccessEvents": 650
      }
    },
    "summary": {
      "totalRecords": 15420,
      "complianceScore": 78,
      "riskLevel": "MEDIUM",
      "recommendations": [
        "Consider reviewing high-risk activities and implementing additional security measures",
        "High failure rate detected. Review error handling and system reliability"
      ]
    },
    "totalRecords": 15420
  },
  "message": "GDPR compliance report generated successfully"
}
```

### 🔹 **Dashboard & Health**

#### **GET /dashboard**
Get comprehensive dashboard data for monitoring.

**Query Parameters:**
- `period` (string): Time period (1h, 24h, 7d, 30d)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalActivities": 5420,
      "successfulActivities": 5180,
      "failedActivities": 180,
      "criticalRiskActivities": 5,
      "uniqueUsers": 85,
      "avgResponseTime": 285,
      "complianceRelevantActivities": 1250
    },
    "realTime": {
      "total_activities": 45,
      "successful_activities": 42,
      "high_risk_activities": 2,
      "active_users": 12,
      "active_sessions": 15
    },
    "performance": {
      "avgResponseTime": 285,
      "maxResponseTime": 3500,
      "p95ResponseTime": 800,
      "slaComplianceRate": 92
    },
    "recentActivities": [
      {
        "id": "activity-uuid",
        "activityType": "DATA_ACCESS",
        "actionPerformed": "Accessed portfolio data",
        "riskLevel": "MEDIUM",
        "actionResult": "SUCCESS",
        "activityTimestamp": "2025-01-11T10:29:45.000Z",
        "userName": "John Doe"
      }
    ],
    "alerts": [
      {
        "level": "warning",
        "title": "High Failure Rate",
        "message": "3.3% of activities are failing",
        "action": "Review error logs and system performance"
      }
    ],
    "period": "24h",
    "timestamp": "2025-01-11T10:30:00.000Z"
  }
}
```

#### **GET /health**
Health check for user activity service.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-11T10:30:00.000Z",
    "service": "user-activity-tracking",
    "version": "1.0.0",
    "tenantId": "iaf",
    "features": {
      "realTimeMonitoring": true,
      "performanceMonitoring": true,
      "securityEventDetection": true,
      "complianceReporting": true,
      "geolocationTracking": true,
      "sessionTracking": true
    },
    "endpoints": [
      "POST /logs",
      "POST /logs/batch",
      "POST /sessions",
      "GET /sessions/:sessionId",
      "GET /activities",
      "GET /statistics",
      "GET /real-time",
      "GET /live-feed",
      "POST /performance",
      "GET /performance/analytics",
      "POST /security/events",
      "GET /security/events",
      "GET /export",
      "POST /compliance/reports",
      "GET /dashboard"
    ]
  }
}
```

---

## 📊 Data Models

### **UserActivityLog**
```typescript
interface UserActivityLog {
  id: string;
  tenantId: string;
  userId: string;
  sessionId: string;
  correlationId: string;
  activityType: string;
  actionPerformed: string;
  activityDescription: string;
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
  activityTimestamp: Date;
  createdAt: Date;
}
```

### **SessionTracking**
```typescript
interface SessionTracking {
  id: string;
  tenantId: string;
  sessionId: string;
  userId?: string;
  sessionStart: Date;
  sessionEnd?: Date;
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
  createdAt: Date;
  updatedAt: Date;
}
```

### **SecurityEvent**
```typescript
interface SecurityEvent {
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
  eventTimestamp: Date;
  detectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔧 Error Handling

### **Standard Error Response Format**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2025-01-11T10:30:00.000Z",
  "requestId": "req-uuid"
}
```

### **Common Error Codes**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_CONTEXT` - Tenant context required
- `DATABASE_ERROR` - Database operation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

---

## 🚀 Rate Limiting

### **Rate Limit Configuration**
- **Strict Endpoints**: 100 requests per 15 minutes
  - POST /logs
  - GET /real-time
  - GET /live-feed
  - POST /security/events
  - GET /export

- **Moderate Endpoints**: 500 requests per 15 minutes
  - POST /logs/batch
  - POST /sessions
  - GET /activities
  - GET /statistics
  - POST /performance
  - GET /performance/analytics
  - GET /security/events
  - GET /dashboard

---

## 📋 Usage Examples

### **cURL Examples**

**1. Log User Activity:**
```bash
curl -X POST "https://iaf-ifrs-be.danafin.com/api/v1/user-activity/logs" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: iaf" \
  -d '{
    "userId": "user-uuid",
    "sessionId": "session-uuid",
    "activityType": "USER_LOGIN",
    "actionPerformed": "User logged in to system",
    "actionResult": "SUCCESS",
    "responseTimeMs": 250,
    "moduleAccessed": "Authentication",
    "complianceRelevant": true
  }'
```

**2. Query Activities:**
```bash
curl -X GET "https://iaf-ifrs-be.danafin.com/api/v1/user-activity/activities?limit=20&sortBy=activity_timestamp&sortOrder=DESC" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-ID: iaf"
```

**3. Get Statistics:**
```bash
curl -X GET "https://iaf-ifrs-be.danafin.com/api/v1/user-activity/statistics?dateFrom=2025-01-10T00:00:00.000Z&dateTo=2025-01-11T23:59:59.000Z" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-ID: iaf"
```

**4. Export Data:**
```bash
curl -X GET "https://iaf-ifrs-be.danafin.com/api/v1/user-activity/export?format=csv&dateFrom=2025-01-01T00:00:00.000Z&complianceRelevant=true" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Tenant-ID: iaf" \
  -o user-activities.csv
```

### **JavaScript/Fetch Examples**

**1. Log Activity:**
```javascript
const response = await fetch('https://iaf-ifrs-be.danafin.com/api/v1/user-activity/logs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'iaf'
  },
  body: JSON.stringify({
    userId: 'user-uuid',
    sessionId: 'session-uuid',
    activityType: 'PAGE_VIEW',
    actionPerformed: 'Viewed dashboard',
    actionResult: 'SUCCESS',
    responseTimeMs: 150,
    moduleAccessed: 'Dashboard'
  })
});

const result = await response.json();
```

**2. Get Real-time Monitoring:**
```javascript
const response = await fetch('https://iaf-ifrs-be.danafin.com/api/v1/user-activity/real-time?timeWindowMinutes=5', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': 'iaf'
  }
});

const monitoringData = await response.json();
```

---

## 🎯 Best Practices

### **1. Activity Logging**
- Log all user interactions for complete audit trail
- Include performance metrics for monitoring
- Set appropriate risk levels for activities
- Use compliance flags for regulatory activities

### **2. Session Management**
- Track session lifecycle comprehensively
- Monitor session security events
- Calculate engagement scores for analytics
- Handle session timeouts and expiration

### **3. Performance Monitoring**
- Log performance metrics for all operations
- Monitor SLA compliance
- Track database query performance
- Analyze user experience metrics

### **4. Security**
- Log all security events immediately
- Use risk scoring for threat assessment
- Monitor for suspicious patterns
- Implement automated security alerts

### **5. Compliance**
- Use GDPR basis for data processing
- Track regulatory impact of activities
- Generate compliance reports regularly
- Maintain data retention policies

---

## 🔍 Monitoring & Troubleshooting

### **Health Check**
```bash
curl -X GET "https://iaf-ifrs-be.danafin.com/api/v1/user-activity/health"
```

### **Common Issues**
1. **Database Connection**: Ensure tenant database is accessible
2. **Authentication**: Verify JWT token and tenant context
3. **Rate Limiting**: Check request frequency and implement backoff
4. **Large Exports**: Use pagination for large datasets
5. **Real-time Feeds**: Monitor SSE connection stability

### **Performance Tips**
- Use appropriate time windows for queries
- Implement client-side caching for dashboard data
- Use pagination for large activity sets
- Batch logging for high-volume scenarios

---

## 📞 Support

For technical support or questions about the User Activity Tracking API:
- **Documentation**: This comprehensive guide
- **Health Check**: `/health` endpoint
- **Monitoring**: Dashboard endpoint with alerts
- **Logs**: Application logs with detailed error information

---

**Last Updated**: January 11, 2025
**Version**: 1.0.0
**API Version**: v1