[**Backend API Reference v1.0.0**](index.md)

***

# repositories/ecl-configurations.repository

## Variables

### EclConfigurationsRepository

> `const` **EclConfigurationsRepository**: `object`

Defined in: [src/repositories/ecl-configurations.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/ecl-configurations.repository.ts#L7)

#### Type Declaration

##### create

> **create**: (`headerData`, `detailsData`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new ECL configuration with details.

###### Parameters

###### headerData

The header data

###### activeFlag

`boolean`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### eclModelName?

`string` &#124; `null`

###### effectiveDate

`string`

###### lastRunDate?

`string` &#124; `null`

###### lastRunPeriod?

`string` &#124; `null`

###### lastRunStatus?

`string` &#124; `null`

###### module?

`string` &#124; `null`

###### pkid?

`number`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### detailsData

`object`[]

The details data

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created header

##### delete

> **delete**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete an ECL configuration and its details.

###### Parameters

###### id

`bigint`

The ECL header ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### findAllHeaders

> **findAllHeaders**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find all ECL configuration headers.

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of ECL headers

##### findDetailsByHeaderId

> **findDetailsByHeaderId**: (`headerId`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find ECL details by header ID.

###### Parameters

###### headerId

`bigint`

The ECL header ID

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of details

##### findHeaderById

> **findHeaderById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find an ECL configuration header by ID.

###### Parameters

###### id

`bigint`

The ECL header ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the header or null

##### update

> **update**: (`id`, `headerData`, `detailsData?`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125; &#124; `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing ECL configuration and its details.

###### Parameters

###### id

`bigint`

The ECL header ID

###### headerData

`Partial`&lt;*typeof* `frs9ImpCaEclConfigh.$inferInsert`&gt;

The header data to update

###### detailsData?

`object`[]

Optional details data to replace existing details

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` &#124; `null`; `effectiveDate`: `string`; `lastRunDate`: `string` &#124; `null`; `lastRunPeriod`: `string` &#124; `null`; `lastRunStatus`: `string` &#124; `null`; `module`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125; &#124; `null`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated header or null
