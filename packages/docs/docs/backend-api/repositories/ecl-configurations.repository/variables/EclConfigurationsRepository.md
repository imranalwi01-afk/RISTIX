[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: EclConfigurationsRepository

> `const` **EclConfigurationsRepository**: `object`

Defined in: [src/repositories/ecl-configurations.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/ecl-configurations.repository.ts#L7)

## Type Declaration

### create()

> **create**: (`headerData`, `detailsData`) => `Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new ECL configuration with details.

#### Parameters

##### headerData

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

`string` \| `null`

###### effectiveDate

`string`

###### lastRunDate?

`string` \| `null`

###### lastRunPeriod?

`string` \| `null`

###### lastRunStatus?

`string` \| `null`

###### module?

`string` \| `null`

###### pkid?

`number`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

##### detailsData

`object`[]

The details data

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created header

### delete()

> **delete**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete an ECL configuration and its details.

#### Parameters

##### id

`bigint`

The ECL header ID

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to true on success

### findAllHeaders()

> **findAllHeaders**: () => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find all ECL configuration headers.

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of ECL headers

### findDetailsByHeaderId()

> **findDetailsByHeaderId**: (`headerId`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find ECL details by header ID.

#### Parameters

##### headerId

`bigint`

The ECL header ID

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of details

### findHeaderById()

> **findHeaderById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find an ECL configuration header by ID.

#### Parameters

##### id

`bigint`

The ECL header ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the header or null

### update()

> **update**: (`id`, `headerData`, `detailsData?`) => `Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `null`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing ECL configuration and its details.

#### Parameters

##### id

`bigint`

The ECL header ID

##### headerData

`Partial`\<*typeof* `frs9ImpCaEclConfigh.$inferInsert`\>

The header data to update

##### detailsData?

`object`[]

Optional details data to replace existing details

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `eclModelName`: `string` \| `null`; `effectiveDate`: `string`; `lastRunDate`: `string` \| `null`; `lastRunPeriod`: `string` \| `null`; `lastRunStatus`: `string` \| `null`; `module`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `null`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated header or null
