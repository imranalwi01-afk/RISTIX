[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: BucketParametersService

> `const` **BucketParametersService**: `object`

Defined in: [src/services/bucket-parameters.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/bucket-parameters.service.ts#L10)

Service for managing Bucket Parameters.
Handles business logic for bucket headers and details.

## Type Declaration

### createDetail()

> **createDetail**: (`headerId`, `data`, `userId`) => `Effect`\<\{ `active_flag`: `boolean`; `bucket_id`: `number` \| `null`; `bucket_name`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` \| `null`; `range_start`: `number` \| `null`; `seq`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new bucket detail.

#### Parameters

##### headerId

`number`

The ID of the parent bucket header

##### data

`any`

The data for the new bucket detail

##### userId

`string`

The ID of the user creating the detail

#### Returns

`Effect`\<\{ `active_flag`: `boolean`; `bucket_id`: `number` \| `null`; `bucket_name`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` \| `null`; `range_start`: `number` \| `null`; `seq`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

A promise resolving to the created bucket detail

### createHeader()

> **createHeader**: (`data`, `userId`) => `Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new bucket header.

#### Parameters

##### data

`any`

The data for the new bucket header

##### userId

`string`

The ID of the user creating the header

#### Returns

`Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

A promise resolving to the created bucket header

### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Delete a bucket detail.

#### Parameters

##### id

`number`

The ID of the bucket detail to delete

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

A promise resolving to a success message

#### Throws

NotFoundError if the detail is not found

### deleteHeader()

> **deleteHeader**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a bucket header.

#### Parameters

##### id

`number`

The ID of the bucket header to delete

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

A promise resolving to a success message

### getHeader()

> **getHeader**: (`id`) => `Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Get a bucket header by ID.

#### Parameters

##### id

`number`

The ID of the bucket header

#### Returns

`Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

A promise resolving to the bucket header

#### Throws

NotFoundError if the header is not found

### listDetails()

> **listDetails**: (`headerId`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List details for a specific bucket header.

#### Parameters

##### headerId

`number`

The ID of the bucket header

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

A promise resolving to an array of bucket details

### listHeaders()

> **listHeaders**: (`query`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List bucket headers with optional search and filtering.

#### Parameters

##### query

Query parameters for search and filtering

###### basis?

`string`

###### search?

`string`

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

A promise resolving to an array of bucket headers

### updateDetail()

> **updateDetail**: (`id`, `data`, `userId`) => `Effect`\<\{ `active_flag`: `boolean`; `bucket_id`: `number` \| `null`; `bucket_name`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` \| `null`; `range_start`: `number` \| `null`; `seq`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing bucket detail.

#### Parameters

##### id

`number`

The ID of the bucket detail to update

##### data

`any`

The updated data

##### userId

`string`

The ID of the user updating the detail

#### Returns

`Effect`\<\{ `active_flag`: `boolean`; `bucket_id`: `number` \| `null`; `bucket_name`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` \| `null`; `range_start`: `number` \| `null`; `seq`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

A promise resolving to the updated bucket detail

#### Throws

NotFoundError if the detail is not found

### updateHeader()

> **updateHeader**: (`id`, `data`, `userId`) => `Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing bucket header.

#### Parameters

##### id

`number`

The ID of the bucket header to update

##### data

`any`

The updated data

##### userId

`string`

The ID of the user updating the header

#### Returns

`Effect`\<\{ `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` \| `null`; `bucket_group_desc`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

A promise resolving to the updated bucket header

#### Throws

NotFoundError if the header is not found
