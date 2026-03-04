[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: removeRole()

> **removeRole**(`userId`, `roleId`, `tenantId`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Defined in: [src/services/rbac.service.ts:273](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L273)

Remove a role assignment from a user.

## Parameters

### userId

`string`

The unique identifier of the user

### roleId

`string`

The unique identifier of the role to remove

### tenantId

`string`

The unique identifier of the tenant

## Returns

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect that succeeds when the assignment is removed
