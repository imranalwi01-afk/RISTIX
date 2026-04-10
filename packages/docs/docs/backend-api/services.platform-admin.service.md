[**Backend API Reference v1.0.0**](index.md)

***

# services/platform-admin.service

## Interfaces

### PlatformStats

Defined in: [src/services/platform-admin.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L19)

#### Properties

##### activeSessionsLast24h

> **activeSessionsLast24h**: `number`

Defined in: [src/services/platform-admin.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L25)

##### activeTenants

> **activeTenants**: `number`

Defined in: [src/services/platform-admin.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L21)

##### activeUsers

> **activeUsers**: `number`

Defined in: [src/services/platform-admin.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L23)

##### auditLogsLast24h

> **auditLogsLast24h**: `number`

Defined in: [src/services/platform-admin.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L26)

##### totalRoles

> **totalRoles**: `number`

Defined in: [src/services/platform-admin.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L24)

##### totalTenants

> **totalTenants**: `number`

Defined in: [src/services/platform-admin.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L20)

##### totalUsers

> **totalUsers**: `number`

Defined in: [src/services/platform-admin.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L22)

***

### SystemHealth

Defined in: [src/services/platform-admin.service.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L29)

#### Properties

##### database

> **database**: `"healthy"` \| `"degraded"` \| `"unhealthy"`

Defined in: [src/services/platform-admin.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L30)

##### memory

> **memory**: `object`

Defined in: [src/services/platform-admin.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L31)

###### percentage

> **percentage**: `number`

###### total

> **total**: `number`

###### used

> **used**: `number`

##### uptime

> **uptime**: `number`

Defined in: [src/services/platform-admin.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L36)

##### version

> **version**: `string`

Defined in: [src/services/platform-admin.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L37)

***

### TenantOverview

Defined in: [src/services/platform-admin.service.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L40)

#### Properties

##### bankingMode

> **bankingMode**: `string` \| `null`

Defined in: [src/services/platform-admin.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L44)

##### code

> **code**: `string`

Defined in: [src/services/platform-admin.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L43)

##### createdAt

> **createdAt**: `Date`

Defined in: [src/services/platform-admin.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L47)

##### id

> **id**: `string`

Defined in: [src/services/platform-admin.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L41)

##### isActive

> **isActive**: `boolean`

Defined in: [src/services/platform-admin.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L46)

##### name

> **name**: `string`

Defined in: [src/services/platform-admin.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L42)

##### userCount

> **userCount**: `number`

Defined in: [src/services/platform-admin.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L45)

## Functions

### getPlatformStats()

> **getPlatformStats**(): `Effect`\<[`PlatformStats`](#platformstats), [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/services/platform-admin.service.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L60)

Get platform-wide statistics.
Aggregates counts for tenants, users, roles, active sessions, and audit logs.

#### Returns

`Effect`\<[`PlatformStats`](#platformstats), [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to PlatformStats object

***

### getRecentActivity()

> **getRecentActivity**(`limit`): `Effect`\<`any`[], [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/services/platform-admin.service.ts:193](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L193)

Get recent activity summary.
Returns the most recent audit logs.

#### Parameters

##### limit

`number` = `10`

Number of logs to return (default 10)

#### Returns

`Effect`\<`any`[], [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to an array of log objects

***

### getSystemHealth()

> **getSystemHealth**(): `Effect`\<[`SystemHealth`](#systemhealth), [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/services/platform-admin.service.ts:111](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L111)

Get system health status.
Checks database connectivity and memory usage.

#### Returns

`Effect`\<[`SystemHealth`](#systemhealth), [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to SystemHealth object

***

### getTenantOverview()

> **getTenantOverview**(): `Effect`\<[`TenantOverview`](#tenantoverview)[], [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/services/platform-admin.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/platform-admin.service.ts#L145)

Get tenant overview for dashboard.
Lists tenants with their user counts.

#### Returns

`Effect`\<[`TenantOverview`](#tenantoverview)[], [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to an array of TenantOverview objects
