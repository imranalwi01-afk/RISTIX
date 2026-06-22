[**Backend API Reference v1.0.0**](index.md)

***

# services/permission-approval.service

## Classes

### PermissionApprovalService

Defined in: [src/services/permission-approval.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L28)

#### Constructors

##### Constructor

> **new PermissionApprovalService**(`db`): [`PermissionApprovalService`](#permissionapprovalservice)

Defined in: [src/services/permission-approval.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L31)

###### Parameters

###### db

`PostgresJsDatabase`&lt;[`db/schema`](db.schema.md)&gt;

###### Returns

[`PermissionApprovalService`](#permissionapprovalservice)

#### Methods

##### canUserApprove()

> **canUserApprove**(`userMaxHierarchyLevel`, `requiredMinHierarchyLevel`): `boolean`

Defined in: [src/services/permission-approval.service.ts:110](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L110)

Check if user can approve based on their role hierarchy level

###### Parameters

###### userMaxHierarchyLevel

`number`

###### requiredMinHierarchyLevel

`number` | `null`

###### Returns

`boolean`

##### deletePolicy()

> **deletePolicy**(`id`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:214](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L214)

Delete approval policy

###### Parameters

###### id

`string`

###### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getApprovalRequirement()

> **getApprovalRequirement**(`tenantId`, `permissionId`): `Effect`&lt;[`ApprovalRequirement`](#approvalrequirement), [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L38)

Get approval requirements for a specific permission

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### Returns

`Effect`&lt;[`ApprovalRequirement`](#approvalrequirement), [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getBulkApprovalRequirements()

> **getBulkApprovalRequirements**(`tenantId`, `permissionIds`): `Effect`&lt;`Map`&lt;`string`, [`ApprovalRequirement`](#approvalrequirement)&gt;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:159](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L159)

Bulk get approval requirements for multiple permissions

###### Parameters

###### tenantId

`string`

###### permissionIds

`string`[]

###### Returns

`Effect`&lt;`Map`&lt;`string`, [`ApprovalRequirement`](#approvalrequirement)&gt;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getEligibleApproverLevel()

> **getEligibleApproverLevel**(`tenantId`, `permissionId`): `Effect`&lt;`number` &#124; `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L124)

Get eligible approvers for a permission
Returns the minimum hierarchy level needed

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### Returns

`Effect`&lt;`number` &#124; `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getPermissionsRequiringApproval()

> **getPermissionsRequiringApproval**(`tenantId`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L73)

Get all permissions requiring approval for a tenant

###### Parameters

###### tenantId

`string`

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### requiresApproval()

> **requiresApproval**(`tenantId`, `permissionId`): `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L59)

Check if a permission requires approval

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### upsertPolicy()

> **upsertPolicy**(`tenantId`, `permissionId`, `data`): `Effect`&lt;&#123; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `matrixId`: `string` &#124; `null`; `minHierarchyLevel`: `number` &#124; `null`; `permissionId`: `string`; `requiredApprovers`: `number`; `requiresApproval`: `boolean`; `tenantId`: `string`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L87)

Create or update an approval policy

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### data

###### description?

`string`

###### minHierarchyLevel?

`number` &#124; `null`

###### requiredApprovers?

`number`

###### requiresApproval

`boolean`

###### Returns

`Effect`&lt;&#123; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `matrixId`: `string` &#124; `null`; `minHierarchyLevel`: `number` &#124; `null`; `permissionId`: `string`; `requiredApprovers`: `number`; `requiresApproval`: `boolean`; `tenantId`: `string`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### validateApprovalRequest()

> **validateApprovalRequest**(`tenantId`, `permissionId`): `Effect`&lt;&#123; `needsApproval`: `boolean`; `requirement`: `null`; &#125; &#124; &#123; `needsApproval`: `boolean`; `requirement`: [`ApprovalRequirement`](#approvalrequirement); &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/permission-approval.service.ts:139](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L139)

Validate approval request
Checks if the permission requires approval and returns requirements

###### Parameters

###### tenantId

`string`

###### permissionId

`string`

###### Returns

`Effect`&lt;&#123; `needsApproval`: `boolean`; `requirement`: `null`; &#125; &#124; &#123; `needsApproval`: `boolean`; `requirement`: [`ApprovalRequirement`](#approvalrequirement); &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

## Interfaces

### ApprovalRequirement

Defined in: [src/services/permission-approval.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L11)

#### Properties

##### description?

> `optional` **description**: `string`

Defined in: [src/services/permission-approval.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L15)

##### minHierarchyLevel

> **minHierarchyLevel**: `number` &#124; `null`

Defined in: [src/services/permission-approval.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L13)

##### requiredApprovers

> **requiredApprovers**: `number`

Defined in: [src/services/permission-approval.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L14)

##### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [src/services/permission-approval.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L12)

***

### PermissionWithApproval

Defined in: [src/services/permission-approval.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L18)

#### Properties

##### category

> **category**: `string`

Defined in: [src/services/permission-approval.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L22)

##### code

> **code**: `string`

Defined in: [src/services/permission-approval.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L20)

##### name

> **name**: `string`

Defined in: [src/services/permission-approval.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L21)

##### permissionId

> **permissionId**: `string`

Defined in: [src/services/permission-approval.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L19)

##### requiredApprovalLevel

> **requiredApprovalLevel**: `number` &#124; `null`

Defined in: [src/services/permission-approval.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L24)

##### requiredApprovers

> **requiredApprovers**: `number`

Defined in: [src/services/permission-approval.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L25)

##### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [src/services/permission-approval.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/permission-approval.service.ts#L23)
