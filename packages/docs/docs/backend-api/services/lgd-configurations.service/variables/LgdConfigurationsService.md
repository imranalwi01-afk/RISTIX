[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: LgdConfigurationsService

> `const` **LgdConfigurationsService**: `object`

Defined in: [src/services/lgd-configurations.service.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/lgd-configurations.service.ts#L6)

## Type Declaration

### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new LGD configuration.

#### Parameters

##### data

`any`

The configuration data

##### userId

`string`

The ID of the user creating the configuration

#### Returns

`Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created configuration

### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Delete an LGD configuration.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to a success message or NotFoundError

### get()

> **get**: (`id`) => `Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Get an LGD configuration by ID.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the configuration or NotFoundError

### getMethods()

> **getMethods**: () => `Effect`\<`object`[], `never`, `never`\>

Get available LGD methods options.

#### Returns

`Effect`\<`object`[], `never`, `never`\>

### getPopulationTypes()

> **getPopulationTypes**: () => `Effect`\<`object`[], `never`, `never`\>

Get available population types options.

#### Returns

`Effect`\<`object`[], `never`, `never`\>

### list()

> **list**: (`options`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List LGD configurations with filtering.

#### Parameters

##### options

Filter options

###### is_active?

`string`

###### lgd_method?

`string`

###### search?

`string`

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of transformed configurations

### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing LGD configuration.

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

`Effect`\<\{ `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` \| `null`; `id`: `number`; `is_active`: `boolean` \| `null`; `lgd_method`: `number` \| `null`; `lgd_rate`: `number` \| `null`; `model_name`: `string` \| `null`; `observation_period`: `string` \| `null`; `observation_start_date`: `string` \| `null`; `population_type`: `string` \| `null`; `segment_id`: `number` \| `null`; `updated_by`: `string` \| `null`; `updated_date`: `string` \| `null`; `workout_period`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the updated configuration or NotFoundError
