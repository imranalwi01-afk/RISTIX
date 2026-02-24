[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createRole()

> **createRole**(`input`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md), `never`\>

Defined in: [src/services/rbac.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/rbac.service.ts#L94)

Create a new role for a tenant.

## Parameters

### input

The role definition as NewRole object

#### bankingTypeSpecific?

`string` \| `null`

#### complianceLevel?

`string` \| `null`

#### createdAt?

`Date` \| `null`

#### createdBy?

`string` \| `null`

#### description?

`string` \| `null`

#### hierarchyLevel?

`number`

#### id?

`string`

#### isActive?

`boolean` \| `null`

#### isSystemRole?

`boolean` \| `null`

#### legacyId?

`number` \| `null`

#### permissions?

`unknown`

#### roleCode

`string`

#### roleName

`string`

#### tenantId?

`string` \| `null`

#### updatedAt?

`Date` \| `null`

#### updatedBy?

`string` \| `null`

## Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md), `never`\>

An Effect that succeeds with the created Role

## Throws

If a role with the same name already exists
