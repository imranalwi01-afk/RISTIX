[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createApprovalRequest()

> **createApprovalRequest**(`input`): `Effect`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ConflictError`](../../../lib/errors/classes/ConflictError.md)\>

Defined in: [src/services/approval.service.ts:147](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L147)

Create a new approval request.

## Parameters

### input

[`CreateApprovalRequestInput`](../interfaces/CreateApprovalRequestInput.md)

The request input data

## Returns

`Effect`\<\{ `approvalsReceived`: `number`; `approvalsRequired`: `number`; `completedAt`: `Date` \| `null`; `completedBy`: `string` \| `null`; `createdAt`: `Date`; `currentLevel`: `number`; `description`: `string` \| `null`; `entityId`: `string` \| `null`; `entityType`: `string`; `expiresAt`: `Date` \| `null`; `id`: `string`; `impactLevel`: `string` \| `null`; `matrixId`: `string` \| `null`; `requestData`: `Record`\<`string`, `unknown`\> \| `null`; `requestedBy`: `string`; `status`: `string`; `tenantId`: `string`; `title`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ConflictError`](../../../lib/errors/classes/ConflictError.md)\>

An Effect resolving to the created approval request
