[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: MasterAccountRepository

> `const` **MasterAccountRepository**: `object`

Defined in: [src/repositories/master-account.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/master-account.repository.ts#L20)

## Type Declaration

### findAll()

> **findAll**: (`options`) => `Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find accounts for the impairment watchlist with pagination, filtering, and sorting.

#### Parameters

##### options

[`WatchlistQueryOptions`](../interfaces/WatchlistQueryOptions.md)

Query options

#### Returns

`Effect`\<\{ `data`: `object`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an object with data array and total count
