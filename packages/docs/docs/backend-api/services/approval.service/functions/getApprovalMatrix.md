[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrix()

> **getApprovalMatrix**(`tenantId`, `entityType`, `bankingMode?`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L98)

Get approval matrix for entity type.

## Parameters

### tenantId

`string`

The tenant ID

### entityType

`string`

The entity type

### bankingMode?

`string`

Optional banking mode filter

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the approval matrix or database error
