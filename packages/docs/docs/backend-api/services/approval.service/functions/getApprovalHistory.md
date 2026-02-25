[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalHistory()

> **getApprovalHistory**(`tenantId`, `entityType?`, `entityId?`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:942](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L942)

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
