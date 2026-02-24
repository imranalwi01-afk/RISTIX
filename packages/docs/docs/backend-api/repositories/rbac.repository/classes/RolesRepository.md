[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: RolesRepository

Defined in: [src/repositories/rbac.repository.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L70)

Repository for managing roles in the database.

## Constructors

### Constructor

> **new RolesRepository**(): `RolesRepository`

#### Returns

`RolesRepository`

## Methods

### create()

> **create**(`db`, `data`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:245](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L245)

Create a new role record.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### data

The role data to insert

###### bankingTypeSpecific?

`string` \| `null`

###### complianceLevel?

`string` \| `null`

###### createdAt?

`Date` \| `null`

###### createdBy?

`string` \| `null`

###### description?

`string` \| `null`

###### hierarchyLevel?

`number`

###### id?

`string`

###### isActive?

`boolean` \| `null`

###### isSystemRole?

`boolean` \| `null`

###### legacyId?

`number` \| `null`

###### permissions?

`unknown`

###### roleCode

`string`

###### roleName

`string`

###### tenantId?

`string` \| `null`

###### updatedAt?

`Date` \| `null`

###### updatedBy?

`string` \| `null`

#### Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the created Role

***

### delete()

> **delete**(`db`, `id`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/rbac.repository.ts:295](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L295)

Deactivates a role record (Soft delete).

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### id

`string`

The ID of the role to deactivate

#### Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect that succeeds with the updated Role

***

### existsByName()

> **existsByName**(`db`, `roleName`): `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:306](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L306)

Check if a role name already exists in the system.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### roleName

`string`

The role name to check

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with true if the name is taken

***

### findAll()

> **findAll**(`db`, `options?`): `Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L115)

Find all roles matching criteria with pagination.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### options?

[`RolesQueryOptions`](../interfaces/RolesQueryOptions.md)

Query options including pagination, filters, and includeInactive

#### Returns

`Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with a paginated result of Roles

***

### findById()

> **findById**(`db`, `id`): `Effect`\<[`RoleWithPermissions`](../type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/rbac.repository.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L78)

Find a role by its unique ID.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### id

`string`

The role ID to search for

#### Returns

`Effect`\<[`RoleWithPermissions`](../type-aliases/RoleWithPermissions.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect that succeeds with the Role and its permissions

***

### findByName()

> **findByName**(`db`, `roleName`, `tenantId?`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L98)

Find a role by its name within a tenant.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### roleName

`string`

The name of the role

##### tenantId?

`string`

Optional tenant ID for scoping

#### Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the Role if found, or undefined

***

### findByTenant()

> **findByTenant**(`db`, `tenantId`, `options?`): `Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<[`RoleWithPermissions`](../type-aliases/RoleWithPermissions.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L179)

Find all roles belonging to a specific tenant with pagination.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### tenantId

`string`

The unique identifier of the tenant

##### options?

[`RolesQueryOptions`](../interfaces/RolesQueryOptions.md) & `object`

Query options including pagination and filters

#### Returns

`Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<[`RoleWithPermissions`](../type-aliases/RoleWithPermissions.md)\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with a paginated result of Roles

***

### update()

> **update**(`db`, `id`, `data`): `Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/rbac.repository.ts:266](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L266)

Update an existing role record.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### id

`string`

The role ID to update

##### data

`Partial`\<[`NewRole`](../../../db/schema/rbac.schema/type-aliases/NewRole.md)\>

Partial role data containing updates

#### Returns

`Effect`\<\{ `bankingTypeSpecific`: `string` \| `null`; `complianceLevel`: `string` \| `null`; `createdAt`: `Date` \| `null`; `createdBy`: `string` \| `null`; `description`: `string` \| `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` \| `null`; `isSystemRole`: `boolean` \| `null`; `legacyId`: `number` \| `null`; `permissions`: `unknown`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `updatedBy`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect that succeeds with the updated Role
