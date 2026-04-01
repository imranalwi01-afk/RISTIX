[**Backend API Reference v1.0.0**](index.md)

***

# repositories/pd-configurations.repository

## Variables

### PdConfigurationsRepository

> `const` **PdConfigurationsRepository**: `object`

Defined in: [src/repositories/pd-configurations.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/pd-configurations.repository.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`) => `Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Create a new PD configuration.

###### Parameters

###### data

The configuration data

###### activeFlag

`boolean`

###### bucketGroup?

`string` \| `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### flFlag?

`boolean` \| `null`

###### flScalarId?

`number` \| `null`

###### iaFlag

`boolean`

###### interval?

`number` \| `null`

###### multiplication?

`number` \| `null`

###### observationPeriod?

`number` \| `null`

###### observationStartDate?

`string` \| `null`

###### pdMethod?

`string` \| `null`

###### pdModelName?

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

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the created configuration

##### delete()

> **delete**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Delete a PD configuration.

###### Parameters

###### id

`bigint`

The configuration ID

###### Returns

`Effect`\<`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to true on success

##### findAll()

> **findAll**: (`search?`, `selectedMethod?`, `bucket?`, `activeFlag?`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find all PD configurations with filters.

###### Parameters

###### search?

`string`

Search term

###### selectedMethod?

`string`

PD method ID

###### bucket?

`string`

Bucket group

###### activeFlag?

`boolean`

Active status flag

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of PD configurations

##### findById()

> **findById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find a PD configuration by ID.

###### Parameters

###### id

`bigint`

The configuration ID

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the configuration or null

##### update()

> **update**: (`id`, `data`) => `Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Update an existing PD configuration.

###### Parameters

###### id

`bigint`

The configuration ID

###### data

`Partial`\<*typeof* `frs9ImpCaPdConfig.$inferInsert`\>

The data to update

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `bucketGroup`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` \| `null`; `flScalarId`: `number` \| `null`; `iaFlag`: `boolean`; `interval`: `number` \| `null`; `multiplication`: `number` \| `null`; `observationPeriod`: `number` \| `null`; `observationStartDate`: `string` \| `null`; `pdMethod`: `string` \| `null`; `pdModelName`: `string` \| `null`; `pkid`: `number`; `populationType`: `string` \| `null`; `segmentId`: `number` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the updated configuration or null
