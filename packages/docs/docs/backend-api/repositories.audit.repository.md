[**Backend API Reference v1.0.0**](index.md)

***

# repositories/audit.repository

## Type Aliases

### AuditRepositoryType

> **AuditRepositoryType** = *typeof* [`AuditRepository`](#auditrepository)

Defined in: [src/repositories/audit.repository.ts:296](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/audit.repository.ts#L296)

## Variables

### AuditRepository

> `const` **AuditRepository**: `object`

Defined in: [src/repositories/audit.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/audit.repository.ts#L25)

#### Type Declaration

##### createAuditLog

> **createAuditLog**: (`data`) => `Promise`&lt;&#123; `action`: `string`; `changedFields`: `unknown`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityName`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string` &#124; `null`; &#125;&gt;

Create a new audit log entry.

###### Parameters

###### data

The audit log data

###### action

`string`

###### changedFields?

`unknown`

###### createdAt?

`Date`

###### description?

`string` &#124; `null`

###### entityId?

`string` &#124; `null`

###### entityName?

`string` &#124; `null`

###### entityType?

`string` &#124; `null`

###### eventType

`string`

###### id?

`string`

###### ipAddress?

`string` &#124; `null`

###### metadata?

`unknown`

###### newValues?

`unknown`

###### oldValues?

`unknown`

###### tenantId?

`string` &#124; `null`

###### userAgent?

`string` &#124; `null`

###### userId?

`string` &#124; `null`

###### Returns

`Promise`&lt;&#123; `action`: `string`; `changedFields`: `unknown`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityName`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string` &#124; `null`; &#125;&gt;

The created audit log

##### createCalculationAuditLog

> **createCalculationAuditLog**: (`data`) => `Promise`&lt;&#123; `calculationDate`: `Date`; `calculationType`: `string`; `errorMessage`: `string` &#124; `null`; `executionTimeMs`: `number` &#124; `null`; `id`: `string`; `inputSummary`: `unknown`; `outputSummary`: `unknown`; `parameters`: `unknown`; `recordsProcessed`: `number` &#124; `null`; `status`: `string`; `tenantId`: `string` &#124; `null`; `timestamp`: `Date`; `userId`: `string`; &#125;&gt;

Create a new calculation audit log.

###### Parameters

###### data

The calculation audit log data

###### calculationDate

`Date`

###### calculationType

`string`

###### errorMessage?

`string` &#124; `null`

###### executionTimeMs?

`number` &#124; `null`

###### id?

`string`

###### inputSummary?

`unknown`

###### outputSummary?

`unknown`

###### parameters?

`unknown`

###### recordsProcessed?

`number` &#124; `null`

###### status

`string`

###### tenantId?

`string` &#124; `null`

###### timestamp?

`Date`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `calculationDate`: `Date`; `calculationType`: `string`; `errorMessage`: `string` &#124; `null`; `executionTimeMs`: `number` &#124; `null`; `id`: `string`; `inputSummary`: `unknown`; `outputSummary`: `unknown`; `parameters`: `unknown`; `recordsProcessed`: `number` &#124; `null`; `status`: `string`; `tenantId`: `string` &#124; `null`; `timestamp`: `Date`; `userId`: `string`; &#125;&gt;

The created calculation audit log

##### createDataAccessLog

> **createDataAccessLog**: (`data`) => `Promise`&lt;&#123; `accessType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `purpose`: `string` &#124; `null`; `recordCount`: `number` &#124; `null`; `resourceId`: `string` &#124; `null`; `resourceType`: `string`; `tenantId`: `string` &#124; `null`; `timestamp`: `Date`; `userId`: `string`; &#125;&gt;

Create a new data access log.

###### Parameters

###### data

The data access log data

###### accessType

`string`

###### id?

`string`

###### ipAddress?

`string` &#124; `null`

###### purpose?

`string` &#124; `null`

###### recordCount?

`number` &#124; `null`

###### resourceId?

`string` &#124; `null`

###### resourceType

`string`

###### tenantId?

`string` &#124; `null`

###### timestamp?

`Date`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accessType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `purpose`: `string` &#124; `null`; `recordCount`: `number` &#124; `null`; `resourceId`: `string` &#124; `null`; `resourceType`: `string`; `tenantId`: `string` &#124; `null`; `timestamp`: `Date`; `userId`: `string`; &#125;&gt;

The created data access log

##### createUserActivityLog

> **createUserActivityLog**: (`data`) => `Promise`&lt;&#123; `activityDescription`: `string` &#124; `null`; `activityType`: `string`; `createdAt`: `Date`; `deviceInfo`: `unknown`; `endpoint`: `string` &#124; `null`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `method`: `string` &#124; `null`; `pageTitle`: `string` &#124; `null`; `pageUrl`: `string` &#124; `null`; `previousPage`: `string` &#124; `null`; `responseTimeMs`: `number` &#124; `null`; `sessionId`: `string` &#124; `null`; `statusCode`: `number` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string`; &#125;&gt;

Create a new user activity log.

###### Parameters

###### data

The activity log data

###### activityDescription?

`string` &#124; `null`

###### activityType

`string`

###### createdAt?

`Date`

###### deviceInfo?

`unknown`

###### endpoint?

`string` &#124; `null`

###### id?

`string`

###### ipAddress?

`string` &#124; `null`

###### method?

`string` &#124; `null`

###### pageTitle?

`string` &#124; `null`

###### pageUrl?

`string` &#124; `null`

###### previousPage?

`string` &#124; `null`

###### responseTimeMs?

`number` &#124; `null`

###### sessionId?

`string` &#124; `null`

###### statusCode?

`number` &#124; `null`

###### userAgent?

`string` &#124; `null`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `activityDescription`: `string` &#124; `null`; `activityType`: `string`; `createdAt`: `Date`; `deviceInfo`: `unknown`; `endpoint`: `string` &#124; `null`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `method`: `string` &#124; `null`; `pageTitle`: `string` &#124; `null`; `pageUrl`: `string` &#124; `null`; `previousPage`: `string` &#124; `null`; `responseTimeMs`: `number` &#124; `null`; `sessionId`: `string` &#124; `null`; `statusCode`: `number` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string`; &#125;&gt;

The created activity log

##### findAuditLogById

> **findAuditLogById**: (`id`) => `PgRelationalQuery`&lt;&#123; `action`: `string`; `changedFields`: `unknown`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityName`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string` &#124; `null`; &#125; &#124; `undefined`&gt;

Find a single audit log by ID.

###### Parameters

###### id

`string`

The audit log ID

###### Returns

`PgRelationalQuery`&lt;&#123; `action`: `string`; `changedFields`: `unknown`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityName`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` &#124; `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` &#124; `null`; `userAgent`: `string` &#124; `null`; `userId`: `string` &#124; `null`; &#125; &#124; `undefined`&gt;

The audit log or undefined

##### findAuditLogs

> **findAuditLogs**: (`options`) => `Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

Find audit logs with filtering options.

###### Parameters

###### options

Filter options (tenantId, userId, entityType, action, date range, pagination)

###### action?

`string`

###### endDate?

`Date`

###### entityType?

`string`

###### limit?

`number`

###### offset?

`number`

###### startDate?

`Date`

###### tenantId?

`string`

###### userId?

`string`

###### Returns

`Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

An object containing data array and total count

##### findCalculationAuditLogs

> **findCalculationAuditLogs**: (`options`) => `Promise`&lt;`object`[]&gt;

Find calculation audit logs with filtering.

###### Parameters

###### options

Filter options (tenantId, calculationType, status, pagination)

###### calculationType?

`string`

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

###### tenantId?

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

An array of calculation audit logs

##### findDataAccessLogs

> **findDataAccessLogs**: (`options`) => `Promise`&lt;`object`[]&gt;

Find data access logs with filtering.

###### Parameters

###### options

Filter options (tenantId, userId, resourceType, pagination)

###### limit?

`number`

###### offset?

`number`

###### resourceType?

`string`

###### tenantId?

`string`

###### userId?

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

An array of data access logs

##### findUserActivityLogs

> **findUserActivityLogs**: (`options`) => `Promise`&lt;`object`[]&gt;

Find user activity logs with filtering.

###### Parameters

###### options

Filter options (tenantId, userId, activityType, pagination)

###### activityType?

`string`

###### limit?

`number`

###### offset?

`number`

###### tenantId?

`string`

###### userId?

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

An array of user activity logs

##### getActivityStats

> **getActivityStats**: (`tenantId`, `days`) => `Promise`&lt;`object`[]&gt;

Get activity statistics grouped by action for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### days?

`number` = `7`

Number of days to look back (default 7)

###### Returns

`Promise`&lt;`object`[]&gt;

An array of action counts

##### getAuditSummary

> **getAuditSummary**: (`tenantId`) => `Promise`&lt;&#123; `criticalEvents`: `number`; `highRiskEvents`: `number`; `todayLogs`: `number`; `totalLogs`: `number`; &#125;&gt;

Get summary metrics for audit logs (total, today, critical, high risk).

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`Promise`&lt;&#123; `criticalEvents`: `number`; `highRiskEvents`: `number`; `todayLogs`: `number`; `totalLogs`: `number`; &#125;&gt;

An object with summary counts

##### getRecentActivity

> **getRecentActivity**: (`tenantId`, `limit`) => `Promise`&lt;`object`[]&gt;

Get recent activity logs for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### limit?

`number` = `10`

Max number of logs to return (default 10)

###### Returns

`Promise`&lt;`object`[]&gt;

An array of recent audit logs
