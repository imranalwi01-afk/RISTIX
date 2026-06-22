[**Backend API Reference v1.0.0**](index.md)

***

# repositories/tenants.repository

## Classes

### TenantsRepository

Defined in: [src/repositories/tenants.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L29)

Core interface for standard CRUD repository operations.

#### Implements

- [`IRepository`](repositories.base.repository.md#irepository)&lt;[`Tenant`](db.schema.core.md#tenant), [`NewTenant`](db.schema.core.md#newtenant)&gt;

#### Constructors

##### Constructor

> **new TenantsRepository**(): [`TenantsRepository`](#tenantsrepository)

###### Returns

[`TenantsRepository`](#tenantsrepository)

#### Methods

##### create()

> **create**(`data`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/tenants.repository.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L133)

Create a new tenant.

###### Parameters

###### data

The tenant data

###### bankingMode?

`string` &#124; `null`

###### code

`string`

###### createdAt?

`Date`

###### description?

`string` &#124; `null`

###### id?

`string`

###### isActive?

`boolean`

###### name

`string`

###### settings?

`unknown`

###### slug?

`string` &#124; `null`

###### type?

`string` &#124; `null`

###### updatedAt?

`Date`

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to the created tenant

###### Implementation of

[`IRepository`](repositories.base.repository.md#irepository).[`create`](repositories.base.repository.md#create)

##### delete()

> **delete**(`id`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/tenants.repository.ts:180](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L180)

Soft delete a tenant.

###### Parameters

###### id

`string`

The tenant ID

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated (deleted) tenant

###### Implementation of

[`IRepository`](repositories.base.repository.md#irepository).[`delete`](repositories.base.repository.md#delete)

##### findAll()

> **findAll**(`options?`): `Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/tenants.repository.ts:81](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L81)

Find all tenants with pagination.

###### Parameters

###### options?

[`TenantsQueryOptions`](#tenantsqueryoptions)

Query options including pagination and filters

###### Returns

`Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to paginated tenant results

###### Implementation of

[`IRepository`](repositories.base.repository.md#irepository).[`findAll`](repositories.base.repository.md#findall)

##### findByCode()

> **findByCode**(`code`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/tenants.repository.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L53)

Find tenant by code.

###### Parameters

###### code

`string`

The tenant code

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to the tenant or undefined

##### findById()

> **findById**(`id`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/tenants.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L36)

Find tenant by ID.

###### Parameters

###### id

`string`

The tenant ID

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the tenant or NotFoundError

###### Implementation of

[`IRepository`](repositories.base.repository.md#irepository).[`findById`](repositories.base.repository.md#findbyid)

##### findBySlug()

> **findBySlug**(`slug`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/tenants.repository.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L67)

Find tenant by slug.

###### Parameters

###### slug

`string`

The tenant slug

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect resolving to the tenant or undefined

##### update()

> **update**(`id`, `data`): `Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/tenants.repository.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L153)

Update an existing tenant.

###### Parameters

###### id

`string`

The tenant ID

###### data

`Partial`&lt;[`NewTenant`](db.schema.core.md#newtenant)&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated tenant or NotFoundError

###### Implementation of

[`IRepository`](repositories.base.repository.md#irepository).[`update`](repositories.base.repository.md#update)

## Interfaces

### TenantsQueryOptions

Defined in: [src/repositories/tenants.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L23)

Common query options for repository methods.

#### Extends

- [`QueryOptions`](repositories.base.repository.md#queryoptions)

#### Properties

##### bankingMode?

> `optional` **bankingMode?**: `string`

Defined in: [src/repositories/tenants.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L26)

##### filters?

> `optional` **filters?**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`filters`](repositories.base.repository.md#filters)

##### includeInactive?

> `optional` **includeInactive?**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`includeInactive`](repositories.base.repository.md#includeinactive)

##### isActive?

> `optional` **isActive?**: `boolean`

Defined in: [src/repositories/tenants.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L25)

##### pagination?

> `optional` **pagination?**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`pagination`](repositories.base.repository.md#pagination)

##### search?

> `optional` **search?**: `string`

Defined in: [src/repositories/tenants.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L24)

## Variables

### tenantsRepository

> `const` **tenantsRepository**: [`TenantsRepository`](#tenantsrepository)

Defined in: [src/repositories/tenants.repository.ts:189](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/tenants.repository.ts#L189)
