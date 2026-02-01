[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: PdConfigurationsService

> `const` **PdConfigurationsService**: `object`

Defined in: [packages/new-backend/src/services/pd-configurations.service.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/pd-configurations.service.ts#L6)

## Type Declaration

### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new PD configuration.

#### Parameters

##### data

`any`

The configuration data

##### userId

`string`

The ID of the user creating the configuration

#### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created configuration

### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a PD configuration.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to a success message

### get()

> **get**: (`id`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Get a PD configuration by ID.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the configuration or NotFoundError

### getMethods()

> **getMethods**: () => `Effect`\<`object`[], `never`, `never`\>

Get available PD methods options.

#### Returns

`Effect`\<`object`[], `never`, `never`\>

### getPopulationTypes()

> **getPopulationTypes**: () => `Effect`\<`object`[], `never`, `never`\>

Get available population types options.

#### Returns

`Effect`\<`object`[], `never`, `never`\>

### list()

> **list**: (`query`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List PD configurations with filtering options.

#### Parameters

##### query

Filter options

###### bucket?

`string`

Bucket group

###### is_active?

`boolean`

Active status flag

###### search?

`string`

Search term for model name

###### selected_method?

`string`

PD method ID

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of transformed configurations

### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing PD configuration.

#### Parameters

##### id

`number`

The configuration ID

##### data

`any`

The data to update

##### userId

`string`

The ID of the user updating the configuration

#### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `number`; `selected_method`: `number`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the updated configuration or NotFoundError
