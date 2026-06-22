[**Backend API Reference v1.0.0**](index.md)

***

# repositories/base.repository

## Interfaces

### IRepository

Defined in: [src/repositories/base.repository.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L52)

Core interface for standard CRUD repository operations.

#### Extended by

- [`ITenantRepository`](#itenantrepository)

#### Type Parameters

##### T

`T`

##### TInsert

`TInsert`

##### TId

`TId` = `string`

#### Methods

##### create()

> **create**(`data`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L58)

Create a new record

###### Parameters

###### data

`TInsert`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### delete()

> **delete**(`id`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L62)

Categorically delete/soft-delete a record

###### Parameters

###### id

`TId`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

##### findAll()

> **findAll**(`options?`): `Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L56)

Find all items matching optional criteria with pagination

###### Parameters

###### options?

[`QueryOptions`](#queryoptions)

###### Returns

`Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### findById()

> **findById**(`id`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L54)

Find an item by its primary key

###### Parameters

###### id

`TId`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

##### update()

> **update**(`id`, `data`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L60)

Update an existing record partially

###### Parameters

###### id

`TId`

###### data

`Partial`&lt;`TInsert`&gt;

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

***

### ITenantRepository

Defined in: [src/repositories/base.repository.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L126)

Extension of IRepository that specifically handles tenant isolation.

#### Extends

- [`IRepository`](#irepository)&lt;`T`, `TInsert`, `TId`&gt;

#### Type Parameters

##### T

`T`

##### TInsert

`TInsert`

##### TId

`TId` = `string`

#### Methods

##### create()

> **create**(`data`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L58)

Create a new record

###### Parameters

###### data

`TInsert`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

###### Inherited from

[`IRepository`](#irepository).[`create`](#create)

##### delete()

> **delete**(`id`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L62)

Categorically delete/soft-delete a record

###### Parameters

###### id

`TId`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

###### Inherited from

[`IRepository`](#irepository).[`delete`](#delete)

##### findAll()

> **findAll**(`options?`): `Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L56)

Find all items matching optional criteria with pagination

###### Parameters

###### options?

[`QueryOptions`](#queryoptions)

###### Returns

`Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

###### Inherited from

[`IRepository`](#irepository).[`findAll`](#findall)

##### findById()

> **findById**(`id`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L54)

Find an item by its primary key

###### Parameters

###### id

`TId`

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

###### Inherited from

[`IRepository`](#irepository).[`findById`](#findbyid)

##### findByTenant()

> **findByTenant**(`tenantId`, `options?`): `Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:128](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L128)

Find all items belonging to a specific tenant

###### Parameters

###### tenantId

`string`

###### options?

[`QueryOptions`](#queryoptions)

###### Returns

`Effect`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### update()

> **update**(`id`, `data`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L60)

Update an existing record partially

###### Parameters

###### id

`TId`

###### data

`Partial`&lt;`TInsert`&gt;

###### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

###### Inherited from

[`IRepository`](#irepository).[`update`](#update)

***

### PaginatedResult

Defined in: [src/repositories/base.repository.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L34)

Structure of a paginated list of results.

#### Type Parameters

##### T

`T`

#### Properties

##### data

> **data**: `T`[]

Defined in: [src/repositories/base.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L36)

The array of data for the current page

##### limit

> **limit**: `number`

Defined in: [src/repositories/base.repository.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L42)

Number of items per page

##### page

> **page**: `number`

Defined in: [src/repositories/base.repository.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L40)

Current page index

##### total

> **total**: `number`

Defined in: [src/repositories/base.repository.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L38)

Total number of records matching the query

***

### QueryOptions

Defined in: [src/repositories/base.repository.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L22)

Common query options for repository methods.

#### Extended by

- [`RolesQueryOptions`](repositories.rbac.repository.md#rolesqueryoptions)
- [`PermissionsQueryOptions`](repositories.rbac.repository.md#permissionsqueryoptions)
- [`UserRolesQueryOptions`](repositories.rbac.repository.md#userrolesqueryoptions)
- [`TenantsQueryOptions`](repositories.tenants.repository.md#tenantsqueryoptions)
- [`UsersQueryOptions`](repositories.users.repository.md#usersqueryoptions)

#### Properties

##### filters?

> `optional` **filters**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

##### pagination?

> `optional` **pagination**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

## Functions

### buildOrderBy()

> **buildOrderBy**&lt;`TTable`&gt;(`table`, `sort?`, `order?`): `SQL`&lt;`unknown`&gt; &#124; `undefined`

Defined in: [src/repositories/base.repository.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L77)

Build a Drizzle-ORM orderBy clause from sorting parameters.

#### Type Parameters

##### TTable

`TTable` *extends* `PgTable`&lt;`TableConfig`&gt;

#### Parameters

##### table

`TTable`

The Drizzle table object

##### sort?

`string`

Column name to sort by

##### order?

Sort direction ('asc' or 'desc')

`"asc"` | `"desc"`

#### Returns

`SQL`&lt;`unknown`&gt; &#124; `undefined`

A Drizzle SQL ordering expression or undefined if sort is missing/invalid

***

### calculateOffset()

> **calculateOffset**(`page`, `limit`): `number`

Defined in: [src/repositories/base.repository.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L97)

Calculate the database query 'offset' from page and limit.

#### Parameters

##### page

`number`

1-based page index

##### limit

`number`

Number of items per page

#### Returns

`number`

The calculate offset index

***

### insertEffect()

> **insertEffect**&lt;`T`&gt;(`operation`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L153)

Wrap a promise-based database insert operation in an Effect.
Maps the result array to the first (newly created) element.

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`&lt;`T`[]&gt;

Async function returning the inserted record(s)

#### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the first inserted record

***

### paginatedQuery()

> **paginatedQuery**&lt;`T`&gt;(`queryFn`, `countFn`, `pagination`): `Promise`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;&gt;

Defined in: [src/repositories/base.repository.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L104)

Create a paginated query wrapper

#### Type Parameters

##### T

`T`

#### Parameters

##### queryFn

() => `Promise`&lt;`T`[]&gt;

##### countFn

() => `Promise`&lt;`object`[]&gt;

##### pagination

[`PaginationParams`](lib.react-admin.md#paginationparams)

#### Returns

`Promise`&lt;[`PaginatedResult`](#paginatedresult)&lt;`T`&gt;&gt;

***

### queryEffect()

> **queryEffect**&lt;`T`&gt;(`operation`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L141)

Wrap a promise-based database query operation in an Effect.

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`&lt;`T`&gt;

Async function returning the query result

#### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that handles database error mapping

***

### updateEffect()

> **updateEffect**&lt;`T`&gt;(`operation`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/base.repository.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L164)

Wrap an update operation in Effect

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`&lt;`T`[]&gt;

#### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### withNotFound()

> **withNotFound**&lt;`T`&gt;(`resource`, `id`): (`effect`) => `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/base.repository.ts:179](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L179)

Utility to map an Effect's `undefined` result to a NotFoundError.

#### Type Parameters

##### T

`T`

#### Parameters

##### resource

`string`

Name of the resource being queried (for error reporting)

##### id

`string`

ID of the resource being queried

#### Returns

A transform function for Effects

> (`effect`): `Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

##### Parameters

###### effect

`Effect`&lt;`T` &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### Returns

`Effect`&lt;`T`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;
