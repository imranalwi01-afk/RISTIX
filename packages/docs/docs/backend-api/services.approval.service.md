[**Backend API Reference v1.0.0**](index.md)

***

# services/approval.service

## Interfaces

### ApprovalRoutingCandidate

Defined in: [src/services/approval.service.ts:112](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L112)

#### Properties

##### department

> **department**: `string` &#124; `null`

Defined in: [src/services/approval.service.ts:116](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L116)

##### email

> **email**: `string`

Defined in: [src/services/approval.service.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L115)

##### fullName

> **fullName**: `string`

Defined in: [src/services/approval.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L114)

##### position

> **position**: `string` &#124; `null`

Defined in: [src/services/approval.service.ts:117](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L117)

##### roleCodes

> **roleCodes**: `string`[]

Defined in: [src/services/approval.service.ts:118](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L118)

##### userId

> **userId**: `string`

Defined in: [src/services/approval.service.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L113)

***

### ApprovalRoutingLevelOverview

Defined in: [src/services/approval.service.ts:121](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L121)

#### Properties

##### candidateCount

> **candidateCount**: `number`

Defined in: [src/services/approval.service.ts:128](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L128)

##### candidates

> **candidates**: [`ApprovalRoutingCandidate`](#approvalroutingcandidate)[]

Defined in: [src/services/approval.service.ts:129](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L129)

##### level

> **level**: `number`

Defined in: [src/services/approval.service.ts:122](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L122)

##### name

> **name**: `string`

Defined in: [src/services/approval.service.ts:123](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L123)

##### requiredCount

> **requiredCount**: `number`

Defined in: [src/services/approval.service.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L126)

##### requiredPermissionCodes

> **requiredPermissionCodes**: `string`[]

Defined in: [src/services/approval.service.ts:125](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L125)

##### requiredRoleCodes

> **requiredRoleCodes**: `string`[]

Defined in: [src/services/approval.service.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L124)

##### timeoutHours?

> `optional` **timeoutHours?**: `number`

Defined in: [src/services/approval.service.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L127)

***

### ApprovalRoutingOverview

Defined in: [src/services/approval.service.ts:132](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L132)

#### Properties

##### entityType

> **entityType**: `string`

Defined in: [src/services/approval.service.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L133)

##### isActive

> **isActive**: `boolean`

Defined in: [src/services/approval.service.ts:137](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L137)

##### levels

> **levels**: [`ApprovalRoutingLevelOverview`](#approvalroutingleveloverview)[]

Defined in: [src/services/approval.service.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L138)

##### matrixId

> **matrixId**: `string` &#124; `null`

Defined in: [src/services/approval.service.ts:135](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L135)

##### matrixName

> **matrixName**: `string`

Defined in: [src/services/approval.service.ts:136](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L136)

##### operationType

> **operationType**: `string`

Defined in: [src/services/approval.service.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L134)

***

### CancelApprovalRequestInput

Defined in: [src/services/approval.service.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L105)

#### Properties

##### cancelledBy

> **cancelledBy**: `string`

Defined in: [src/services/approval.service.ts:107](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L107)

##### isSystemUser?

> `optional` **isSystemUser?**: `boolean`

Defined in: [src/services/approval.service.ts:108](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L108)

##### reason?

> `optional` **reason?**: `string`

Defined in: [src/services/approval.service.ts:109](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L109)

##### requestId

> **requestId**: `string`

Defined in: [src/services/approval.service.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L106)

***

### CreateApprovalRequestInput

Defined in: [src/services/approval.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L30)

#### Properties

##### bankingMode?

> `optional` **bankingMode?**: `string`

Defined in: [src/services/approval.service.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L39)

##### description?

> `optional` **description?**: `string`

Defined in: [src/services/approval.service.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L35)

##### entityId?

> `optional` **entityId?**: `string`

Defined in: [src/services/approval.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L33)

##### entityType

> **entityType**: `string`

Defined in: [src/services/approval.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L32)

##### impactLevel?

> `optional` **impactLevel?**: `"low"` &#124; `"medium"` &#124; `"high"` &#124; `"critical"`

Defined in: [src/services/approval.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L38)

##### requestData?

> `optional` **requestData?**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/services/approval.service.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L36)

##### requestedBy

> **requestedBy**: `string`

Defined in: [src/services/approval.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L37)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/approval.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L31)

##### title

> **title**: `string`

Defined in: [src/services/approval.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L34)

***

### ProcessApprovalInput

Defined in: [src/services/approval.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L42)

#### Properties

##### action

> **action**: `"approve"` &#124; `"reject"` &#124; `"request_info"` &#124; `"delegate"`

Defined in: [src/services/approval.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L46)

##### approverId

> **approverId**: `string`

Defined in: [src/services/approval.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L44)

##### approverRole?

> `optional` **approverRole?**: `string`

Defined in: [src/services/approval.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L45)

##### comment?

> `optional` **comment?**: `string`

Defined in: [src/services/approval.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L47)

##### conditions?

> `optional` **conditions?**: `string`

Defined in: [src/services/approval.service.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L48)

##### delegatedTo?

> `optional` **delegatedTo?**: `string`

Defined in: [src/services/approval.service.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L49)

##### requestId

> **requestId**: `string`

Defined in: [src/services/approval.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L43)

##### riskScore?

> `optional` **riskScore?**: `number`

Defined in: [src/services/approval.service.ts:50](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L50)

## Functions

### cancelApprovalRequest()

> **cancelApprovalRequest**(`input`): `Effect`&lt;&#123; `completed`: `boolean`; `status`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror)&gt;

Defined in: [src/services/approval.service.ts:699](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L699)

Cancel an existing approval request.
Requesters can cancel their own pending request; system users can cancel any.

#### Parameters

##### input

[`CancelApprovalRequestInput`](#cancelapprovalrequestinput)

#### Returns

`Effect`&lt;&#123; `completed`: `boolean`; `status`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror)&gt;

***

### createApprovalMatrix()

> **createApprovalMatrix**(`data`, `levels`): `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:186](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L186)

Create an approval matrix.

#### Parameters

##### data

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

##### levels

`Omit`&lt;&#123; `canDelegate?`: `boolean` &#124; `null`; `conditions?`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `createdAt?`: `Date`; `description?`: `string` &#124; `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` &#124; `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` &#124; `null`; &#125;, `"matrixId"`&gt;[]

The levels data

#### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to the created matrix

***

### createApprovalRequest()

> **createApprovalRequest**(`input`): `Effect`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ConflictError`](lib.errors.md#conflicterror)&gt;

Defined in: [src/services/approval.service.ts:242](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L242)

Create a new approval request.

#### Parameters

##### input

[`CreateApprovalRequestInput`](#createapprovalrequestinput)

The request input data

#### Returns

`Effect`&lt;&#123; `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` &#124; `null`; `completedBy`: `string` &#124; `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` &#124; `null`; `entityId`: `string` &#124; `null`; `entityType`: `string`; `expiresAt`: `Date` &#124; `null`; `id`: `string`; `impactLevel`: `string` &#124; `null`; `matrixId`: `string` &#124; `null`; `requestData`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ConflictError`](lib.errors.md#conflicterror)&gt;

An Effect resolving to the created approval request

***

### getApprovalHistory()

> **getApprovalHistory**(`tenantId`, `entityType?`, `entityId?`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:2019](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L2019)

Get approval history for an entity.

#### Parameters

##### tenantId

`string`

The tenant ID

##### entityType?

`string`

Optional entity type filter

##### entityId?

`string`

Optional entity ID filter

#### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to an array of approval requests

***

### getApprovalHistoryList()

> **getApprovalHistoryList**(`input`): `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:2033](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L2033)

#### Parameters

##### input

###### bankingType?

`string`

###### createdAtFrom?

`Date`

###### createdAtTo?

`Date`

###### currentLevel?

`number`

###### currentLevelMax?

`number`

###### currentLevelMin?

`number`

###### entityId?

`string`

###### entityType?

`string`

###### impactLevel?

`string`

###### limit

`number`

###### offset

`number`

###### operation?

`string`

###### requestedBy?

`string`

###### riskLevel?

`string`

###### search?

`string`

###### sort?

&#123; `direction`: `"asc"` &#124; `"desc"`; `field`: `string`; &#125;

###### sort.direction

`"asc"` &#124; `"desc"`

###### sort.field

`string`

###### status?

`string`

###### tenantId

`string`

#### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### getApprovalMatrices()

> **getApprovalMatrices**(`tenantId`): `Effect`&lt;`any`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:172](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L172)

Get all matrices for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`&lt;`any`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to an array of approval matrices

***

### getApprovalMatrix()

> **getApprovalMatrix**(`tenantId`, `entityType`, `bankingMode?`): `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:157](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L157)

Get approval matrix for entity type.

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

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to the approval matrix or database error

***

### getApprovalRequest()

> **getApprovalRequest**(`requestId`): `Effect`&lt;`object` & `object`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/approval.service.ts:1997](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L1997)

Get approval request by ID with full details.

#### Parameters

##### requestId

`string`

The request ID

#### Returns

`Effect`&lt;`object` & `object`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the request with actions or NotFoundError

***

### getApprovalRoutingOverview()

> **getApprovalRoutingOverview**(`input`): `Effect`&lt;[`ApprovalRoutingOverview`](#approvalroutingoverview)[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:2626](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L2626)

Get matrix/routing overview and potential approvers for each level.
Use this in UI so users know exactly who should review a request.

#### Parameters

##### input

###### bankingMode?

`string`

###### department?

`string`

###### entityType?

`string`

###### operation?

`"update"` &#124; `"delete"` &#124; `"create"`

###### tenantId

`string`

#### Returns

`Effect`&lt;[`ApprovalRoutingOverview`](#approvalroutingoverview)[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### getPendingApprovalsForUser()

> **getPendingApprovalsForUser**(`userId`, `tenantId`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/approval.service.ts:1947](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L1947)

Get pending approvals for a user by checking their roles against matrix requirements.

#### Parameters

##### userId

`string`

The user ID

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to an array of pending requests available for the user to approve

***

### processApprovalAction()

> **processApprovalAction**(`input`): `Effect`&lt;&#123; `completed`: `boolean`; `status`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthorizationError`](lib.errors.md#authorizationerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror)&gt;

Defined in: [src/services/approval.service.ts:378](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L378)

Process an approval action (approve, reject, request_info, delegate).

#### Parameters

##### input

[`ProcessApprovalInput`](#processapprovalinput)

The action input data

#### Returns

`Effect`&lt;&#123; `completed`: `boolean`; `status`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthorizationError`](lib.errors.md#authorizationerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror)&gt;

An Effect resolving to the completion status

#### Throws

NotFoundError if request not found

#### Throws

BusinessError if request is not pending or other business rule violations

***

### replayApprovedRequestSideEffect()

> **replayApprovedRequestSideEffect**(`request`, `approvedBy?`): `Promise`&lt;`void`&gt;

Defined in: [src/services/approval.service.ts:895](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L895)

Replay the side effect for an already-approved request.

Intended for operational reconciliation of older approval requests whose
status reached `approved` before the executor wrote the live row.

#### Parameters

##### request

`any`

##### approvedBy?

`string`

#### Returns

`Promise`&lt;`void`&gt;

***

### updateApprovalMatrix()

> **updateApprovalMatrix**(`tenantId`, `matrixId`, `data`, `levels?`): `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/approval.service.ts:197](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/approval.service.ts#L197)

Update an approval matrix and optionally replace its levels.

#### Parameters

##### tenantId

`string`

##### matrixId

`string`

##### data

`Partial`&lt;[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix)&gt;

##### levels?

`Omit`&lt;&#123; `canDelegate?`: `boolean` &#124; `null`; `conditions?`: `Record`&lt;`string`, `unknown`&gt; &#124; `null`; `createdAt?`: `Date`; `description?`: `string` &#124; `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` &#124; `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` &#124; `null`; &#125;, `"matrixId"`&gt;[]

#### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;
