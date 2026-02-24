[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: PermissionsRepository

Defined in: [src/repositories/rbac.repository.ts:328](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L328)

Repository for managing granular permissions.

## Constructors

### Constructor

> **new PermissionsRepository**(): `PermissionsRepository`

#### Returns

`PermissionsRepository`

## Methods

### create()

> **create**(`db`, `data`): `Effect`\<\{ `action`: `string`; `category`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:382](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L382)

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

Defined in: [src/repositories/rbac.repository.ts:365](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L365)

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

Defined in: [src/repositories/rbac.repository.ts:352](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L352)

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

Defined in: [src/repositories/rbac.repository.ts:336](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L336)

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
