[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: updateRole()

> **updateRole**(`roleId`, `input`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md), `never`\>

Defined in: [src/services/rbac.service.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/rbac.service.ts#L126)

Update an existing role's properties.

## Parameters

### roleId

`string`

The unique identifier of the role to update

### input

`Partial`\<\{ `bankingTypeSpecific?`: `string` \| `null`; `complianceLevel?`: `string` \| `null`; `createdAt?`: `Date` \| `null`; `createdBy?`: `string` \| `null`; `description?`: `string` \| `null`; `hierarchyLevel?`: `number`; `id?`: `string`; `isActive?`: `boolean` \| `null`; `isSystemRole?`: `boolean` \| `null`; `legacyId?`: `number` \| `null`; `permissions?`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId?`: `string` \| `null`; `updatedAt?`: `Date` \| `null`; `updatedBy?`: `string` \| `null`; \}\> & `object`

Partial role object containing updates and optional tenantId

## Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md) \| [`BusinessError`](../../../lib/errors/classes/BusinessError.md), `never`\>

An Effect that succeeds with the updated Role

## Throws

If attempting to rename a protected system role
