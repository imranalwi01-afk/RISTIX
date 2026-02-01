[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrices()

> **getApprovalMatrices**(`tenantId`): `Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/approval.service.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/approval.service.ts#L73)

Get all matrices for a tenant.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of approval matrices
