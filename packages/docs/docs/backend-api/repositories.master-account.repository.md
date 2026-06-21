[**Backend API Reference v1.0.0**](index.md)

***

# repositories/master-account.repository

## Interfaces

### WatchlistQueryOptions

Defined in: [src/repositories/master-account.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L7)

#### Properties

##### assessmentStatus?

> `optional` **assessmentStatus**: `string`

Defined in: [src/repositories/master-account.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L13)

##### dateFrom?

> `optional` **dateFrom**: `string`

Defined in: [src/repositories/master-account.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L16)

##### dateTo?

> `optional` **dateTo**: `string`

Defined in: [src/repositories/master-account.repository.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L17)

##### impairedFlag?

> `optional` **impairedFlag**: `"I"` {`|`} `"N"`

Defined in: [src/repositories/master-account.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L12)

##### limit

> **limit**: `number`

Defined in: [src/repositories/master-account.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L9)

##### page

> **page**: `number`

Defined in: [src/repositories/master-account.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L8)

##### search?

> `optional` **search**: `string`

Defined in: [src/repositories/master-account.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L10)

##### sortField?

> `optional` **sortField**: `string`

Defined in: [src/repositories/master-account.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L14)

##### sortOrder?

> `optional` **sortOrder**: `"asc"` {`|`} `"desc"`

Defined in: [src/repositories/master-account.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L15)

##### stage?

> `optional` **stage**: `number`

Defined in: [src/repositories/master-account.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L11)

## Variables

### MasterAccountRepository

> `const` **MasterAccountRepository**: `object`

Defined in: [src/repositories/master-account.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/master-account.repository.ts#L20)

#### Type Declaration

##### findAll()

> **findAll**: (`options`) => `Effect`{`<`}{`{`} `data`: `object`[]; `total`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find accounts for the impairment watchlist with pagination, filtering, and sorting.

###### Parameters

###### options

[`WatchlistQueryOptions`](#watchlistqueryoptions)

Query options

###### Returns

`Effect`{`<`}{`{`} `data`: `object`[]; `total`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an object with data array and total count
