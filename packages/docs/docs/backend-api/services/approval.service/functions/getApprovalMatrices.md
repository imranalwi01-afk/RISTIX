[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrices()

> **getApprovalMatrices**(`tenantId`): `Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/approval.service.ts#L113)

Get all matrices for a tenant.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of approval matrices
