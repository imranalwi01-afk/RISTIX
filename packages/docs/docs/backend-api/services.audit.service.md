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

> **approved**: (`requestId`, `title`, `approvedBy`, `tenantId`, `comment?`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### cancelled()

> **cancelled**: (`requestId`, `title`, `cancelledBy`, `tenantId`, `reason?`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### delegated()

> **delegated**: (`requestId`, `title`, `delegatedBy`, `tenantId`, `delegatedTo?`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### infoRequested()

> **infoRequested**: (`requestId`, `title`, `requestedBy`, `tenantId`, `comment?`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### rejected()

> **rejected**: (`requestId`, `title`, `rejectedBy`, `tenantId`, `reason?`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### requested()

> **requested**: (`requestId`, `title`, `requestedBy`, `tenantId`, `details?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

***

### logAuth

> `const` **logAuth**: `object`

Defined in: [src/services/audit.service.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L89)

Log authentication events

#### Type Declaration

##### login()

> **login**: (`userId`, `tenantId`, `ipAddress?`, `userAgent?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### loginFailed()

> **loginFailed**: (`email`, `tenantId?`, `ipAddress?`, `reason?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### logout()

> **logout**: (`userId`, `tenantId`, `ipAddress?`) => `Promise`\<`void`\>

###### Parameters

###### userId

`string`

###### tenantId

`string`

###### ipAddress?

`string`

###### Returns

`Promise`\<`void`\>

##### sessionExpired()

> **sessionExpired**: (`userId`, `tenantId`) => `Promise`\<`void`\>

###### Parameters

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`\<`void`\>

***

### logDataChange

> `const` **logDataChange**: `object`

Defined in: [src/services/audit.service.ts:143](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L143)

Log data modification events

#### Type Declaration

##### create()

> **create**: (`resource`, `resourceId`, `newValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### delete()

> **delete**: (`resource`, `resourceId`, `oldValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### update()

> **update**: (`resource`, `resourceId`, `oldValues`, `newValues`, `userId`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

***

### logJob

> `const` **logJob**: `object`

Defined in: [src/services/audit.service.ts:285](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L285)

Log job events

#### Type Declaration

##### completed()

> **completed**: (`executionId`, `jobName`, `duration`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### created()

> **created**: (`jobId`, `jobName`, `jobType`, `userId`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### failed()

> **failed**: (`executionId`, `jobName`, `error`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### triggered()

> **triggered**: (`executionId`, `jobName`, `jobType`, `userId`, `tenantId`, `parameters?`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

***

### logPermission

> `const` **logPermission**: `object`

Defined in: [src/services/audit.service.ts:215](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L215)

Log permission changes

#### Type Declaration

##### permissionsUpdated()

> **permissionsUpdated**: (`roleId`, `roleName`, `oldPermissions`, `newPermissions`, `updatedBy`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### roleAssigned()

> **roleAssigned**: (`userId`, `roleId`, `roleName`, `assignedBy`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

##### roleRevoked()

> **roleRevoked**: (`userId`, `roleId`, `roleName`, `revokedBy`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

***

### logSystem

> `const` **logSystem**: `object`

Defined in: [src/services/audit.service.ts:522](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L522)

Log system events

#### Type Declaration

##### backupCreated()

> **backupCreated**: (`backupId`, `userId`, `tenantId`) => `Promise`\<`void`\>

###### Parameters

###### backupId

`string`

###### userId

`string`

###### tenantId

`string`

###### Returns

`Promise`\<`void`\>

##### configChanged()

> **configChanged**: (`configKey`, `oldValue`, `newValue`, `userId`, `tenantId`) => `Promise`\<`void`\>

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

`Promise`\<`void`\>

## Functions

### logAuditEvent()

> **logAuditEvent**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L12)

Core audit logging function.
Uses tenantDb since audit schema exists in tenant database.

#### Parameters

##### params

`Partial`\<[`NewAuditLog`](db.schema.audit.schema.md#newauditlog)\>

Partial audit log data used to create the log entry

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written, or catches error silently

***

### logCalculation()

> **logCalculation**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L68)

Log calculation execution.

#### Parameters

##### params

`Partial`\<[`NewCalculationAuditLog`](db.schema.audit.schema.md#newcalculationauditlog)\>

Partial calculation audit log data

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written

***

### logDataAccess()

> **logDataAccess**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L49)

Log data access.

#### Parameters

##### params

`Partial`\<[`NewDataAccessLog`](db.schema.audit.schema.md#newdataaccesslog)\>

Partial data access log data

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written

***

### logUserActivity()

> **logUserActivity**(`params`): `Promise`\<`void`\>

Defined in: [src/services/audit.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/audit.service.ts#L31)

Log user activity.

#### Parameters

##### params

`Partial`\<[`NewUserActivityLog`](db.schema.audit.schema.md#newuseractivitylog)\>

Partial user activity log data

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the log is written
