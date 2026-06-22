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

> **createDetail**: (`data`) => `Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new bucket detail.

###### Parameters

###### data

The data for the new bucket detail

###### bucketId?

`number` &#124; `null`

###### bucketName?

`string` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### pkid?

`number`

###### pkidHeader?

`number` &#124; `null`

###### rangeEnd?

`number` &#124; `null`

###### rangeStart?

`number` &#124; `null`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created bucket detail

##### createHeader()

> **createHeader**: (`data`) => `Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new bucket header.

###### Parameters

###### data

The data for the new bucket header

###### basis?

`string` &#124; `null`

###### bucketDefault?

`number` &#124; `null`

###### bucketDesc?

`string` &#124; `null`

###### bucketGroup?

`string` &#124; `null`

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

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### woFlag

`boolean`

###### Returns

`Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created bucket header

##### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a bucket detail.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### deleteHeader()

> **deleteHeader**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a bucket header and its details.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### findDetailById()

> **findDetailById**: (`id`) => `Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a bucket detail by ID.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### Returns

`Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the bucket detail or null

##### findDetailsByHeaderId()

> **findDetailsByHeaderId**: (`headerId`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find bucket details for a specific header.

###### Parameters

###### headerId

`bigint`

The ID of the bucket header

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of bucket details

##### findHeaderById()

> **findHeaderById**: (`id`) => `Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a bucket header by ID.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### Returns

`Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the bucket header or null

##### findHeaders()

> **findHeaders**: (`search?`, `basis?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find bucket headers with optional filtering.

###### Parameters

###### search?

`string`

Search term for bucket group or description

###### basis?

`string`

Filter by basis

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of bucket headers

##### updateDetail()

> **updateDetail**: (`id`, `data`) => `Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing bucket detail.

###### Parameters

###### id

`bigint`

The ID of the bucket detail

###### data

`Partial`&lt;*typeof* `frs9ParamBucketd.$inferInsert`&gt;

The updated data

###### Returns

`Effect`&lt;&#123; `bucketId`: `number` &#124; `null`; `bucketName`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `pkidHeader`: `number` &#124; `null`; `rangeEnd`: `number` &#124; `null`; `rangeStart`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated bucket detail or null

##### updateHeader()

> **updateHeader**: (`id`, `data`) => `Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing bucket header.

###### Parameters

###### id

`bigint`

The ID of the bucket header

###### data

`Partial`&lt;*typeof* `frs9ParamBucketh.$inferInsert`&gt;

The updated data

###### Returns

`Effect`&lt;&#123; `basis`: `string` &#124; `null`; `bucketDefault`: `number` &#124; `null`; `bucketDesc`: `string` &#124; `null`; `bucketGroup`: `string` &#124; `null`; `closedFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `woFlag`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated bucket header or null
