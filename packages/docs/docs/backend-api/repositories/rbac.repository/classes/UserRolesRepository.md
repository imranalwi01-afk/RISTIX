[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: UserRolesRepository

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:459](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L459)

Repository for managing user-role associations.

## Constructors

### Constructor

> **new UserRolesRepository**(): `UserRolesRepository`

#### Returns

`UserRolesRepository`

## Methods

### assign()

> **assign**(`db`, `data`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `level`: `number` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:543](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L543)

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

###### level?

`number` \| `null`

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

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `level`: `number` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the created assignment

***

### exists()

> **exists**(`db`, `userId`, `roleId`): `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:583](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L583)

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

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:519](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L519)

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

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:469](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L469)

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

> **remove**(`db`, `userId`, `roleId`): `Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `level`: `number` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:560](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L560)

Remove role assignment

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### userId

`string`

##### roleId

`string`

#### Returns

`Effect`\<\{ `assignedAt`: `Date` \| `null`; `assignedBy`: `string` \| `null`; `bankingTypeRestriction`: `string` \| `null`; `createdAt`: `Date` \| `null`; `id`: `string`; `isActive`: `boolean` \| `null`; `isTemporary`: `boolean` \| `null`; `level`: `number` \| `null`; `roleId`: `string`; `temporaryReason`: `string` \| `null`; `tenantId`: `string`; `updatedAt`: `Date` \| `null`; `userId`: `string`; `validFrom`: `Date` \| `null`; `validUntil`: `Date` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
