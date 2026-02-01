[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrix()

> **getApprovalMatrix**(`tenantId`, `entityType`, `bankingMode?`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L58)

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
