[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: deleteRole()

> **deleteRole**(`roleId`, `tenantId?`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md), `never`\>

Defined in: [src/services/rbac.service.ts:157](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L157)

Deactivates a role (Soft delete).

## Parameters

### roleId

`string`

The unique identifier of the role to delete

### tenantId?

`string`

Optional tenant ID to resolve the database

## Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md), `never`\>

An Effect that succeeds with the deleted/deactivated Role

## Throws

If attempting to delete a protected system role
