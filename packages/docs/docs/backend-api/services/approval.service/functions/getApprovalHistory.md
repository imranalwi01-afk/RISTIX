[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalHistory()

> **getApprovalHistory**(`tenantId`, `entityType?`, `entityId?`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:925](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L925)

Get approval history for an entity.

## Parameters

### tenantId

`string`

The tenant ID

### entityType?

`string`

Optional entity type filter

### entityId?

`string`

Optional entity ID filter

## Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of approval requests
