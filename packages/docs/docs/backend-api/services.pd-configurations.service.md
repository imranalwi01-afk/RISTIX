[**Backend API Reference v1.0.0**](index.md)

***

# services/pd-configurations.service

## Variables

### PdConfigurationsService

> `const` **PdConfigurationsService**: `object`

Defined in: [src/services/pd-configurations.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/pd-configurations.service.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Create a new PD configuration.

###### Parameters

###### data

`any`

The configuration data

###### userId

`string`

The ID of the user creating the configuration

###### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the created configuration

##### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Delete a PD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to a success message

##### get()

> **get**: (`id`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

Get a PD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

An Effect resolving to the configuration or NotFoundError

##### getMethods()

> **getMethods**: () => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get available PD method options.
Dynamically sourced from Business Setting B0018 in FRS9_PARAM_COMMOND.
Per tech spec: PD_METHOD = Combo Box (Business Setting B0018)

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

##### getPopulationTypes()

> **getPopulationTypes**: () => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get available PD population type options.
Dynamically sourced from Business Setting B0019 in FRS9_PARAM_COMMOND.
Per tech spec: POPULATION_TYPE = Combo Box (Business Setting B0019)

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

##### list()

> **list**: (`query`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

List PD configurations with filtering options.

###### Parameters

###### query

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

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of transformed configurations

##### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

Update an existing PD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the configuration

###### Returns

`Effect`\<\{ `bucket`: `string` \| `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` \| `null`; `fl_flag`: `boolean` \| `null`; `fl_scalar_id`: `number` \| `null`; `historical_month`: `number` \| `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` \| `null`; `model_name`: `string` \| `null`; `multiplication`: `number` \| `null`; `population_segment_id`: `number` \| `null`; `population_type`: `string` \| `null`; `selected_method`: `string` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

An Effect resolving to the updated configuration or NotFoundError
