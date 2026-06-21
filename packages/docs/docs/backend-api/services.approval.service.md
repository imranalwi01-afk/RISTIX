[**Backend API Reference v1.0.0**](index.md)

***

# services/approval.service

## Interfaces

### ApprovalRoutingCandidate

Defined in: [src/services/approval.service.ts:74](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L74)

#### Properties

##### department

> **department**: `string` {`|`} `null`

Defined in: [src/services/approval.service.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L78)

##### email

> **email**: `string`

Defined in: [src/services/approval.service.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L77)

##### fullName

> **fullName**: `string`

Defined in: [src/services/approval.service.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L76)

##### position

> **position**: `string` {`|`} `null`

Defined in: [src/services/approval.service.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L79)

##### roleCodes

> **roleCodes**: `string`[]

Defined in: [src/services/approval.service.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L80)

##### userId

> **userId**: `string`

Defined in: [src/services/approval.service.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L75)

***

### ApprovalRoutingLevelOverview

Defined in: [src/services/approval.service.ts:83](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L83)

#### Properties

##### candidateCount

> **candidateCount**: `number`

Defined in: [src/services/approval.service.ts:90](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L90)

##### candidates

> **candidates**: [`ApprovalRoutingCandidate`](#approvalroutingcandidate)[]

Defined in: [src/services/approval.service.ts:91](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L91)

##### level

> **level**: `number`

Defined in: [src/services/approval.service.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L84)

##### name

> **name**: `string`

Defined in: [src/services/approval.service.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L85)

##### requiredCount

> **requiredCount**: `number`

Defined in: [src/services/approval.service.ts:88](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L88)

##### requiredPermissionCodes

> **requiredPermissionCodes**: `string`[]

Defined in: [src/services/approval.service.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L87)

##### requiredRoleCodes

> **requiredRoleCodes**: `string`[]

Defined in: [src/services/approval.service.ts:86](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L86)

##### timeoutHours?

> `optional` **timeoutHours**: `number`

Defined in: [src/services/approval.service.ts:89](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L89)

***

### ApprovalRoutingOverview

Defined in: [src/services/approval.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L94)

#### Properties

##### entityType

> **entityType**: `string`

Defined in: [src/services/approval.service.ts:95](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L95)

##### isActive

> **isActive**: `boolean`

Defined in: [src/services/approval.service.ts:99](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L99)

##### levels

> **levels**: [`ApprovalRoutingLevelOverview`](#approvalroutingleveloverview)[]

Defined in: [src/services/approval.service.ts:100](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L100)

##### matrixId

> **matrixId**: `string` {`|`} `null`

Defined in: [src/services/approval.service.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L97)

##### matrixName

> **matrixName**: `string`

Defined in: [src/services/approval.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L98)

##### operationType

> **operationType**: `string`

Defined in: [src/services/approval.service.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L96)

***

### CancelApprovalRequestInput

Defined in: [src/services/approval.service.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L67)

#### Properties

##### cancelledBy

> **cancelledBy**: `string`

Defined in: [src/services/approval.service.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L69)

##### isSystemUser?

> `optional` **isSystemUser**: `boolean`

Defined in: [src/services/approval.service.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L70)

##### reason?

> `optional` **reason**: `string`

Defined in: [src/services/approval.service.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L71)

##### requestId

> **requestId**: `string`

Defined in: [src/services/approval.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L68)

***

### CreateApprovalRequestInput

Defined in: [src/services/approval.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L26)

#### Properties

##### bankingMode?

> `optional` **bankingMode**: `string`

Defined in: [src/services/approval.service.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L35)

##### description?

> `optional` **description**: `string`

Defined in: [src/services/approval.service.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L31)

##### entityId?

> `optional` **entityId**: `string`

Defined in: [src/services/approval.service.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L29)

##### entityType

> **entityType**: `string`

Defined in: [src/services/approval.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L28)

##### impactLevel?

> `optional` **impactLevel**: `"low"` {`|`} `"medium"` {`|`} `"high"` {`|`} `"critical"`

Defined in: [src/services/approval.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L34)

##### requestData?

> `optional` **requestData**: `Record`{`<`}`string`, `unknown`{`>`}

Defined in: [src/services/approval.service.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L32)

##### requestedBy

> **requestedBy**: `string`

Defined in: [src/services/approval.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L33)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/approval.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L27)

##### title

> **title**: `string`

Defined in: [src/services/approval.service.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L30)

***

### ProcessApprovalInput

Defined in: [src/services/approval.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L38)

#### Properties

##### action

> **action**: `"approve"` {`|`} `"reject"` {`|`} `"request_info"` {`|`} `"delegate"`

Defined in: [src/services/approval.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L42)

##### approverId

> **approverId**: `string`

Defined in: [src/services/approval.service.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L40)

##### approverRole?

> `optional` **approverRole**: `string`

Defined in: [src/services/approval.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L41)

##### comment?

> `optional` **comment**: `string`

Defined in: [src/services/approval.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L43)

##### conditions?

> `optional` **conditions**: `string`

Defined in: [src/services/approval.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L44)

##### delegatedTo?

> `optional` **delegatedTo**: `string`

Defined in: [src/services/approval.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L45)

##### requestId

> **requestId**: `string`

Defined in: [src/services/approval.service.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L39)

##### riskScore?

> `optional` **riskScore**: `number`

Defined in: [src/services/approval.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L46)

## Functions

### cancelApprovalRequest()

> **cancelApprovalRequest**(`input`): `Effect`{`<`}{`{`} `completed`: `boolean`; `status`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror) {`|`} [`BusinessError`](lib.errors.md#businesserror){`>`}

Defined in: [src/services/approval.service.ts:610](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L610)

Cancel an existing approval request.
Requesters can cancel their own pending request; system users can cancel any.

#### Parameters

##### input

[`CancelApprovalRequestInput`](#cancelapprovalrequestinput)

#### Returns

`Effect`{`<`}{`{`} `completed`: `boolean`; `status`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror) {`|`} [`BusinessError`](lib.errors.md#businesserror){`>`}

***

### createApprovalMatrix()

> **createApprovalMatrix**(`data`, `levels`): `Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:148](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L148)

Create an approval matrix.

#### Parameters

##### data

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

##### levels

`Omit`{`<`}{`{`} `canDelegate?`: `boolean` {`|`} `null`; `conditions?`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `createdAt?`: `Date`; `description?`: `string` {`|`} `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` {`|`} `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` {`|`} `null`; {`}`}, `"matrixId"`{`>`}[]

The levels data

#### Returns

`Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror){`>`}

An Effect resolving to the created matrix

***

### createApprovalRequest()

> **createApprovalRequest**(`input`): `Effect`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`ConflictError`](lib.errors.md#conflicterror){`>`}

Defined in: [src/services/approval.service.ts:204](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L204)

Create a new approval request.

#### Parameters

##### input

[`CreateApprovalRequestInput`](#createapprovalrequestinput)

The request input data

#### Returns

`Effect`{`<`}{`{`} `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` {`|`} `null`; `completedBy`: `string` {`|`} `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` {`|`} `null`; `entityId`: `string` {`|`} `null`; `entityType`: `string`; `expiresAt`: `Date` {`|`} `null`; `id`: `string`; `impactLevel`: `string` {`|`} `null`; `matrixId`: `string` {`|`} `null`; `requestData`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`ConflictError`](lib.errors.md#conflicterror){`>`}

An Effect resolving to the created approval request

***

### getApprovalHistory()

> **getApprovalHistory**(`tenantId`, `entityType?`, `entityId?`): `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:1736](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L1736)

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

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

An Effect resolving to an array of approval requests

***

### getApprovalMatrices()

> **getApprovalMatrices**(`tenantId`): `Effect`{`<`}`any`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L134)

Get all matrices for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`{`<`}`any`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

An Effect resolving to an array of approval matrices

***

### getApprovalMatrix()

> **getApprovalMatrix**(`tenantId`, `entityType`, `bankingMode?`): `Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:119](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L119)

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

`Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror){`>`}

An Effect resolving to the approval matrix or database error

***

### getApprovalRequest()

> **getApprovalRequest**(`requestId`): `Effect`{`<`}`object` & `object`, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/approval.service.ts:1714](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L1714)

Get approval request by ID with full details.

#### Parameters

##### requestId

`string`

The request ID

#### Returns

`Effect`{`<`}`object` & `object`, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the request with actions or NotFoundError

***

### getApprovalRoutingOverview()

> **getApprovalRoutingOverview**(`input`): `Effect`{`<`}[`ApprovalRoutingOverview`](#approvalroutingoverview)[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:2302](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L2302)

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

`"update"` {`|`} `"delete"` {`|`} `"create"`

###### tenantId

`string`

#### Returns

`Effect`{`<`}[`ApprovalRoutingOverview`](#approvalroutingoverview)[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

***

### getPendingApprovalsForUser()

> **getPendingApprovalsForUser**(`userId`, `tenantId`): `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

Defined in: [src/services/approval.service.ts:1664](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L1664)

Get pending approvals for a user by checking their roles against matrix requirements.

#### Parameters

##### userId

`string`

The user ID

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror){`>`}

An Effect resolving to an array of pending requests available for the user to approve

***

### processApprovalAction()

> **processApprovalAction**(`input`): `Effect`{`<`}{`{`} `completed`: `boolean`; `status`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`AuthorizationError`](lib.errors.md#authorizationerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror) {`|`} [`BusinessError`](lib.errors.md#businesserror){`>`}

Defined in: [src/services/approval.service.ts:307](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L307)

Process an approval action (approve, reject, request_info, delegate).

#### Parameters

##### input

[`ProcessApprovalInput`](#processapprovalinput)

The action input data

#### Returns

`Effect`{`<`}{`{`} `completed`: `boolean`; `status`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`AuthorizationError`](lib.errors.md#authorizationerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror) {`|`} [`BusinessError`](lib.errors.md#businesserror){`>`}

An Effect resolving to the completion status

#### Throws

NotFoundError if request not found

#### Throws

BusinessError if request is not pending or other business rule violations

***

### updateApprovalMatrix()

> **updateApprovalMatrix**(`tenantId`, `matrixId`, `data`, `levels?`): `Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/approval.service.ts:159](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/approval.service.ts#L159)

Update an approval matrix and optionally replace its levels.

#### Parameters

##### tenantId

`string`

##### matrixId

`string`

##### data

`Partial`{`<`}[`NewApprovalMatrix`](db.schema.approval.schema.md#newapprovalmatrix){`>`}

##### levels?

`Omit`{`<`}{`{`} `canDelegate?`: `boolean` {`|`} `null`; `conditions?`: `Record`{`<`}`string`, `unknown`{`>`} {`|`} `null`; `createdAt?`: `Date`; `description?`: `string` {`|`} `null`; `id?`: `string`; `level`: `number`; `matrixId`: `string`; `maxAmount?`: `number` {`|`} `null`; `name`: `string`; `permissionMatchMode?`: `string`; `requiredCount?`: `number`; `requiredPermissionCodes?`: `string`[]; `requiredRoleCodes?`: `string`[]; `roleMatchMode?`: `string`; `timeoutHours?`: `number` {`|`} `null`; {`}`}, `"matrixId"`{`>`}[]

#### Returns

`Effect`{`<`}`any`, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}
