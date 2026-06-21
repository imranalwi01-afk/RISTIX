[**Backend API Reference v1.0.0**](index.md)

***

# services/pd-configurations.service

## Variables

### PdConfigurationsService

> `const` **PdConfigurationsService**: `object`

Defined in: [src/services/pd-configurations.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/pd-configurations.service.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`, `userId`) => `Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new PD configuration.

###### Parameters

###### data

`any`

The configuration data

###### userId

`string`

The ID of the user creating the configuration

###### Returns

`Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created configuration

##### delete()

> **delete**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a PD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to a success message

##### get()

> **get**: (`id`) => `Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a PD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the configuration or NotFoundError

##### getMethods()

> **getMethods**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get available PD method options.
Dynamically sourced from Business Setting B0018 in FRS9_PARAM_COMMOND.
Per tech spec: PD_METHOD = Combo Box (Business Setting B0018)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getPopulationTypes()

> **getPopulationTypes**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get available PD population type options.
Dynamically sourced from Business Setting B0019 in FRS9_PARAM_COMMOND.
Per tech spec: POPULATION_TYPE = Combo Box (Business Setting B0019)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### list()

> **list**: (`query`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of transformed configurations

##### update()

> **update**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

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

`Effect`&lt;&#123; `bucket`: `string` &#124; `null`; `created_by`: `string`; `created_date`: `string`; `first_historical_date`: `string` &#124; `null`; `fl_flag`: `boolean` &#124; `null`; `fl_scalar_id`: `number` &#124; `null`; `historical_month`: `number` &#124; `null`; `ia_flag`: `boolean`; `id`: `number`; `is_active`: `boolean`; `migration_interval`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `multiplication`: `number` &#124; `null`; `population_segment_id`: `number` &#124; `null`; `population_type`: `string` &#124; `null`; `selected_method`: `string` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated configuration or NotFoundError
