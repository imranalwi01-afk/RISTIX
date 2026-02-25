[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: assignRole()

> **assignRole**(`input`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md), `never`\>

Defined in: [src/services/rbac.service.ts:213](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L213)

Assign a role to a user with optional temporal constraints.

## Parameters

### input

Assignment details including userId, roleId, and tenure info

#### assignedBy?

`string`

#### isTemporary?

`boolean`

#### roleId

`string`

#### temporaryReason?

`string`

#### tenantId

`string`

#### userId

`string`

#### validFrom?

`Date`

#### validUntil?

`Date`

## Returns

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md), `never`\>

An Effect that succeeds with the newly created assignment

## Throws

If the role is already assigned to the user
