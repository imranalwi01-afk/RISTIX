[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: AuditRepository

> `const` **AuditRepository**: `object`

Defined in: [packages/new-backend/src/repositories/audit.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/audit.repository.ts#L24)

## Type Declaration

### createAuditLog()

> **createAuditLog**: (`data`) => `Promise`\<\{ `action`: `string`; `changedFields`: `string`[] \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityName`: `string` \| `null`; `entityType`: `string` \| `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string` \| `null`; \}\>

Create a new audit log entry.

#### Parameters

##### data

The audit log data

###### action

`string`

###### changedFields?

`string`[] \| `null`

###### createdAt?

`Date`

###### description?

`string` \| `null`

###### entityId?

`string` \| `null`

###### entityName?

`string` \| `null`

###### entityType?

`string` \| `null`

###### eventType

`string`

###### id?

`string`

###### ipAddress?

`string` \| `null`

###### metadata?

`unknown`

###### newValues?

`unknown`

###### oldValues?

`unknown`

###### tenantId?

`string` \| `null`

###### userAgent?

`string` \| `null`

###### userId?

`string` \| `null`

#### Returns

`Promise`\<\{ `action`: `string`; `changedFields`: `string`[] \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityName`: `string` \| `null`; `entityType`: `string` \| `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string` \| `null`; \}\>

The created audit log

### createCalculationAuditLog()

> **createCalculationAuditLog**: (`data`) => `Promise`\<\{ `calculationDate`: `Date`; `calculationType`: `string`; `errorMessage`: `string` \| `null`; `executionTimeMs`: `number` \| `null`; `id`: `string`; `inputSummary`: `unknown`; `outputSummary`: `unknown`; `parameters`: `unknown`; `recordsProcessed`: `number` \| `null`; `status`: `string`; `tenantId`: `string` \| `null`; `timestamp`: `Date`; `userId`: `string`; \}\>

Create a new calculation audit log.

#### Parameters

##### data

The calculation audit log data

###### calculationDate

`Date`

###### calculationType

`string`

###### errorMessage?

`string` \| `null`

###### executionTimeMs?

`number` \| `null`

###### id?

`string`

###### inputSummary?

`unknown`

###### outputSummary?

`unknown`

###### parameters?

`unknown`

###### recordsProcessed?

`number` \| `null`

###### status

`string`

###### tenantId?

`string` \| `null`

###### timestamp?

`Date`

###### userId

`string`

#### Returns

`Promise`\<\{ `calculationDate`: `Date`; `calculationType`: `string`; `errorMessage`: `string` \| `null`; `executionTimeMs`: `number` \| `null`; `id`: `string`; `inputSummary`: `unknown`; `outputSummary`: `unknown`; `parameters`: `unknown`; `recordsProcessed`: `number` \| `null`; `status`: `string`; `tenantId`: `string` \| `null`; `timestamp`: `Date`; `userId`: `string`; \}\>

The created calculation audit log

### createDataAccessLog()

> **createDataAccessLog**: (`data`) => `Promise`\<\{ `accessType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `purpose`: `string` \| `null`; `recordCount`: `number` \| `null`; `resourceId`: `string` \| `null`; `resourceType`: `string`; `tenantId`: `string` \| `null`; `timestamp`: `Date`; `userId`: `string`; \}\>

Create a new data access log.

#### Parameters

##### data

The data access log data

###### accessType

`string`

###### id?

`string`

###### ipAddress?

`string` \| `null`

###### purpose?

`string` \| `null`

###### recordCount?

`number` \| `null`

###### resourceId?

`string` \| `null`

###### resourceType

`string`

###### tenantId?

`string` \| `null`

###### timestamp?

`Date`

###### userId

`string`

#### Returns

`Promise`\<\{ `accessType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `purpose`: `string` \| `null`; `recordCount`: `number` \| `null`; `resourceId`: `string` \| `null`; `resourceType`: `string`; `tenantId`: `string` \| `null`; `timestamp`: `Date`; `userId`: `string`; \}\>

The created data access log

### createUserActivityLog()

> **createUserActivityLog**: (`data`) => `Promise`\<\{ `activityDescription`: `string` \| `null`; `activityType`: `string`; `createdAt`: `Date`; `deviceInfo`: `unknown`; `endpoint`: `string` \| `null`; `id`: `string`; `ipAddress`: `string` \| `null`; `method`: `string` \| `null`; `pageTitle`: `string` \| `null`; `pageUrl`: `string` \| `null`; `previousPage`: `string` \| `null`; `responseTimeMs`: `number` \| `null`; `sessionId`: `string` \| `null`; `statusCode`: `number` \| `null`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string`; \}\>

Create a new user activity log.

#### Parameters

##### data

The activity log data

###### activityDescription?

`string` \| `null`

###### activityType

`string`

###### createdAt?

`Date`

###### deviceInfo?

`unknown`

###### endpoint?

`string` \| `null`

###### id?

`string`

###### ipAddress?

`string` \| `null`

###### method?

`string` \| `null`

###### pageTitle?

`string` \| `null`

###### pageUrl?

`string` \| `null`

###### previousPage?

`string` \| `null`

###### responseTimeMs?

`number` \| `null`

###### sessionId?

`string` \| `null`

###### statusCode?

`number` \| `null`

###### tenantId?

`string` \| `null`

###### userAgent?

`string` \| `null`

###### userId

`string`

#### Returns

`Promise`\<\{ `activityDescription`: `string` \| `null`; `activityType`: `string`; `createdAt`: `Date`; `deviceInfo`: `unknown`; `endpoint`: `string` \| `null`; `id`: `string`; `ipAddress`: `string` \| `null`; `method`: `string` \| `null`; `pageTitle`: `string` \| `null`; `pageUrl`: `string` \| `null`; `previousPage`: `string` \| `null`; `responseTimeMs`: `number` \| `null`; `sessionId`: `string` \| `null`; `statusCode`: `number` \| `null`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string`; \}\>

The created activity log

### findAuditLogById()

> **findAuditLogById**: (`id`) => `PgRelationalQuery`\<\{ `action`: `string`; `changedFields`: `string`[] \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityName`: `string` \| `null`; `entityType`: `string` \| `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string` \| `null`; \} \| `undefined`\>

Find a single audit log by ID.

#### Parameters

##### id

`string`

The audit log ID

#### Returns

`PgRelationalQuery`\<\{ `action`: `string`; `changedFields`: `string`[] \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityName`: `string` \| `null`; `entityType`: `string` \| `null`; `eventType`: `string`; `id`: `string`; `ipAddress`: `string` \| `null`; `metadata`: `unknown`; `newValues`: `unknown`; `oldValues`: `unknown`; `tenantId`: `string` \| `null`; `userAgent`: `string` \| `null`; `userId`: `string` \| `null`; \} \| `undefined`\>

The audit log or undefined

### findAuditLogs()

> **findAuditLogs**: (`options`) => `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Find audit logs with filtering options.

#### Parameters

##### options

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

#### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

An object containing data array and total count

### findCalculationAuditLogs()

> **findCalculationAuditLogs**: (`options`) => `Promise`\<`object`[]\>

Find calculation audit logs with filtering.

#### Parameters

##### options

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

#### Returns

`Promise`\<`object`[]\>

An array of calculation audit logs

### findDataAccessLogs()

> **findDataAccessLogs**: (`options`) => `Promise`\<`object`[]\>

Find data access logs with filtering.

#### Parameters

##### options

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

#### Returns

`Promise`\<`object`[]\>

An array of data access logs

### findUserActivityLogs()

> **findUserActivityLogs**: (`options`) => `Promise`\<`object`[]\>

Find user activity logs with filtering.

#### Parameters

##### options

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

#### Returns

`Promise`\<`object`[]\>

An array of user activity logs

### getActivityStats()

> **getActivityStats**: (`tenantId`, `days`) => `Promise`\<`object`[]\>

Get activity statistics grouped by action for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

##### days

`number` = `7`

Number of days to look back (default 7)

#### Returns

`Promise`\<`object`[]\>

An array of action counts

### getAuditSummary()

> **getAuditSummary**: (`tenantId`) => `Promise`\<\{ `criticalEvents`: `number`; `highRiskEvents`: `number`; `todayLogs`: `number`; `totalLogs`: `number`; \}\>

Get summary metrics for audit logs (total, today, critical, high risk).

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Promise`\<\{ `criticalEvents`: `number`; `highRiskEvents`: `number`; `todayLogs`: `number`; `totalLogs`: `number`; \}\>

An object with summary counts

### getRecentActivity()

> **getRecentActivity**: (`tenantId`, `limit`) => `Promise`\<`object`[]\>

Get recent activity logs for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

##### limit

`number` = `10`

Max number of logs to return (default 10)

#### Returns

`Promise`\<`object`[]\>

An array of recent audit logs
