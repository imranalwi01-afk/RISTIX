[**Backend API Reference v1.0.0**](index.md)

***

# lib

## Functions

### dbOperation()

> **dbOperation**&lt;`A`&gt;(`operation`, `fn`): `Effect`&lt;`A`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/lib/effect/runtime.ts:295](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/effect/runtime.ts#L295)

Wrap a database operation with proper error handling

#### Type Parameters

##### A

`A`

#### Parameters

##### operation

`"query"` &#124; `"insert"` &#124; `"update"` &#124; `"delete"` &#124; `"transaction"`

##### fn

() => `Promise`&lt;`A`&gt;

#### Returns

`Effect`&lt;`A`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### handleEffectError()

> **handleEffectError**(`c`, `cause`): `Response`

Defined in: [src/lib/effect/runtime.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/effect/runtime.ts#L48)

Handle Effect errors and convert to HTTP responses

#### Parameters

##### c

`Context`

##### cause

`unknown`

#### Returns

`Response`

***

### runEffect()

> **runEffect**&lt;`A`&gt;(`c`, `effect`, `successStatus?`): `Promise`&lt;`any`&gt;

Defined in: [src/lib/effect/runtime.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/effect/runtime.ts#L20)

Run an Effect and convert the result to a Hono response

#### Type Parameters

##### A

`A`

#### Parameters

##### c

`Context`

##### effect

`Effect`&lt;`A`, [`CommonError`](lib.errors.md#commonerror)&gt;

##### successStatus?

`number` &#124; ((`value`) => `number`)

#### Returns

`Promise`&lt;`any`&gt;

***

### validate()

> **validate**&lt;`T`&gt;(`schema`, `data`): `Effect`&lt;`T`, [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/lib/effect/runtime.ts:313](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/effect/runtime.ts#L313)

Validate data with Zod and return Effect

#### Type Parameters

##### T

`T`

#### Parameters

##### schema

###### safeParse

(`data`) => `object`

##### data

`unknown`

#### Returns

`Effect`&lt;`T`, [`ValidationError`](lib.errors.md#validationerror)&gt;

## References

### AppError

Re-exports [AppError](lib.errors.md#apperror)

***

### AuthenticationError

Re-exports [AuthenticationError](lib.errors.md#authenticationerror)

***

### AuthorizationError

Re-exports [AuthorizationError](lib.errors.md#authorizationerror)

***

### BusinessError

Re-exports [BusinessError](lib.errors.md#businesserror)

***

### calculateOffset

Re-exports [calculateOffset](lib.react-admin.md#calculateoffset)

***

### CommonError

Re-exports [CommonError](lib.errors.md#commonerror)

***

### ConflictError

Re-exports [ConflictError](lib.errors.md#conflicterror)

***

### createListResponse

Re-exports [createListResponse](lib.react-admin.md#createlistresponse)

***

### createSingleResponse

Re-exports [createSingleResponse](lib.react-admin.md#createsingleresponse)

***

### DatabaseError

Re-exports [DatabaseError](lib.errors.md#databaseerror)

***

### FilterParams

Re-exports [FilterParams](lib.react-admin.md#filterparams)

***

### ListResponse

Re-exports [ListResponse](lib.react-admin.md#listresponse)

***

### NotFoundError

Re-exports [NotFoundError](lib.errors.md#notfounderror)

***

### PaginationParams

Re-exports [PaginationParams](lib.react-admin.md#paginationparams)

***

### parseFilterParams

Re-exports [parseFilterParams](lib.react-admin.md#parsefilterparams)

***

### parsePaginationParams

Re-exports [parsePaginationParams](lib.react-admin.md#parsepaginationparams)

***

### parseSortField

Re-exports [parseSortField](lib.react-admin.md#parsesortfield)

***

### RateLimitError

Re-exports [RateLimitError](lib.errors.md#ratelimiterror)

***

### reactAdminHeaders

Re-exports [reactAdminHeaders](lib.react-admin.md#reactadminheaders)

***

### sendListResponse

Re-exports [sendListResponse](lib.react-admin.md#sendlistresponse)

***

### sendSingleResponse

Re-exports [sendSingleResponse](lib.react-admin.md#sendsingleresponse)

***

### SingleResponse

Re-exports [SingleResponse](lib.react-admin.md#singleresponse)

***

### SortDirection

Re-exports [SortDirection](lib.react-admin.md#sortdirection)

***

### ValidationError

Re-exports [ValidationError](lib.errors.md#validationerror)
