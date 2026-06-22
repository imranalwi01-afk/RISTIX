[**Backend API Reference v1.0.0**](index.md)

***

# services/audit.service

## Variables

### logApproval

> `const` **logApproval**: `object`

Defined in: [src/services/audit.service.ts:355](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L355)

Log approval events

#### Type Declaration

##### approved()

> **approved**: (`requestId`, `title`, `approvedBy`, `tenantId`, `comment?`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### approvedBy

`string`

###### tenantId

`string`

###### comment?

`string`

###### details?

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

##### cancelled()

> **cancelled**: (`requestId`, `title`, `cancelledBy`, `tenantId`, `reason?`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### cancelledBy

`string`

###### tenantId

`string`

###### reason?

`string`

###### details?

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

##### delegated()

> **delegated**: (`requestId`, `title`, `delegatedBy`, `tenantId`, `delegatedTo?`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### delegatedBy

`string`

###### tenantId

`string`

###### delegatedTo?

`string`

###### details?

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

##### infoRequested()

> **infoRequested**: (`requestId`, `title`, `requestedBy`, `tenantId`, `comment?`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### requestedBy

`string`

###### tenantId

`string`

###### comment?

`string`

###### details?

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

##### rejected()

> **rejected**: (`requestId`, `title`, `rejectedBy`, `tenantId`, `reason?`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### rejectedBy

`string`

###### tenantId

`string`

###### reason?

`string`

###### details?

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

##### requested()

> **requested**: (`requestId`, `title`, `requestedBy`, `tenantId`, `details?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### requestId

`string`

###### title

`string`

###### requestedBy

`string`

###### tenantId

`string`

###### details?

###### description?

`string`

###### entityId?

`string`

###### entityType?

`string`

###### metadata?

`any`

###### newValues?

`any`

###### oldValues?

`any`

###### Returns

`Promise`&lt;`void`&gt;

***

### logAuth

> `const` **logAuth**: `object`

Defined in: [src/services/audit.service.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L89)

Log authentication events

#### Type Declaration

##### login()

> **login**: (`userId`, `tenantId`, `ipAddress?`, `userAgent?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### userId

`string`

###### tenantId

`string`

###### ipAddress?

`string`

###### userAgent?

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### loginFailed()

> **loginFailed**: (`email`, `tenantId?`, `ipAddress?`, `reason?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### email

`string`

###### tenantId?

`string`

###### ipAddress?

`string`

###### reason?

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### logout()

> **logout**: (`userId`, `tenantId`, `ipAddress?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### userId

`string`

###### tenantId

`string`

###### ipAddress?

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### sessionExpired()

> **sessionExpired**: (`userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

***

### logDataChange

> `const` **logDataChange**: `object`

Defined in: [src/services/audit.service.ts:143](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L143)

Log data modification events

#### Type Declaration

##### create()

> **create**: (`resource`, `resourceId`, `newValues`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### resource

`string`

###### resourceId

`string`

###### newValues

`any`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### delete()

> **delete**: (`resource`, `resourceId`, `oldValues`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### resource

`string`

###### resourceId

`string`

###### oldValues

`any`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### update()

> **update**: (`resource`, `resourceId`, `oldValues`, `newValues`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### resource

`string`

###### resourceId

`string`

###### oldValues

`any`

###### newValues

`any`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

***

### logJob

> `const` **logJob**: `object`

Defined in: [src/services/audit.service.ts:285](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L285)

Log job events

#### Type Declaration

##### completed()

> **completed**: (`executionId`, `jobName`, `duration`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### executionId

`string`

###### jobName

`string`

###### duration

`number`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### created()

> **created**: (`jobId`, `jobName`, `jobType`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### jobId

`string`

###### jobName

`string`

###### jobType

`string`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### failed()

> **failed**: (`executionId`, `jobName`, `error`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### executionId

`string`

###### jobName

`string`

###### error

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### triggered()

> **triggered**: (`executionId`, `jobName`, `jobType`, `userId`, `tenantId`, `parameters?`) => `Promise`&lt;`void`&gt;

###### Parameters

###### executionId

`string`

###### jobName

`string`

###### jobType

`string`

###### userId

`string`

###### tenantId

`string`

###### parameters?

`any`

###### Returns

`Promise`&lt;`void`&gt;

***

### logPermission

> `const` **logPermission**: `object`

Defined in: [src/services/audit.service.ts:215](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L215)

Log permission changes

#### Type Declaration

##### permissionsUpdated()

> **permissionsUpdated**: (`roleId`, `roleName`, `oldPermissions`, `newPermissions`, `updatedBy`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### roleId

`string`

###### roleName

`string`

###### oldPermissions

`any`

###### newPermissions

`any`

###### updatedBy

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### roleAssigned()

> **roleAssigned**: (`userId`, `roleId`, `roleName`, `assignedBy`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### userId

`string`

###### roleId

`string`

###### roleName

`string`

###### assignedBy

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### roleRevoked()

> **roleRevoked**: (`userId`, `roleId`, `roleName`, `revokedBy`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### userId

`string`

###### roleId

`string`

###### roleName

`string`

###### revokedBy

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

***

### logSystem

> `const` **logSystem**: `object`

Defined in: [src/services/audit.service.ts:522](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L522)

Log system events

#### Type Declaration

##### backupCreated()

> **backupCreated**: (`backupId`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### backupId

`string`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### configChanged()

> **configChanged**: (`configKey`, `oldValue`, `newValue`, `userId`, `tenantId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### configKey

`string`

###### oldValue

`any`

###### newValue

`any`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;`void`&gt;

## Functions

### logAuditEvent()

> **logAuditEvent**(`params`): `Promise`&lt;`void`&gt;

Defined in: [src/services/audit.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L12)

Core audit logging function.
Uses tenantDb since audit schema exists in tenant database.

#### Parameters

##### params

`Partial`&lt;[`NewAuditLog`](db.schema.audit.schema.md#newauditlog)&gt;

Partial audit log data used to create the log entry

#### Returns

`Promise`&lt;`void`&gt;

A Promise that resolves when the log is written, or catches error silently

***

### logCalculation()

> **logCalculation**(`params`): `Promise`&lt;`void`&gt;

Defined in: [src/services/audit.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L68)

Log calculation execution.

#### Parameters

##### params

`Partial`&lt;[`NewCalculationAuditLog`](db.schema.audit.schema.md#newcalculationauditlog)&gt;

Partial calculation audit log data

#### Returns

`Promise`&lt;`void`&gt;

A Promise that resolves when the log is written

***

### logDataAccess()

> **logDataAccess**(`params`): `Promise`&lt;`void`&gt;

Defined in: [src/services/audit.service.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L49)

Log data access.

#### Parameters

##### params

`Partial`&lt;[`NewDataAccessLog`](db.schema.audit.schema.md#newdataaccesslog)&gt;

Partial data access log data

#### Returns

`Promise`&lt;`void`&gt;

A Promise that resolves when the log is written

***

### logUserActivity()

> **logUserActivity**(`params`): `Promise`&lt;`void`&gt;

Defined in: [src/services/audit.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L31)

Log user activity.

#### Parameters

##### params

`Partial`&lt;[`NewUserActivityLog`](db.schema.audit.schema.md#newuseractivitylog)&gt;

Partial user activity log data

#### Returns

`Promise`&lt;`void`&gt;

A Promise that resolves when the log is written
