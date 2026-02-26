[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrix()

> **getApprovalMatrix**(`tenantId`, `entityType`, `bankingMode?`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:100](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L100)

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
