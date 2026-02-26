[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: LgdConfigurationsRepository

> `const` **LgdConfigurationsRepository**: `object`

Defined in: [src/repositories/lgd-configurations.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L14)

## Type Declaration

### create()

> **create**: (`data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new LGD configuration.

#### Parameters

##### data

The configuration data

###### activeFlag?

`boolean` \| `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### flFlag

`boolean`

###### flScalarId?

`number` \| `null`

###### lgdMethod?

`number` \| `null`

###### lgdModelName?

`string` \| `null`

###### lgdRate?

`number` \| `null`

###### observationPeriod?

`string` \| `null`

###### observationStartDate?

`string` \| `null`

###### pkid?

`number`

###### populationType?

`string` \| `null`

###### segmentId?

`number` \| `null`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

###### workoutPeriod?

`number` \| `null`

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created configuration

### delete()

> **delete**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete an LGD configuration.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the deleted configuration

### findAll()

> **findAll**: (`options?`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find all LGD configurations with optional filtering.

#### Parameters

##### options?

[`LgdQueryOptions`](../interfaces/LgdQueryOptions.md)

Filter options

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of configurations

### findById()

> **findById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find an LGD configuration by ID.

#### Parameters

##### id

`number`

The configuration ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the configuration or undefined

### update()

> **update**: (`id`, `data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing LGD configuration.

#### Parameters

##### id

`number`

The configuration ID

##### data

`Partial`\<*typeof* `frs9ImpCaLgdConfig.$inferInsert`\>

The data to update

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` \| `null`; `lgdMethod`: `number` \| `null`; `lgdModelName`: `string` \| `null`; `lgdRate`: `number` \| `null`; `observationPeriod`: `string` \| `null`; `observationStartDate`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `workoutPeriod`: `number` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated configuration
