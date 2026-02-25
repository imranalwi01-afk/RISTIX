[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingApprovalsForUser()

> **getPendingApprovalsForUser**(`userId`, `tenantId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:874](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L874)

Get pending approvals for a user by checking their roles against matrix requirements.

## Parameters

### userId

`string`

The user ID

### tenantId

`string`

The tenant ID

## Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to an array of pending requests available for the user to approve
