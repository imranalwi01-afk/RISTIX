[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalHistory()

> **getApprovalHistory**(`tenantId`, `entityType?`, `entityId?`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:349](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L349)

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
