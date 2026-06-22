[**Backend API Reference v1.0.0**](index.md)

***

# services/lgd-configurations.service

## Variables

### LgdConfigurationsService

> `const` **LgdConfigurationsService**: `object`

Defined in: [src/services/lgd-configurations.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/lgd-configurations.service.ts#L7)

#### Type Declaration

##### create

> **create**: (`data`, `userId`) => `Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new LGD configuration.

###### Parameters

###### data

`any`

The configuration data

###### userId

`string`

The ID of the user creating the configuration

###### Returns

`Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created configuration

##### delete

> **delete**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete an LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to a success message or NotFoundError

##### get

> **get**: (`id`) => `Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get an LGD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the configuration or NotFoundError

##### getMethods

> **getMethods**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get available LGD method options.
Dynamically sourced from Business Setting B0022 in FRS9_PARAM_COMMOND.
Per tech spec: LGD_METHOD = Combo Box (Business Setting B0022)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getPopulationTypes

> **getPopulationTypes**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get available LGD population type options.
Dynamically sourced from Business Setting B0023 in FRS9_PARAM_COMMOND.
Per tech spec: POLUPATION_TYPE = Combo Box (Business Setting B0023)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### list

> **list**: (`options`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List LGD configurations with filtering.

###### Parameters

###### options

Filter options

###### is_active?

`string`

###### lgd_method?

`string`

###### search?

`string`

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of transformed configurations

##### update

> **update**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Update an existing LGD configuration.

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

`Effect`&lt;&#123; `created_by`: `string`; `created_date`: `string`; `created_host`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` &#124; `null`; `id`: `number`; `is_active`: `boolean` &#124; `null`; `lgd_method`: `number` &#124; `null`; `lgd_rate`: `number` &#124; `null`; `max_recovery_period`: `number` &#124; `null`; `model_name`: `string` &#124; `null`; `observation_period`: `string` &#124; `null`; `observation_start_date`: `string` &#124; `null`; `population_type`: `string` &#124; `null`; `segment_id`: `number` &#124; `null`; `updated_by`: `string` &#124; `null`; `updated_date`: `string` &#124; `null`; `updated_host`: `string` &#124; `null`; `workout_period`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated configuration or NotFoundError
