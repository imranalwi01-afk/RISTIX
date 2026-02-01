[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: PermissionsRepository

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:325](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L325)

Repository for managing granular permissions.

## Constructors

### Constructor

> **new PermissionsRepository**(): `PermissionsRepository`

#### Returns

`PermissionsRepository`

## Methods

### create()

> **create**(`db`, `data`): `Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:379](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L379)

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### data

###### action

`string`

###### category?

`string` \| `null`

###### code

`string`

###### createdAt?

`Date`

###### description?

`string` \| `null`

###### id?

`string`

###### isActive?

`boolean`

###### module?

`string`

###### name

`string`

###### resource

`string`

#### Returns

`Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### findAll()

> **findAll**(`db`, `options?`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:362](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L362)

Find all permissions matching criteria.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### options?

[`PermissionsQueryOptions`](../interfaces/PermissionsQueryOptions.md)

Query options for filtering permissions

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with an array of Permissions

***

### findByCode()

> **findByCode**(`db`, `code`): `Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:349](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L349)

Find a permission by its unique code.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### code

`string`

The permission code (e.g., 'user:read')

#### Returns

`Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the Permission if found

***

### findById()

> **findById**(`db`, `id`): `Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:333](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L333)

Find a permission by its unique ID.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### id

`string`

The permission ID

#### Returns

`Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect that succeeds with the Permission record
