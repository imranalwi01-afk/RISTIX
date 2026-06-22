[**Backend API Reference v1.0.0**](index.md)

***

# repositories/approval.repository

## Type Aliases

### ApprovalRepositoryType

> **ApprovalRepositoryType** = *typeof* [`ApprovalRepository`](#approvalrepository)

Defined in: [src/repositories/approval.repository.ts:394](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/approval.repository.ts#L394)

## Variables

### ApprovalRepository

> `const` **ApprovalRepository**: `object`

Defined in: [src/repositories/approval.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/approval.repository.ts#L24)

#### Type Declaration

##### countPendingByTenant()

> **countPendingByTenant**: (`tenantId`) => `Promise`&lt;`number`&gt;

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`number`&gt;

##### createAction()

> **createAction**: (`data`) => `Promise`&lt;&#123; `action`: `string`; `approverId`: `string`; `approverRole`: `string` &#124; `null`; `comment`: `string` &#124; `null`; `conditions`: `string` &#124; `null`; `createdAt`: `Date`; `delegatedTo`: `string` &#124; `null`; `delegationReason`: `string` &#124; `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` &#124; `null`; &#125;&gt;

Create a new approval action.

###### Parameters

###### data

The action data

###### action

`string`

###### approverId

`string`

###### approverRole?

`string` &#124; `null`

###### comment?

`string` &#124; `null`

###### conditions?

`string` &#124; `null`

###### createdAt?

`Date`

###### delegatedTo?

`string` &#124; `null`

###### delegationReason?

`string` &#124; `null`

###### id?

`string`

###### level

`number`

###### requestId

`string`

###### riskAssessment?

`unknown`

###### riskScore?

`number` &#124; `null`

###### Returns

`Promise`&lt;&#123; `action`: `string`; `approverId`: `string`; `approverRole`: `string` &#124; `null`; `comment`: `string` &#124; `null`; `conditions`: `string` &#124; `null`; `createdAt`: `Date`; `delegatedTo`: `string` &#124; `null`; `delegationReason`: `string` &#124; `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` &#124; `null`; &#125;&gt;

The created action

##### createMatrix()

> **createMatrix**: (`data`, `levels`) => `Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Create a new approval matrix with levels.

###### Parameters

###### data

The matrix data

###### amountThresholds?

&#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`

###### autoApprovalRules?

`unknown`

###### bankingMode?

`string` &#124; `null`

###### createdAt?

`Date`

###### description?

`string` &#124; `null`

###### entityType

`string`

###### escalationRules?

`unknown`

###### id?

`string`

###### isActive?

`boolean`

###### name

`string`

###### operationType?

`string` &#124; `null`

###### riskThresholds?

&#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`

###### syariahBoardRequired?

`boolean` &#124; `null`

###### tenantId?

`string` &#124; `null`

###### updatedAt?

`Date`

###### levels

`Omit`&lt;&#123; `canDelegate?`: `boolean` &#124; `null`; `conditions?`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `createdAt?`: `Date`; `description?`: `string` &#124; `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` &#124; `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` &#124; `null`; &#125;, `"matrixId"`&gt;[]

The levels data

###### Returns

`Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

The created matrix

##### createRequest()

> **createRequest**: (`data`) => `Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;&gt;

Create a new approval request.

###### Parameters

###### data

The request data

###### approvalsReceived?

`number`

###### approvalsRequired?

`number`

###### completedAt?

`Date` &#124; `null`

###### completedBy?

`string` &#124; `null`

###### createdAt?

`Date`

###### currentLevel?

`number`

###### description?

`string` &#124; `null`

###### entityId?

`string` &#124; `null`

###### entityType

`string`

###### expiresAt?

`Date` &#124; `null`

###### id?

`string`

###### impactLevel?

`string` &#124; `null`

###### matrixId?

`string` &#124; `null`

###### requestData?

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status?

`string`

###### tenantId

`string`

###### title

`string`

###### Returns

`Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;&gt;

The created request

##### findActionsByRequest()

> **findActionsByRequest**: (`requestId`) => `Promise`&lt;`object`[]&gt;

Find actions for a specific request.

###### Parameters

###### requestId

`string`

The request ID

###### Returns

`Promise`&lt;`object`[]&gt;

An array of approval actions

##### findDuplicatePendingRequest()

> **findDuplicatePendingRequest**: (`input`) => `Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `null`&gt;

Find an existing pending request that matches the same business operation.
This prevents accidental duplicate submissions from retries/double-clicks.

###### Parameters

###### input

###### entityId?

`string`

###### entityType

`string`

###### operation?

`string`

###### requestedBy

`string`

###### tenantId

`string`

###### title

`string`

###### Returns

`Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `null`&gt;

##### findMatricesByTenant()

> **findMatricesByTenant**: (`tenantId`) => `Promise`&lt;`object`[]&gt;

Find all approval matrices for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`Promise`&lt;`object`[]&gt;

An array of approval matrices

##### findMatrixByEntityType()

> **findMatrixByEntityType**: (`tenantId`, `entityType`, `bankingMode?`) => `PgRelationalQuery`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`&gt;

Find an approval matrix by entity type.

###### Parameters

###### tenantId

`string`

The tenant ID

###### entityType

`string`

The entity type

###### bankingMode?

`string`

Optional banking mode filter

###### Returns

`PgRelationalQuery`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`&gt;

The approval matrix with levels

##### findMatrixById()

> **findMatrixById**: (`id`) => `PgRelationalQuery`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`&gt;

Find an approval matrix by ID.

###### Parameters

###### id

`string`

The ID of the approval matrix

###### Returns

`PgRelationalQuery`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`&gt;

The approval matrix with levels

##### findPendingRequests()

> **findPendingRequests**: (`tenantId`) => `PgRelationalQuery`&lt;`object`[]&gt;

Find pending approval requests for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`PgRelationalQuery`&lt;`object`[]&gt;

An array of pending approval requests

##### findRequestById()

> **findRequestById**: (`id`) => `Promise`&lt;&#123; `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrix`: &#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `requester`: &#123; `createdAt`: `Date` &#124; `null`; `email`: `string`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `passwordHash`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `undefined`&gt;

Find an approval request by ID.

###### Parameters

###### id

`string`

The request ID

###### Returns

`Promise`&lt;&#123; `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrix`: &#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `requester`: &#123; `createdAt`: `Date` &#124; `null`; `email`: `string`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `passwordHash`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125; &#124; `undefined`&gt;

The approval request with details

##### findRequestsByEntity()

> **findRequestsByEntity**: (`tenantId`, `entityType`, `entityId?`) => `PgRelationalQuery`&lt;`object`[]&gt;

Find approval requests by entity type.

###### Parameters

###### tenantId

`string`

The tenant ID

###### entityType

`string`

The entity type

###### entityId?

`string`

Optional entity ID filter

###### Returns

`PgRelationalQuery`&lt;`object`[]&gt;

An array of approval requests

##### findRequestsByTenant()

> **findRequestsByTenant**: (`tenantId`) => `PgRelationalQuery`&lt;`object`[]&gt;

Find all approval requests for a tenant (history + pending).

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`PgRelationalQuery`&lt;`object`[]&gt;

An array of approval requests

##### getExpiredRequests()

> **getExpiredRequests**: () => `PgRelationalQuery`&lt;`object`[]&gt;

###### Returns

`PgRelationalQuery`&lt;`object`[]&gt;

##### updateMatrix()

> **updateMatrix**: (`id`, `data`) => `Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Update an approval matrix.

###### Parameters

###### id

`string`

The matrix ID

###### data

`Partial`&lt;[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix)&gt;

The updated data

###### Returns

`Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

The updated matrix

##### updateMatrixWithLevels()

> **updateMatrixWithLevels**: (`input`) => `Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `null` &#124; `undefined`&gt;

Update approval matrix and optionally replace all of its levels atomically.

###### Parameters

###### input

Matrix update payload

###### data

`Partial`&lt;[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix)&gt;

###### levels?

`Omit`&lt;&#123; `canDelegate?`: `boolean` &#124; `null`; `conditions?`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `createdAt?`: `Date`; `description?`: `string` &#124; `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` &#124; `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` &#124; `null`; &#125;, `"matrixId"`&gt;[]

###### matrixId

`string`

###### tenantId

`string`

###### Returns

`Promise`&lt;&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `null` &#124; `undefined`&gt;

Updated matrix with levels, or null when matrix is not found

##### updateRequest()

> **updateRequest**: (`id`, `data`) => `Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;&gt;

Update an existing approval request.

###### Parameters

###### id

`string`

The request ID

###### data

`Partial`&lt;&#123; `approvalsReceived`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `currentLevel`: `number`; `status`: `string`; &#125;&gt;

The data to update

###### Returns

`Promise`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;&gt;

The updated request
