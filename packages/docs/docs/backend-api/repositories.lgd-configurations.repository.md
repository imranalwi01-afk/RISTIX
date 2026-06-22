[**Backend API Reference v1.0.0**](index.md)

***

# repositories/lgd-configurations.repository

## Interfaces

### LgdQueryOptions

Defined in: [src/repositories/lgd-configurations.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L8)

#### Properties

##### isActive?

> `optional` **isActive?**: `boolean`

Defined in: [src/repositories/lgd-configurations.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L11)

##### lgdMethod?

> `optional` **lgdMethod?**: `string` &#124; `number`

Defined in: [src/repositories/lgd-configurations.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L10)

##### search?

> `optional` **search?**: `string`

Defined in: [src/repositories/lgd-configurations.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L9)

## Variables

### LgdConfigurationsRepository

> `const` **LgdConfigurationsRepository**: `object`

Defined in: [src/repositories/lgd-configurations.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L14)

#### Type Declaration

##### create

> **create**: (`data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new LGD configuration.

###### Parameters

###### data

The configuration data

###### activeFlag?

`boolean` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### flFlag

`boolean`

###### flScalarId?

`number` &#124; `null`

###### lgdMethod?

`number` &#124; `null`

###### lgdModelName?

`string` &#124; `null`

###### lgdRate?

`number` &#124; `null`

###### maxRecoveryPeriod?

`number` &#124; `null`

###### observationPeriod?

`string` &#124; `null`

###### observationStartDate?

`string` &#124; `null`

###### pkid?

`number`

###### populationType?

`string` &#124; `null`

###### segmentId?

`number` &#124; `null`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### workoutPeriod?

`number` &#124; `null`

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created configuration

##### delete

> **delete**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete an LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the deleted configuration

##### findAll

> **findAll**: (`options?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find all LGD configurations with optional filtering.

###### Parameters

###### options?

[`LgdQueryOptions`](#lgdqueryoptions)

Filter options

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of configurations

##### findById

> **findById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find an LGD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the configuration or undefined

##### update

> **update**: (`id`, `data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### data

`Partial`&lt;*typeof* `frs9ImpCaLgdConfig.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` &#124; `null`; `lgdMethod`: `number` &#124; `null`; `lgdModelName`: `string` &#124; `null`; `lgdRate`: `number` &#124; `null`; `maxRecoveryPeriod`: `number` &#124; `null`; `observationPeriod`: `string` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `workoutPeriod`: `number` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated configuration
