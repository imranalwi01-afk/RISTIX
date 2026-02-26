[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getUserPermissionCodes()

> **getUserPermissionCodes**(`userId`, `tenantId`): `Effect`\<`string`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/rbac.service.ts:348](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L348)

Returns canonical permission codes (e.g. banking.setup.business.view) for the user.
This is used by frontend auth snapshot refresh to avoid lossy resource/action mapping.

## Parameters

### userId

`string`

### tenantId

`string`

## Returns

`Effect`\<`string`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
