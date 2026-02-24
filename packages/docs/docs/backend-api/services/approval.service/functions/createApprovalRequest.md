[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createApprovalRequest()

> **createApprovalRequest**(`input`): `Effect`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ConflictError`](../../../lib/errors/classes/ConflictError.md)\>

Defined in: [src/services/approval.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L145)

Create a new approval request.

## Parameters

### input

[`CreateApprovalRequestInput`](../interfaces/CreateApprovalRequestInput.md)

The request input data

## Returns

`Effect`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ConflictError`](../../../lib/errors/classes/ConflictError.md)\>

An Effect resolving to the created approval request
