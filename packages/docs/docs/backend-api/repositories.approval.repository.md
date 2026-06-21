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

> **countPendingByTenant**: (`tenantId`) => `Promise`{`<`}`number`{`>`}

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`{`<`}`number`{`>`}

##### createAction()

> **createAction**: (`data`) => `Promise`{`<`}{`{`} `action`: `string`; `approverId`: `string`; `approverRole`: `string` {`|`} `null`; `comment`: `string` {`|`} `null`; `conditions`: `string` {`|`} `null`; `createdAt`: `Date`; `delegatedTo`: `string` {`|`} `null`; `delegationReason`: `string` {`|`} `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` {`|`} `null`; {`}`}{`>`}

Create a new approval action.

###### Parameters

###### data

The action data

###### action

`string`

###### approverId

`string`

###### approverRole?

`string` {`|`} `null`

###### comment?

`string` {`|`} `null`

###### conditions?

`string` {`|`} `null`

###### createdAt?

`Date`

###### delegatedTo?

`string` {`|`} `null`

###### delegationReason?

`string` {`|`} `null`

###### id?

`string`

###### level

`number`

###### requestId

`string`

###### riskAssessment?

`unknown`

###### riskScore?

`number` {`|`} `null`

###### Returns

`Promise`{`<`}{`{`} `action`: `string`; `approverId`: `string`; `approverRole`: `string` {`|`} `null`; `comment`: `string` {`|`} `null`; `conditions`: `string` {`|`} `null`; `createdAt`: `Date`; `delegatedTo`: `string` {`|`} `null`; `delegationReason`: `string` {`|`} `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` {`|`} `null`; {`}`}{`>`}

The created action

##### createMatrix()

> **createMatrix**: (`data`, `levels`) => `Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`}{`>`}

Create a new approval matrix with levels.

###### Parameters

###### data

The matrix data

###### amountThresholds?

{`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`

###### autoApprovalRules?

`unknown`

###### bankingMode?

`string` {`|`} `null`

###### createdAt?

`Date`

###### description?

`string` {`|`} `null`

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

`string` {`|`} `null`

###### riskThresholds?

{`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`

###### syariahBoardRequired?

`boolean` {`|`} `null`

###### tenantId?

`string` {`|`} `null`

###### updatedAt?

`Date`

###### levels

`Omit`{`<`}{`{`} `canDelegate?`: `boolean` {`|`} `null`; `conditions?`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `createdAt?`: `Date`; `description?`: `string` {`|`} `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` {`|`} `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` {`|`} `null`; {`}`}, `"matrixId"`{`>`}[]

The levels data

###### Returns

`Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`}{`>`}

The created matrix

##### createRequest()

> **createRequest**: (`data`) => `Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}{`>`}

Create a new approval request.

###### Parameters

###### data

The request data

###### approvalsReceived?

`number`

###### approvalsRequired?

`number`

###### completedAt?

`Date` {`|`} `null`

###### completedBy?

`string` {`|`} `null`

###### createdAt?

`Date`

###### currentLevel?

`number`

###### description?

`string` {`|`} `null`

###### entityId?

`string` {`|`} `null`

###### entityType

`string`

###### expiresAt?

`Date` {`|`} `null`

###### id?

`string`

###### impactLevel?

`string` {`|`} `null`

###### matrixId?

`string` {`|`} `null`

###### requestData?

`Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`

###### requestedBy

`string`

###### status?

`string`

###### tenantId

`string`

###### title

`string`

###### Returns

`Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}{`>`}

The created request

##### findActionsByRequest()

> **findActionsByRequest**: (`requestId`) => `Promise`{`<`}`object`[]{`>`}

Find actions for a specific request.

###### Parameters

###### requestId

`string`

The request ID

###### Returns

`Promise`{`<`}`object`[]{`>`}

An array of approval actions

##### findDuplicatePendingRequest()

> **findDuplicatePendingRequest**: (`input`) => `Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`} {`|`} `null`{`>`}

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

`Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`} {`|`} `null`{`>`}

##### findMatricesByTenant()

> **findMatricesByTenant**: (`tenantId`) => `Promise`{`<`}`object`[]{`>`}

Find all approval matrices for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`Promise`{`<`}`object`[]{`>`}

An array of approval matrices

##### findMatrixByEntityType()

> **findMatrixByEntityType**: (`tenantId`, `entityType`, `bankingMode?`) => `PgRelationalQuery`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `undefined`{`>`}

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

`PgRelationalQuery`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `undefined`{`>`}

The approval matrix with levels

##### findMatrixById()

> **findMatrixById**: (`id`) => `PgRelationalQuery`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `undefined`{`>`}

Find an approval matrix by ID.

###### Parameters

###### id

`string`

The ID of the approval matrix

###### Returns

`PgRelationalQuery`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `undefined`{`>`}

The approval matrix with levels

##### findPendingRequests()

> **findPendingRequests**: (`tenantId`) => `PgRelationalQuery`{`<`}`object`[]{`>`}

Find pending approval requests for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`PgRelationalQuery`{`<`}`object`[]{`>`}

An array of pending approval requests

##### findRequestById()

> **findRequestById**: (`id`) => `Promise`{`<`}{`{`} `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrix`: {`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `requester`: {`{`} `createdAt`: `Date` {`|`} `null`; `email`: `string`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`} {`|`} `undefined`{`>`}

Find an approval request by ID.

###### Parameters

###### id

`string`

The request ID

###### Returns

`Promise`{`<`}{`{`} `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrix`: {`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `requester`: {`{`} `createdAt`: `Date` {`|`} `null`; `email`: `string`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`} {`|`} `undefined`{`>`}

The approval request with details

##### findRequestsByEntity()

> **findRequestsByEntity**: (`tenantId`, `entityType`, `entityId?`) => `PgRelationalQuery`{`<`}`object`[]{`>`}

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

`PgRelationalQuery`{`<`}`object`[]{`>`}

An array of approval requests

##### findRequestsByTenant()

> **findRequestsByTenant**: (`tenantId`) => `PgRelationalQuery`{`<`}`object`[]{`>`}

Find all approval requests for a tenant (history + pending).

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`PgRelationalQuery`{`<`}`object`[]{`>`}

An array of approval requests

##### getExpiredRequests()

> **getExpiredRequests**: () => `PgRelationalQuery`{`<`}`object`[]{`>`}

###### Returns

`PgRelationalQuery`{`<`}`object`[]{`>`}

##### updateMatrix()

> **updateMatrix**: (`id`, `data`) => `Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`}{`>`}

Update an approval matrix.

###### Parameters

###### id

`string`

The matrix ID

###### data

`Partial`{`<`}[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix){`>`}

The updated data

###### Returns

`Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`}{`>`}

The updated matrix

##### updateMatrixWithLevels()

> **updateMatrixWithLevels**: (`input`) => `Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `null` {`|`} `undefined`{`>`}

Update approval matrix and optionally replace all of its levels atomically.

###### Parameters

###### input

Matrix update payload

###### data

`Partial`{`<`}[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix){`>`}

###### levels?

`Omit`{`<`}{`{`} `canDelegate?`: `boolean` {`|`} `null`; `conditions?`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `createdAt?`: `Date`; `description?`: `string` {`|`} `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` {`|`} `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` {`|`} `null`; {`}`}, `"matrixId"`{`>`}[]

###### matrixId

`string`

###### tenantId

`string`

###### Returns

`Promise`{`<`}{`{`} `amountThresholds`: {`{`} `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` {`|`} `null`; `createdAt`: `Date`; `description`: `string` {`|`} `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` {`|`} `null`; `riskThresholds`: {`{`} `high?`: `number`; `low?`: `number`; `medium?`: `number`; {`}`} {`|`} `null`; `syariahBoardRequired`: `boolean` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date`; {`}`} {`|`} `null` {`|`} `undefined`{`>`}

Updated matrix with levels, or null when matrix is not found

##### updateRequest()

> **updateRequest**: (`id`, `data`) => `Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}{`>`}

Update an existing approval request.

###### Parameters

###### id

`string`

The request ID

###### data

`Partial`{`<`}{`{`} `approvalsReceived`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `currentLevel`: `number`; `status`: `string`; {`}`}{`>`}

The data to update

###### Returns

`Promise`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}{`>`}

The updated request
