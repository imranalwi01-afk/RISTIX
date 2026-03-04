[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: UserRolesRepository

Defined in: [src/repositories/rbac.repository.ts:462](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L462)

Repository for managing user-role associations.

## Constructors

### Constructor

> **new UserRolesRepository**(): `UserRolesRepository`

#### Returns

`UserRolesRepository`

## Methods

### assign()

> **assign**(`db`, `data`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:546](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L546)

Assign a role to a user.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### data

The assignment data

###### assignedAt?

`Date` \| `null`

###### assignedBy?

`string` \| `null`

###### bankingTypeRestriction?

`string` \| `null`

###### createdAt?

`Date` \| `null`

###### id?

`string`

###### isActive?

`boolean` \| `null`

###### isTemporary?

`boolean` \| `null`

###### roleId

`string`

###### temporaryReason?

`string` \| `null`

###### tenantId

`string`

###### updatedAt?

`Date` \| `null`

###### userId

`string`

###### validFrom?

`Date` \| `null`

###### validUntil?

`Date` \| `null`

#### Returns

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the created assignment

***

### exists()

> **exists**(`db`, `userId`, `roleId`): `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:586](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L586)

Check if user has role

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### userId

`string`

##### roleId

`string`

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### findByRole()

> **findByRole**(`db`, `roleId`, `options?`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:522](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L522)

Find all user assignments for a specific role.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### roleId

`string`

The role ID

##### options?

[`UserRolesQueryOptions`](../interfaces/UserRolesQueryOptions.md)

Filter options

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with an array of UserRole assignments

***

### findByUser()

> **findByUser**(`db`, `userId`, `tenantId?`, `options?`): `Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:472](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L472)

Find all roles assigned to a specific user.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID to scope the search

##### options?

[`UserRolesQueryOptions`](../interfaces/UserRolesQueryOptions.md)

Optional query params (activeOnly)

#### Returns

`Effect`\<`object` & `object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with a rich array of UserRoles with associated role and permission data

***

### remove()

> **remove**(`db`, `userId`, `roleId`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/rbac.repository.ts:563](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/rbac.repository.ts#L563)

Remove role assignment

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### userId

`string`

##### roleId

`string`

#### Returns

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
