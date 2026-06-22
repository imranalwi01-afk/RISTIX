[**Backend API Reference v1.0.0**](index.md)

***

# repositories/master-account.repository

## Interfaces

### MasterAccountCursorQueryOptions

Defined in: [src/repositories/master-account.repository.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L22)

#### Extends

- `Omit`&lt;[`WatchlistQueryOptions`](#watchlistqueryoptions), `"page"`&gt;

#### Properties

##### assessmentStatus?

> `optional` **assessmentStatus?**: `string`

Defined in: [src/repositories/master-account.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L14)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`assessmentStatus`](#assessmentstatus-1)

##### cursor?

> `optional` **cursor?**: `string`

Defined in: [src/repositories/master-account.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L23)

##### dateFrom?

> `optional` **dateFrom?**: `string`

Defined in: [src/repositories/master-account.repository.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L17)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`dateFrom`](#datefrom-1)

##### dateTo?

> `optional` **dateTo?**: `string`

Defined in: [src/repositories/master-account.repository.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L18)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`dateTo`](#dateto-1)

##### impairedFlag?

> `optional` **impairedFlag?**: `"I"` &#124; `"N"`

Defined in: [src/repositories/master-account.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L13)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`impairedFlag`](#impairedflag-1)

##### limit

> **limit**: `number`

Defined in: [src/repositories/master-account.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L10)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`limit`](#limit-1)

##### ratingCode?

> `optional` **ratingCode?**: `string`

Defined in: [src/repositories/master-account.repository.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L19)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`ratingCode`](#ratingcode-1)

##### search?

> `optional` **search?**: `string`

Defined in: [src/repositories/master-account.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L11)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`search`](#search-1)

##### sort?

> `optional` **sort?**: `ListSort`[]

Defined in: [src/repositories/master-account.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L24)

##### sortField?

> `optional` **sortField?**: `string`

Defined in: [src/repositories/master-account.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L15)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`sortField`](#sortfield-1)

##### sortOrder?

> `optional` **sortOrder?**: `"asc"` &#124; `"desc"`

Defined in: [src/repositories/master-account.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L16)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`sortOrder`](#sortorder-1)

##### stage?

> `optional` **stage?**: `number`

Defined in: [src/repositories/master-account.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L12)

###### Inherited from

[`WatchlistQueryOptions`](#watchlistqueryoptions).[`stage`](#stage-1)

***

### WatchlistQueryOptions

Defined in: [src/repositories/master-account.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L8)

#### Properties

##### assessmentStatus?

> `optional` **assessmentStatus?**: `string`

Defined in: [src/repositories/master-account.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L14)

##### dateFrom?

> `optional` **dateFrom?**: `string`

Defined in: [src/repositories/master-account.repository.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L17)

##### dateTo?

> `optional` **dateTo?**: `string`

Defined in: [src/repositories/master-account.repository.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L18)

##### impairedFlag?

> `optional` **impairedFlag?**: `"I"` &#124; `"N"`

Defined in: [src/repositories/master-account.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L13)

##### limit

> **limit**: `number`

Defined in: [src/repositories/master-account.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L10)

##### page

> **page**: `number`

Defined in: [src/repositories/master-account.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L9)

##### ratingCode?

> `optional` **ratingCode?**: `string`

Defined in: [src/repositories/master-account.repository.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L19)

##### search?

> `optional` **search?**: `string`

Defined in: [src/repositories/master-account.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L11)

##### sortField?

> `optional` **sortField?**: `string`

Defined in: [src/repositories/master-account.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L15)

##### sortOrder?

> `optional` **sortOrder?**: `"asc"` &#124; `"desc"`

Defined in: [src/repositories/master-account.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L16)

##### stage?

> `optional` **stage?**: `number`

Defined in: [src/repositories/master-account.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L12)

## Variables

### MasterAccountRepository

> `const` **MasterAccountRepository**: `object`

Defined in: [src/repositories/master-account.repository.ts:109](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/master-account.repository.ts#L109)

#### Type Declaration

##### findAll

> **findAll**: (`options`) => `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Parameters

###### options

[`WatchlistQueryOptions`](#watchlistqueryoptions)

###### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### findAllCursor

> **findAllCursor**: (`options`) => `Effect`&lt;&#123; `data`: `object`[]; `hasNextPage`: `boolean`; `hasPreviousPage`: `boolean`; `nextCursor`: `string` &#124; `null`; `previousCursor`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Parameters

###### options

[`MasterAccountCursorQueryOptions`](#masteraccountcursorqueryoptions)

###### Returns

`Effect`&lt;&#123; `data`: `object`[]; `hasNextPage`: `boolean`; `hasPreviousPage`: `boolean`; `nextCursor`: `string` &#124; `null`; `previousCursor`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### findAllOffset

> **findAllOffset**: (`options`) => `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find accounts for the impairment watchlist with pagination, filtering, and sorting.

###### Parameters

###### options

[`WatchlistQueryOptions`](#watchlistqueryoptions)

Query options

###### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an object with data array and total count
