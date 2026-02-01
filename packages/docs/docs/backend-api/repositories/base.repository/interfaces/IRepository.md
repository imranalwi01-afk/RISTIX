[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: IRepository\<T, TInsert, TId\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L52)

Core interface for standard CRUD repository operations.

## Extended by

- [`ITenantRepository`](ITenantRepository.md)

## Type Parameters

### T

`T`

### TInsert

`TInsert`

### TId

`TId` = `string`

## Methods

### create()

> **create**(`data`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L58)

Create a new record

#### Parameters

##### data

`TInsert`

#### Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### delete()

> **delete**(`id`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L62)

Categorically delete/soft-delete a record

#### Parameters

##### id

`TId`

#### Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

***

### findAll()

> **findAll**(`options?`): `Effect`\<[`PaginatedResult`](PaginatedResult.md)\<`T`\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L56)

Find all items matching optional criteria with pagination

#### Parameters

##### options?

[`QueryOptions`](QueryOptions.md)

#### Returns

`Effect`\<[`PaginatedResult`](PaginatedResult.md)\<`T`\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### findById()

> **findById**(`id`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L54)

Find an item by its primary key

#### Parameters

##### id

`TId`

#### Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

***

### update()

> **update**(`id`, `data`): `Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [packages/new-backend/src/repositories/base.repository.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/base.repository.ts#L60)

Update an existing record partially

#### Parameters

##### id

`TId`

##### data

`Partial`\<`TInsert`\>

#### Returns

`Effect`\<`T`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>
