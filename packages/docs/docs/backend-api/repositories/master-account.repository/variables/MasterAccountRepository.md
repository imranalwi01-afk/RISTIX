[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: MasterAccountRepository

> `const` **MasterAccountRepository**: `object`

Defined in: [src/repositories/master-account.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/master-account.repository.ts#L20)

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
