[**Backend API Reference v1.0.0**](index.md)

***

# services/bucket-parameters.service

## Variables

### BucketParametersService

> `const` **BucketParametersService**: `object`

Defined in: [src/services/bucket-parameters.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/bucket-parameters.service.ts#L10)

Service for managing Bucket Parameters.
Handles business logic for bucket headers and details.

#### Type Declaration

##### createDetail

> **createDetail**: (`headerId`, `data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new bucket detail.

###### Parameters

###### headerId

`number`

The ID of the parent bucket header

###### data

`any`

The data for the new bucket detail

###### userId

`string`

The ID of the user creating the detail

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

A promise resolving to the created bucket detail

##### createHeader

> **createHeader**: (`data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new bucket header.

###### Parameters

###### data

`any`

The data for the new bucket header

###### userId

`string`

The ID of the user creating the header

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

A promise resolving to the created bucket header

##### deleteDetail

> **deleteDetail**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete a bucket detail.

###### Parameters

###### id

`number`

The ID of the bucket detail to delete

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

A promise resolving to a success message

###### Throws

NotFoundError if the detail is not found

##### deleteHeader

> **deleteHeader**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a bucket header.

###### Parameters

###### id

`number`

The ID of the bucket header to delete

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

A promise resolving to a success message

##### getDetail

> **getDetail**: (`id`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a bucket detail by ID.

###### Parameters

###### id

`number`

The ID of the bucket detail

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

A promise resolving to the bucket detail

###### Throws

NotFoundError if the detail is not found

##### getHeader

> **getHeader**: (`id`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a bucket header by ID.

###### Parameters

###### id

`number`

The ID of the bucket header

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

A promise resolving to the bucket header

###### Throws

NotFoundError if the header is not found

##### listDetails

> **listDetails**: (`headerId`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List details for a specific bucket header.

###### Parameters

###### headerId

`number`

The ID of the bucket header

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

A promise resolving to an array of bucket details

##### listHeaders

> **listHeaders**: (`query`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List bucket headers with optional search and filtering.

###### Parameters

###### query

Query parameters for search and filtering

###### basis?

`string`

###### columnFilters?

`string`

###### search?

`string`

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

A promise resolving to an array of bucket headers

##### updateDetail

> **updateDetail**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Update an existing bucket detail.

###### Parameters

###### id

`number`

The ID of the bucket detail to update

###### data

`any`

The updated data

###### userId

`string`

The ID of the user updating the detail

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `bucket_id`: `number` &#124; `null`; `bucket_name`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `range_end`: `number` &#124; `null`; `range_start`: `number` &#124; `null`; `seq`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

A promise resolving to the updated bucket detail

###### Throws

NotFoundError if the detail is not found

##### updateHeader

> **updateHeader**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Update an existing bucket header.

###### Parameters

###### id

`number`

The ID of the bucket header to update

###### data

`any`

The updated data

###### userId

`string`

The ID of the user updating the header

###### Returns

`Effect`&lt;&#123; `active_flag`: `boolean`; `basis`: `string`; `bucket_group`: `string` &#124; `null`; `bucket_group_desc`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `id`: `number`; `include_close`: `boolean`; `include_wo`: `boolean`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

A promise resolving to the updated bucket header

###### Throws

NotFoundError if the header is not found
