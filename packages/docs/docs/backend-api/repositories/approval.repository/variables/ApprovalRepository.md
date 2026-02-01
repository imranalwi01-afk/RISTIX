[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: ApprovalRepository

> `const` **ApprovalRepository**: `object`

Defined in: [packages/new-backend/src/repositories/approval.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/approval.repository.ts#L25)

## Type Declaration

### countPendingByTenant()

> **countPendingByTenant**: (`tenantId`) => `Promise`\<`number`\>

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`number`\>

### createAction()

> **createAction**: (`data`) => `Promise`\<\{ `action`: `string`; `approverId`: `string`; `approverRole`: `string` \| `null`; `comment`: `string` \| `null`; `conditions`: `string` \| `null`; `createdAt`: `Date`; `delegatedTo`: `string` \| `null`; `delegationReason`: `string` \| `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` \| `null`; \}\>

Create a new approval action.

#### Parameters

##### data

The action data

###### action

`string`

###### approverId

`string`

###### approverRole?

`string` \| `null`

###### comment?

`string` \| `null`

###### conditions?

`string` \| `null`

###### createdAt?

`Date`

###### delegatedTo?

`string` \| `null`

###### delegationReason?

`string` \| `null`

###### id?

`string`

###### level

`number`

###### requestId

`string`

###### riskAssessment?

`unknown`

###### riskScore?

`number` \| `null`

#### Returns

`Promise`\<\{ `action`: `string`; `approverId`: `string`; `approverRole`: `string` \| `null`; `comment`: `string` \| `null`; `conditions`: `string` \| `null`; `createdAt`: `Date`; `delegatedTo`: `string` \| `null`; `delegationReason`: `string` \| `null`; `id`: `string`; `level`: `number`; `requestId`: `string`; `riskAssessment`: `unknown`; `riskScore`: `number` \| `null`; \}\>

The created action

### createMatrix()

> **createMatrix**: (`data`, `levels`) => `Promise`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \}\>

Create a new approval matrix with levels.

#### Parameters

##### data

The matrix data

###### amountThresholds?

\{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

###### autoApprovalRules?

`unknown`

###### bankingMode?

`string` \| `null`

###### createdAt?

`Date`

###### description?

`string` \| `null`

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

`string` \| `null`

###### riskThresholds?

\{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`

###### syariahBoardRequired?

`boolean` \| `null`

###### tenantId?

`string` \| `null`

###### updatedAt?

`Date`

##### levels

`Omit`\<\{ `canDelegate?`: `boolean` \| `null`; `conditions?`: `Record`\<`string`, `unknown`\> \| `null`; `createdAt?`: `Date`; `description?`: `string` \| `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` \| `null`; `name`: `string`; `requiredCount?`: `number`; `requiredRoles`: `string`[]; `timeoutHours?`: `number` \| `null`; \}, `"matrixId"`\>[]

The levels data

#### Returns

`Promise`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \}\>

The created matrix

### createRequest()

> **createRequest**: (`data`) => `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}\>

Create a new approval request.

#### Parameters

##### data

The request data

###### approvalsReceived?

`number`

###### approvalsRequired?

`number`

###### completedAt?

`Date` \| `null`

###### completedBy?

`string` \| `null`

###### createdAt?

`Date`

###### currentLevel?

`number`

###### description?

`string` \| `null`

###### entityId?

`string` \| `null`

###### entityType

`string`

###### expiresAt?

`Date` \| `null`

###### id?

`string`

###### impactLevel?

`string` \| `null`

###### matrixId?

`string` \| `null`

###### requestData?

`Record`\<`string`, `unknown`\> \| `null`

###### requestedBy

`string`

###### status?

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}\>

The created request

### findActionsByRequest()

> **findActionsByRequest**: (`requestId`) => `Promise`\<`object`[]\>

Find actions for a specific request.

#### Parameters

##### requestId

`string`

The request ID

#### Returns

`Promise`\<`object`[]\>

An array of approval actions

### findMatricesByTenant()

> **findMatricesByTenant**: (`tenantId`) => `Promise`\<`object`[]\>

Find all approval matrices for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Promise`\<`object`[]\>

An array of approval matrices

### findMatrixByEntityType()

> **findMatrixByEntityType**: (`tenantId`, `entityType`, `bankingMode?`) => `PgRelationalQuery`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

Find an approval matrix by entity type.

#### Parameters

##### tenantId

`string`

The tenant ID

##### entityType

`string`

The entity type

##### bankingMode?

`string`

Optional banking mode filter

#### Returns

`PgRelationalQuery`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

The approval matrix with levels

### findMatrixById()

> **findMatrixById**: (`id`) => `PgRelationalQuery`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

Find an approval matrix by ID.

#### Parameters

##### id

`string`

The ID of the approval matrix

#### Returns

`PgRelationalQuery`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

The approval matrix with levels

### findPendingRequests()

> **findPendingRequests**: (`tenantId`) => `PgRelationalQuery`\<`object`[]\>

Find pending approval requests for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`PgRelationalQuery`\<`object`[]\>

An array of pending approval requests

### findRequestById()

> **findRequestById**: (`id`) => `Promise`\<\{ `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrix`: \{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `requester`: \{ `backupCodes`: `string`[] \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `undefined`\>

Find an approval request by ID.

#### Parameters

##### id

`string`

The request ID

#### Returns

`Promise`\<\{ `actions`: `object`[]; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrix`: \{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `levels`: `object`[]; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `requester`: \{ `backupCodes`: `string`[] \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}; `status`: `string`; `tenantId`: `string`; `title`: `string`; \} \| `undefined`\>

The approval request with details

### findRequestsByEntity()

> **findRequestsByEntity**: (`tenantId`, `entityType`, `entityId?`) => `PgRelationalQuery`\<`object`[]\>

Find approval requests by entity type.

#### Parameters

##### tenantId

`string`

The tenant ID

##### entityType

`string`

The entity type

##### entityId?

`string`

Optional entity ID filter

#### Returns

`PgRelationalQuery`\<`object`[]\>

An array of approval requests

### getExpiredRequests()

> **getExpiredRequests**: () => `PgRelationalQuery`\<`object`[]\>

#### Returns

`PgRelationalQuery`\<`object`[]\>

### updateMatrix()

> **updateMatrix**: (`id`, `data`) => `Promise`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \}\>

Update an approval matrix.

#### Parameters

##### id

`string`

The matrix ID

##### data

`Partial`\<[`NewApprovalMatrix`](../../../db/schema/approval.schema/type-aliases/NewApprovalMatrix.md)\>

The updated data

#### Returns

`Promise`\<\{ `amountThresholds`: \{ `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` \| `null`; `createdAt`: `Date`; `description`: `string` \| `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` \| `null`; `riskThresholds`: \{ `high?`: `number`; `low?`: `number`; `medium?`: `number`; \} \| `null`; `syariahBoardRequired`: `boolean` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date`; \}\>

The updated matrix

### updateRequest()

> **updateRequest**: (`id`, `data`) => `Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}\>

Update an existing approval request.

#### Parameters

##### id

`string`

The request ID

##### data

`Partial`\<\{ `approvalsReceived`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `currentLevel`: `number`; `status`: `string`; \}\>

The data to update

#### Returns

`Promise`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}\>

The updated request
