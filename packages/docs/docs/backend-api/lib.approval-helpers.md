[**Backend API Reference v1.0.0**](index.md)

***

# lib/approval-helpers

## Interfaces

### ApprovalCheckResult

Defined in: [src/lib/approval-helpers.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L13)

Approval Helper Utilities
Provides common functions for working with the approval workflow system

#### Properties

##### canSelfApprove

> **canSelfApprove**: `boolean`

Defined in: [src/lib/approval-helpers.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L15)

##### matrix?

> `optional` **matrix**: `object`

Defined in: [src/lib/approval-helpers.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L16)

###### amountThresholds

> **amountThresholds**: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`

###### autoApprovalRules

> **autoApprovalRules**: `unknown`

###### bankingMode

> **bankingMode**: `string` &#124; `null`

###### createdAt

> **createdAt**: `Date`

###### description

> **description**: `string` &#124; `null`

###### entityType

> **entityType**: `string`

###### escalationRules

> **escalationRules**: `unknown`

###### id

> **id**: `string`

###### isActive

> **isActive**: `boolean`

###### name

> **name**: `string`

###### operationType

> **operationType**: `string` &#124; `null`

###### riskThresholds

> **riskThresholds**: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`

###### syariahBoardRequired

> **syariahBoardRequired**: `boolean` &#124; `null`

###### tenantId

> **tenantId**: `string` &#124; `null`

###### updatedAt

> **updatedAt**: `Date`

##### reason?

> `optional` **reason**: `string`

Defined in: [src/lib/approval-helpers.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L17)

##### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [src/lib/approval-helpers.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L14)

***

### ApprovalResponse

Defined in: [src/lib/approval-helpers.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L20)

#### Properties

##### approvalRequired

> **approvalRequired**: `boolean`

Defined in: [src/lib/approval-helpers.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L22)

##### autoApproved?

> `optional` **autoApproved**: `boolean`

Defined in: [src/lib/approval-helpers.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L23)

##### data?

> `optional` **data**: `any`

Defined in: [src/lib/approval-helpers.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L25)

##### message?

> `optional` **message**: `string`

Defined in: [src/lib/approval-helpers.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L26)

##### requestId?

> `optional` **requestId**: `string`

Defined in: [src/lib/approval-helpers.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L24)

##### success

> **success**: `boolean`

Defined in: [src/lib/approval-helpers.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L21)

***

### ApprovalRoutingLevel

Defined in: [src/lib/approval-helpers.ts:354](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L354)

#### Properties

##### level

> **level**: `number`

Defined in: [src/lib/approval-helpers.ts:355](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L355)

##### name

> **name**: `string`

Defined in: [src/lib/approval-helpers.ts:356](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L356)

##### permissionMatchMode

> **permissionMatchMode**: `"ANY"` &#124; `"ALL"`

Defined in: [src/lib/approval-helpers.ts:360](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L360)

##### requiredCount

> **requiredCount**: `number`

Defined in: [src/lib/approval-helpers.ts:361](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L361)

##### requiredPermissionCodes

> **requiredPermissionCodes**: `string`[]

Defined in: [src/lib/approval-helpers.ts:358](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L358)

##### requiredRoleCodes

> **requiredRoleCodes**: `string`[]

Defined in: [src/lib/approval-helpers.ts:357](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L357)

##### roleMatchMode

> **roleMatchMode**: `"ANY"` &#124; `"ALL"`

Defined in: [src/lib/approval-helpers.ts:359](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L359)

##### timeoutHours?

> `optional` **timeoutHours**: `number`

Defined in: [src/lib/approval-helpers.ts:362](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L362)

## Functions

### buildApprovalDescription()

> **buildApprovalDescription**(`operation`, `entityType`, `data`): `string`

Defined in: [src/lib/approval-helpers.ts:174](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L174)

Build approval request description

#### Parameters

##### operation

`"update"` | `"delete"` | `"create"`

##### entityType

`string`

##### data

`Record`&lt;`string`, `any`&gt;

#### Returns

`string`

***

### buildApprovalPermission()

> **buildApprovalPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:196](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L196)

Build approval permission code from entity and operation
Example: 'user' + 'create' => 'approval.user.create'

#### Parameters

##### entityType

`string`

##### operation

`"update"` | `"delete"` | `"create"`

#### Returns

`string`

***

### buildApprovalTitle()

> **buildApprovalTitle**(`operation`, `entityType`, `identifier?`): `string`

Defined in: [src/lib/approval-helpers.ts:157](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L157)

Build approval request title

#### Parameters

##### operation

`"update"` | `"delete"` | `"create"`

##### entityType

`string`

##### identifier?

`string`

#### Returns

`string`

***

### buildDefaultFourEyesRouting()

> **buildDefaultFourEyesRouting**(`_entityType`): [`ApprovalRoutingLevel`](#approvalroutinglevel)[]

Defined in: [src/lib/approval-helpers.ts:380](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L380)

Default fallback routing for strict entities when matrix data is missing.
This keeps approval eligibility deterministic and visible.

#### Parameters

##### \_entityType

`string`

#### Returns

[`ApprovalRoutingLevel`](#approvalroutinglevel)[]

***

### buildOperationPermission()

> **buildOperationPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:208](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L208)

Build canonical banking CRUD permission code.
Example: 'product_parameter' + 'create' => 'banking.parameter.product.create'

#### Parameters

##### entityType

`string`

##### operation

`"update"` | `"delete"` | `"create"`

#### Returns

`string`

***

### calculateApprovalProgress()

> **calculateApprovalProgress**(`request`): `number`

Defined in: [src/lib/approval-helpers.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L64)

Calculate approval progress percentage

#### Parameters

##### request

###### approvalsReceived

`number`

###### approvalsRequired

`number`

###### completedAt

`Date` &#124; `null`

###### completedBy

`string` &#124; `null`

###### createdAt

`Date`

###### currentLevel

`number`

###### description

`string` &#124; `null`

###### entityId

`string` &#124; `null`

###### entityType

`string`

###### expiresAt

`Date` &#124; `null`

###### id

`string`

###### impactLevel

`string` &#124; `null`

###### matrixId

`string` &#124; `null`

###### requestData

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

`number`

***

### canProcessApproval()

> **canProcessApproval**(`request`): `object`

Defined in: [src/lib/approval-helpers.ts:281](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L281)

Check if approval can be processed

#### Parameters

##### request

###### approvalsReceived

`number`

###### approvalsRequired

`number`

###### completedAt

`Date` &#124; `null`

###### completedBy

`string` &#124; `null`

###### createdAt

`Date`

###### currentLevel

`number`

###### description

`string` &#124; `null`

###### entityId

`string` &#124; `null`

###### entityType

`string`

###### expiresAt

`Date` &#124; `null`

###### id

`string`

###### impactLevel

`string` &#124; `null`

###### matrixId

`string` &#124; `null`

###### requestData

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

`object`

##### canProcess

> **canProcess**: `boolean`

##### reason?

> `optional` **reason**: `string`

***

### extractPendingData()

> **extractPendingData**&lt;`T`&gt;(`request`): `T` &#124; `null`

Defined in: [src/lib/approval-helpers.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L145)

Extract original request data from approval request

#### Type Parameters

##### T

`T`

#### Parameters

##### request

###### approvalsReceived

`number`

###### approvalsRequired

`number`

###### completedAt

`Date` &#124; `null`

###### completedBy

`string` &#124; `null`

###### createdAt

`Date`

###### currentLevel

`number`

###### description

`string` &#124; `null`

###### entityId

`string` &#124; `null`

###### entityType

`string`

###### expiresAt

`Date` &#124; `null`

###### id

`string`

###### impactLevel

`string` &#124; `null`

###### matrixId

`string` &#124; `null`

###### requestData

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

`T` &#124; `null`

***

### formatApprovalRequiredResponse()

> **formatApprovalRequiredResponse**(`request`): [`ApprovalResponse`](#approvalresponse)

Defined in: [src/lib/approval-helpers.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L79)

Format response when approval is required

#### Parameters

##### request

###### approvalsReceived

`number`

###### approvalsRequired

`number`

###### completedAt

`Date` &#124; `null`

###### completedBy

`string` &#124; `null`

###### createdAt

`Date`

###### currentLevel

`number`

###### description

`string` &#124; `null`

###### entityId

`string` &#124; `null`

###### entityType

`string`

###### expiresAt

`Date` &#124; `null`

###### id

`string`

###### impactLevel

`string` &#124; `null`

###### matrixId

`string` &#124; `null`

###### requestData

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

[`ApprovalResponse`](#approvalresponse)

***

### formatDirectExecutionResponse()

> **formatDirectExecutionResponse**&lt;`T`&gt;(`data`, `message?`): [`ApprovalResponse`](#approvalresponse)

Defined in: [src/lib/approval-helpers.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L126)

Format response when operation is executed directly (no approval needed)

#### Type Parameters

##### T

`T`

#### Parameters

##### data

`T`

##### message?

`string`

#### Returns

[`ApprovalResponse`](#approvalresponse)

***

### getApprovalStatusColor()

> **getApprovalStatusColor**(`status`): `string`

Defined in: [src/lib/approval-helpers.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L50)

Get approval status color for UI

#### Parameters

##### status

`string`

#### Returns

`string`

***

### getApprovalStatusLabel()

> **getApprovalStatusLabel**(`status`): `string`

Defined in: [src/lib/approval-helpers.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L36)

Get human-readable approval status

#### Parameters

##### status

`string`

#### Returns

`string`

***

### getRequiredApprovalLevel()

> **getRequiredApprovalLevel**(`matrix`, `impactLevel?`): `number`

Defined in: [src/lib/approval-helpers.ts:406](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L406)

Get required approval level for operation

#### Parameters

##### matrix

&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; | `null` | `undefined`

##### impactLevel?

`string`

#### Returns

`number`

***

### hasApprovalPermission()

> **hasApprovalPermission**(`userPermissions`, `entityType`, `operation`): `boolean`

Defined in: [src/lib/approval-helpers.ts:233](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L233)

Check if user has approval permission

#### Parameters

##### userPermissions

`string`[]

##### entityType

`string`

##### operation

`"update"` | `"delete"` | `"create"`

#### Returns

`boolean`

***

### hasOperationPermission()

> **hasOperationPermission**(`userPermissions`, `entityType`, `operation`): `boolean`

Defined in: [src/lib/approval-helpers.ts:245](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L245)

Check if user has operation permission

#### Parameters

##### userPermissions

`string`[]

##### entityType

`string`

##### operation

`"update"` | `"delete"` | `"create"`

#### Returns

`boolean`

***

### isApprovalExpired()

> **isApprovalExpired**(`request`): `boolean`

Defined in: [src/lib/approval-helpers.ts:273](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L273)

Check if approval request has expired

#### Parameters

##### request

###### approvalsReceived

`number`

###### approvalsRequired

`number`

###### completedAt

`Date` &#124; `null`

###### completedBy

`string` &#124; `null`

###### createdAt

`Date`

###### currentLevel

`number`

###### description

`string` &#124; `null`

###### entityId

`string` &#124; `null`

###### entityType

`string`

###### expiresAt

`Date` &#124; `null`

###### id

`string`

###### impactLevel

`string` &#124; `null`

###### matrixId

`string` &#124; `null`

###### requestData

`Record`&lt;`string`, `unknown`&gt; &#124; `null`

###### requestedBy

`string`

###### status

`string`

###### tenantId

`string`

###### title

`string`

#### Returns

`boolean`

***

### requiresStrictFourEyes()

> **requiresStrictFourEyes**(`entityType`): `boolean`

Defined in: [src/lib/approval-helpers.ts:369](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L369)

Strict 4-eyes mode can be disabled explicitly for lower environments.
By default it is enabled to prevent self-approval bypass for privileged entities.

#### Parameters

##### entityType

`string`

#### Returns

`boolean`

***

### shouldAutoApprove()

> **shouldAutoApprove**(`matrix`, `userPermissions`, `entityType`, `operation`, `impactLevel?`): `boolean`

Defined in: [src/lib/approval-helpers.ts:309](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L309)

Determine if auto-approval should apply based on matrix rules

#### Parameters

##### matrix

&#123; `amountThresholds`: &#123; `critical?`: `number`; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `autoApprovalRules`: `unknown`; `bankingMode`: `string` &#124; `null`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `entityType`: `string`; `escalationRules`: `unknown`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `operationType`: `string` &#124; `null`; `riskThresholds`: &#123; `high?`: `number`; `low?`: `number`; `medium?`: `number`; &#125; &#124; `null`; `syariahBoardRequired`: `boolean` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; | `null` | `undefined`

##### userPermissions

`string`[]

##### entityType

`string`

##### operation

`"update"` | `"delete"` | `"create"`

##### impactLevel?

`string`

#### Returns

`boolean`

***

### validateApproverNotRequester()

> **validateApproverNotRequester**(`approverId`, `requesterId`): `boolean`

Defined in: [src/lib/approval-helpers.ts:263](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/lib/approval-helpers.ts#L263)

Validate that approver is not the requester

#### Parameters

##### approverId

`string`

##### requesterId

`string`

#### Returns

`boolean`
