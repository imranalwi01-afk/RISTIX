[**Backend API Reference v1.0.0**](index.md)

***

# services/users-with-approval.example

## Interfaces

### CreateUserWithApprovalInput

Defined in: [src/services/users-with-approval.example.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L21)

Example: Users Service with Approval Workflow Integration

This file demonstrates how to integrate the approval workflow with CRUD operations.
The pattern shown here can be applied to other services (parameters, configurations, etc.)

#### Properties

##### email

> **email**: `string`

Defined in: [src/services/users-with-approval.example.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L22)

##### password

> **password**: `string`

Defined in: [src/services/users-with-approval.example.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L23)

##### permissions

> **permissions**: `string`[]

Defined in: [src/services/users-with-approval.example.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L28)

##### phone?

> `optional` **phone?**: `string`

Defined in: [src/services/users-with-approval.example.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L24)

##### requestedBy

> **requestedBy**: `string`

Defined in: [src/services/users-with-approval.example.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L27)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/users-with-approval.example.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L25)

***

### DeleteUserWithApprovalInput

Defined in: [src/services/users-with-approval.example.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L42)

#### Properties

##### id

> **id**: `string`

Defined in: [src/services/users-with-approval.example.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L43)

##### permissions

> **permissions**: `string`[]

Defined in: [src/services/users-with-approval.example.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L46)

##### requestedBy

> **requestedBy**: `string`

Defined in: [src/services/users-with-approval.example.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L45)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/users-with-approval.example.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L47)

***

### UpdateUserWithApprovalInput

Defined in: [src/services/users-with-approval.example.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L31)

#### Properties

##### email?

> `optional` **email?**: `string`

Defined in: [src/services/users-with-approval.example.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L33)

##### id

> **id**: `string`

Defined in: [src/services/users-with-approval.example.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L32)

##### isActive?

> `optional` **isActive?**: `boolean`

Defined in: [src/services/users-with-approval.example.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L35)

##### permissions

> **permissions**: `string`[]

Defined in: [src/services/users-with-approval.example.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L38)

##### phone?

> `optional` **phone?**: `string`

Defined in: [src/services/users-with-approval.example.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L34)

##### requestedBy

> **requestedBy**: `string`

Defined in: [src/services/users-with-approval.example.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L37)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/users-with-approval.example.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L39)

## Functions

### createUserWithApproval()

> **createUserWithApproval**(`input`): `Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;

Defined in: [src/services/users-with-approval.example.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L62)

Create user with approval workflow

This function will:
1. Check if approval is required based on approval matrix
2. If user has permission to self-approve, create user directly
3. Otherwise, create an approval request and return pending status

#### Parameters

##### input

[`CreateUserWithApprovalInput`](#createuserwithapprovalinput)

#### Returns

`Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;

***

### deleteUserWithApproval()

> **deleteUserWithApproval**(`input`): `Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;

Defined in: [src/services/users-with-approval.example.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L158)

Delete user with approval workflow

#### Parameters

##### input

[`DeleteUserWithApprovalInput`](#deleteuserwithapprovalinput)

#### Returns

`Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;

***

### updateUserWithApproval()

> **updateUserWithApproval**(`input`): `Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;

Defined in: [src/services/users-with-approval.example.ts:108](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users-with-approval.example.ts#L108)

Update user with approval workflow

#### Parameters

##### input

[`UpdateUserWithApprovalInput`](#updateuserwithapprovalinput)

#### Returns

`Effect`&lt;[`ApprovalResponse`](lib.approval-helpers.md#approvalresponse), `any`&gt;
