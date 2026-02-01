[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: MasterAccountRepository

> `const` **MasterAccountRepository**: `object`

Defined in: [packages/new-backend/src/repositories/master-account.repository.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/master-account.repository.ts#L18)

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
