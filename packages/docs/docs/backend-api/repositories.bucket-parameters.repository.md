[**Backend API Reference v1.0.0**](index.md)

***

# repositories/bucket-parameters.repository

## Variables

### BucketParametersRepository

> `const` **BucketParametersRepository**: `object`

Defined in: [src/repositories/bucket-parameters.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/bucket-parameters.repository.ts#L10)

Repository for accessing Bucket Parameters data.

#### Type Declaration

##### createDetail()

> **createDetail**: (`data`) => `Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new bucket detail.

###### Parameters

###### data

The data for the new bucket detail

###### bucketId?

`number` {`|`} `null`

###### bucketName?

`string` {`|`} `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### pkid?

`number`

###### pkidHeader?

`number` {`|`} `null`

###### rangeEnd?

`number` {`|`} `null`

###### rangeStart?

`number` {`|`} `null`

###### updatedby?

`string` {`|`} `null`

###### updateddate?

`string` {`|`} `null`

###### updatedhost?

`string` {`|`} `null`

###### Returns

`Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created bucket detail

##### createHeader()

> **createHeader**: (`data`) => `Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new bucket header.

###### Parameters

###### data

The data for the new bucket header

###### basis?

`string` {`|`} `null`

###### bucketDefault?

`number` {`|`} `null`

###### bucketDesc?

`string` {`|`} `null`

###### bucketGroup?

`string` {`|`} `null`

###### closedFlag

`boolean`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### pkid?

`number`

###### updatedby?

`string` {`|`} `null`

###### updateddate?

`string` {`|`} `null`

###### updatedhost?

`string` {`|`} `null`

###### woFlag

`boolean`

###### Returns

`Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created bucket header

##### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`{`<`}`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Delete a bucket detail.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### Returns

`Effect`{`<`}`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to true on success

##### deleteHeader()

> **deleteHeader**: (`id`) => `Effect`{`<`}`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Delete a bucket header and its details.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### Returns

`Effect`{`<`}`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to true on success

##### findDetailById()

> **findDetailById**: (`id`) => `Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find a bucket detail by ID.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### Returns

`Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the bucket detail or null

##### findDetailsByHeaderId()

> **findDetailsByHeaderId**: (`headerId`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find bucket details for a specific header.

###### Parameters

###### headerId

`bigint`

The ID of the bucket header

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of bucket details

##### findHeaderById()

> **findHeaderById**: (`id`) => `Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find a bucket header by ID.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### Returns

`Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the bucket header or null

##### findHeaders()

> **findHeaders**: (`search?`, `basis?`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find bucket headers with optional filtering.

###### Parameters

###### search?

`string`

Search term for bucket group or description

###### basis?

`string`

Filter by basis

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of bucket headers

##### updateDetail()

> **updateDetail**: (`id`, `data`) => `Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Update an existing bucket detail.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### data

`Partial`{`<`}*typeof* `frs9ParamBucketd.$inferInsert`{`>`}

The updated data

###### Returns

`Effect`{`<`}{`{`} `bucketId`: `number` {`|`} `null`; `bucketName`: `string` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` {`|`} `null`; `rangeEnd`: `number` {`|`} `null`; `rangeStart`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the updated bucket detail or null

##### updateHeader()

> **updateHeader**: (`id`, `data`) => `Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Update an existing bucket header.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### data

`Partial`{`<`}*typeof* `frs9ParamBucketh.$inferInsert`{`>`}

The updated data

###### Returns

`Effect`{`<`}{`{`} `basis`: `string` {`|`} `null`; `bucketDefault`: `number` {`|`} `null`; `bucketDesc`: `string` {`|`} `null`; `bucketGroup`: `string` {`|`} `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `woFlag`: `boolean`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the updated bucket header or null
