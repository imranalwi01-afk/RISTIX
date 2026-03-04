[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalMatrices()

> **getApprovalMatrices**(`tenantId`): `Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L115)

Get all matrices for a tenant.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<`any`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of approval matrices
