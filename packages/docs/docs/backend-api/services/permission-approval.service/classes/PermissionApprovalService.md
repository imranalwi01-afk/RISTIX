[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: PermissionApprovalService

Defined in: [src/services/permission-approval.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L28)

## Constructors

### Constructor

> **new PermissionApprovalService**(`db`): `PermissionApprovalService`

Defined in: [src/services/permission-approval.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L31)

#### Parameters

##### db

`PostgresJsDatabase`\<[`db/schema`](../../../db/schema/README.md)\>

#### Returns

`PermissionApprovalService`

## Methods

### canUserApprove()

> **canUserApprove**(`userMaxHierarchyLevel`, `requiredMinHierarchyLevel`): `boolean`

Defined in: [src/services/permission-approval.service.ts:110](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L110)

Check if user can approve based on their role hierarchy level

#### Parameters

##### userMaxHierarchyLevel

`number`

##### requiredMinHierarchyLevel

`number` | `null`

#### Returns

`boolean`

***

### deletePolicy()

> **deletePolicy**(`id`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:214](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L214)

Delete approval policy

#### Parameters

##### id

`string`

#### Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### getApprovalRequirement()

> **getApprovalRequirement**(`tenantId`, `permissionId`): `Effect`\<[`ApprovalRequirement`](../interfaces/ApprovalRequirement.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L38)

Get approval requirements for a specific permission

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

#### Returns

`Effect`\<[`ApprovalRequirement`](../interfaces/ApprovalRequirement.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### getBulkApprovalRequirements()

> **getBulkApprovalRequirements**(`tenantId`, `permissionIds`): `Effect`\<`Map`\<`string`, [`ApprovalRequirement`](../interfaces/ApprovalRequirement.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:159](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L159)

Bulk get approval requirements for multiple permissions

#### Parameters

##### tenantId

`string`

##### permissionIds

`string`[]

#### Returns

`Effect`\<`Map`\<`string`, [`ApprovalRequirement`](../interfaces/ApprovalRequirement.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### getEligibleApproverLevel()

> **getEligibleApproverLevel**(`tenantId`, `permissionId`): `Effect`\<`number` \| `null`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L124)

Get eligible approvers for a permission
Returns the minimum hierarchy level needed

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

#### Returns

`Effect`\<`number` \| `null`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### getPermissionsRequiringApproval()

> **getPermissionsRequiringApproval**(`tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L73)

Get all permissions requiring approval for a tenant

#### Parameters

##### tenantId

`string`

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### requiresApproval()

> **requiresApproval**(`tenantId`, `permissionId`): `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L59)

Check if a permission requires approval

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### upsertPolicy()

> **upsertPolicy**(`tenantId`, `permissionId`, `data`): `Effect`\<\{ `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `matrixId`: `string` \| `null`; `minHierarchyLevel`: `number` \| `null`; `permissionId`: `string`; `requiredApprovers`: `number`; `requiresApproval`: `boolean`; `tenantId`: `string`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L87)

Create or update an approval policy

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

##### data

###### description?

`string`

###### minHierarchyLevel?

`number` \| `null`

###### requiredApprovers?

`number`

###### requiresApproval

`boolean`

#### Returns

`Effect`\<\{ `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `matrixId`: `string` \| `null`; `minHierarchyLevel`: `number` \| `null`; `permissionId`: `string`; `requiredApprovers`: `number`; `requiresApproval`: `boolean`; `tenantId`: `string`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

***

### validateApprovalRequest()

> **validateApprovalRequest**(`tenantId`, `permissionId`): `Effect`\<\{ `needsApproval`: `boolean`; `requirement`: `null`; \} \| \{ `needsApproval`: `boolean`; `requirement`: [`ApprovalRequirement`](../interfaces/ApprovalRequirement.md); \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Defined in: [src/services/permission-approval.service.ts:139](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/permission-approval.service.ts#L139)

Validate approval request
Checks if the permission requires approval and returns requirements

#### Parameters

##### tenantId

`string`

##### permissionId

`string`

#### Returns

`Effect`\<\{ `needsApproval`: `boolean`; `requirement`: `null`; \} \| \{ `needsApproval`: `boolean`; `requirement`: [`ApprovalRequirement`](../interfaces/ApprovalRequirement.md); \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>
