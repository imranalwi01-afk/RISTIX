[**Backend API Reference v1.0.0**](index.md)

***

# repositories/lgd-configurations.repository

## Interfaces

### LgdQueryOptions

Defined in: [src/repositories/lgd-configurations.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L8)

#### Properties

##### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/repositories/lgd-configurations.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L11)

##### lgdMethod?

> `optional` **lgdMethod**: `string` {`|`} `number`

Defined in: [src/repositories/lgd-configurations.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L10)

##### search?

> `optional` **search**: `string`

Defined in: [src/repositories/lgd-configurations.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L9)

## Variables

### LgdConfigurationsRepository

> `const` **LgdConfigurationsRepository**: `object`

Defined in: [src/repositories/lgd-configurations.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/lgd-configurations.repository.ts#L14)

#### Type Declaration

##### create()

> **create**: (`data`) => `Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Create a new LGD configuration.

###### Parameters

###### data

The configuration data

###### activeFlag?

`boolean` {`|`} `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### flFlag

`boolean`

###### flScalarId?

`number` {`|`} `null`

###### lgdMethod?

`number` {`|`} `null`

###### lgdModelName?

`string` {`|`} `null`

###### lgdRate?

`number` {`|`} `null`

###### observationPeriod?

`string` {`|`} `null`

###### observationStartDate?

`string` {`|`} `null`

###### pkid?

`number`

###### populationType?

`string` {`|`} `null`

###### segmentId?

`number` {`|`} `null`

###### updatedby?

`string` {`|`} `null`

###### updateddate?

`string` {`|`} `null`

###### updatedhost?

`string` {`|`} `null`

###### workoutPeriod?

`number` {`|`} `null`

###### Returns

`Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the created configuration

##### delete()

> **delete**: (`id`) => `Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Delete an LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the deleted configuration

##### findAll()

> **findAll**: (`options?`) => `Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find all LGD configurations with optional filtering.

###### Parameters

###### options?

[`LgdQueryOptions`](#lgdqueryoptions)

Filter options

###### Returns

`Effect`{`<`}`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to an array of configurations

##### findById()

> **findById**: (`id`) => `Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Find an LGD configuration by ID.

###### Parameters

###### id

`number`

The configuration ID

###### Returns

`Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the configuration or undefined

##### update()

> **update**: (`id`, `data`) => `Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Update an existing LGD configuration.

###### Parameters

###### id

`number`

The configuration ID

###### data

`Partial`{`<`}*typeof* `frs9ImpCaLgdConfig.$inferInsert`{`>`}

The data to update

###### Returns

`Effect`{`<`}{`{`} `activeFlag`: `boolean` {`|`} `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean`; `flScalarId`: `number` {`|`} `null`; `lgdMethod`: `number` {`|`} `null`; `lgdModelName`: `string` {`|`} `null`; `lgdRate`: `number` {`|`} `null`; `observationPeriod`: `string` {`|`} `null`; `observationStartDate`: `string` {`|`} `null`; `pkid`: `number`; `populationType`: `string` {`|`} `null`; `segmentId`: `number` {`|`} `null`; `updatedby`: `string` {`|`} `null`; `updateddate`: `string` {`|`} `null`; `updatedhost`: `string` {`|`} `null`; `workoutPeriod`: `number` {`|`} `null`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the updated configuration
