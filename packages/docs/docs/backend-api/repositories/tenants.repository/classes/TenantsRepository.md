[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: TenantsRepository

Defined in: [src/repositories/tenants.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L29)

Core interface for standard CRUD repository operations.

## Implements

- [`IRepository`](../../base.repository/interfaces/IRepository.md)\<[`Tenant`](../../../db/schema/core/type-aliases/Tenant.md), [`NewTenant`](../../../db/schema/core/type-aliases/NewTenant.md)\>

## Constructors

### Constructor

> **new TenantsRepository**(): `TenantsRepository`

#### Returns

`TenantsRepository`

## Methods

### create()

> **create**(`data`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/tenants.repository.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L133)

Create a new tenant.

#### Parameters

##### data

The tenant data

###### bankingMode?

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

###### name

`string`

###### settings?

`unknown`

###### slug?

`string` \| `null`

###### type?

`string` \| `null`

###### updatedAt?

`Date`

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the created tenant

#### Implementation of

[`IRepository`](../../base.repository/interfaces/IRepository.md).[`create`](../../base.repository/interfaces/IRepository.md#create)

***

### delete()

> **delete**(`id`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/tenants.repository.ts:180](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L180)

Soft delete a tenant.

#### Parameters

##### id

`string`

The tenant ID

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the updated (deleted) tenant

#### Implementation of

[`IRepository`](../../base.repository/interfaces/IRepository.md).[`delete`](../../base.repository/interfaces/IRepository.md#delete)

***

### findAll()

> **findAll**(`options?`): `Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/tenants.repository.ts:81](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L81)

Find all tenants with pagination.

#### Parameters

##### options?

[`TenantsQueryOptions`](../interfaces/TenantsQueryOptions.md)

Query options including pagination and filters

#### Returns

`Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to paginated tenant results

#### Implementation of

[`IRepository`](../../base.repository/interfaces/IRepository.md).[`findAll`](../../base.repository/interfaces/IRepository.md#findall)

***

### findByCode()

> **findByCode**(`code`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/tenants.repository.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L53)

Find tenant by code.

#### Parameters

##### code

`string`

The tenant code

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the tenant or undefined

***

### findById()

> **findById**(`id`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/tenants.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L36)

Find tenant by ID.

#### Parameters

##### id

`string`

The tenant ID

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the tenant or NotFoundError

#### Implementation of

[`IRepository`](../../base.repository/interfaces/IRepository.md).[`findById`](../../base.repository/interfaces/IRepository.md#findbyid)

***

### findBySlug()

> **findBySlug**(`slug`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/tenants.repository.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L67)

Find tenant by slug.

#### Parameters

##### slug

`string`

The tenant slug

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the tenant or undefined

***

### update()

> **update**(`id`, `data`): `Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/tenants.repository.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/tenants.repository.ts#L153)

Update an existing tenant.

#### Parameters

##### id

`string`

The tenant ID

##### data

`Partial`\<[`NewTenant`](../../../db/schema/core/type-aliases/NewTenant.md)\>

The data to update

#### Returns

`Effect`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the updated tenant or NotFoundError

#### Implementation of

[`IRepository`](../../base.repository/interfaces/IRepository.md).[`update`](../../base.repository/interfaces/IRepository.md#update)
