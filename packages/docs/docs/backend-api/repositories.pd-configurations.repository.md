[**Backend API Reference v1.0.0**](index.md)

***

# repositories/pd-configurations.repository

## Variables

### PdConfigurationsRepository

> `const` **PdConfigurationsRepository**: `object`

Defined in: [src/repositories/pd-configurations.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/pd-configurations.repository.ts#L7)

#### Type Declaration

##### create

> **create**: (`data`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new PD configuration.

###### Parameters

###### data

The configuration data

###### activeFlag

`boolean`

###### bucketGroup?

`string` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### flFlag?

`boolean` &#124; `null`

###### flScalarId?

`number` &#124; `null`

###### iaFlag

`boolean`

###### interval?

`number` &#124; `null`

###### multiplication?

`number` &#124; `null`

###### observationPeriod?

`number` &#124; `null`

###### observationStartDate?

`string` &#124; `null`

###### pdMethod?

`string` &#124; `null`

###### pdModelName?

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

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created configuration

##### delete

> **delete**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a PD configuration.

###### Parameters

###### id

`bigint`

The configuration ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### findAll

> **findAll**: (`search?`, `selectedMethod?`, `bucket?`, `activeFlag?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of PD configurations

##### findById

> **findById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a PD configuration by ID.

###### Parameters

###### id

`bigint`

The configuration ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the configuration or null

##### update

> **update**: (`id`, `data`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing PD configuration.

###### Parameters

###### id

`bigint`

The configuration ID

###### data

`Partial`&lt;*typeof* `frs9ImpCaPdConfig.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `bucketGroup`: `string` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `flFlag`: `boolean` &#124; `null`; `flScalarId`: `number` &#124; `null`; `iaFlag`: `boolean`; `interval`: `number` &#124; `null`; `multiplication`: `number` &#124; `null`; `observationPeriod`: `number` &#124; `null`; `observationStartDate`: `string` &#124; `null`; `pdMethod`: `string` &#124; `null`; `pdModelName`: `string` &#124; `null`; `pkid`: `number`; `populationType`: `string` &#124; `null`; `segmentId`: `number` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated configuration or null
