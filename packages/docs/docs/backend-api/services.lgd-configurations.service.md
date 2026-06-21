[**Backend API Reference v1.0.0**](index.md)

***

# services/lgd-configurations.service

## Variables

### LgdConfigurationsService

> `const` **LgdConfigurationsService**: `object`

Defined in: [src/services/lgd-configurations.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/lgd-configurations.service.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`, `userId`) => `Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new LGD configuration.

###### Parameters

###### data

`any`

The configuration data

###### userId

`string`

The ID of the user creating the configuration

###### Returns

`Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created configuration

##### delete()

> **delete**: (`id`) => `Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Delete an LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`{`<`}{`{`} `message`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to a success message or NotFoundError

##### get()

> **get**: (`id`) => `Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Get an LGD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the configuration or NotFoundError

##### getMethods()

> **getMethods**: () => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Get available LGD method options.
Dynamically sourced from Business Setting B0022 in FRS9_PARAM_COMMOND.
Per tech spec: LGD_METHOD = Combo Box (Business Setting B0022)

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

##### getPopulationTypes()

> **getPopulationTypes**: () => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Get available LGD population type options.
Dynamically sourced from Business Setting B0023 in FRS9_PARAM_COMMOND.
Per tech spec: POLUPATION_TYPE = Combo Box (Business Setting B0023)

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

##### list()

> **list**: (`options`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

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

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of transformed configurations

##### update()

> **update**: (`id`, `data`, `userId`) => `Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

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

`Effect`{`<`}{`{`} `created_by`: `string`; `created_date`: `string`; `fl_flag`: `boolean`; `fl_scalar_id`: `number` {`|`} `null`; `id`: `number`; `is_active`: `boolean` {`|`} `null`; `lgd_method`: `number` {`|`} `null`; `lgd_rate`: `number` {`|`} `null`; `model_name`: `string` {`|`} `null`; `observation_period`: `string` {`|`} `null`; `observation_start_date`: `string` {`|`} `null`; `population_type`: `string` {`|`} `null`; `segment_id`: `number` {`|`} `null`; `updated_by`: `string` {`|`} `null`; `updated_date`: `string` {`|`} `null`; `workout_period`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the updated configuration or NotFoundError
