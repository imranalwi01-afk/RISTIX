[**Backend API Reference v1.0.0**](index.md)

***

# repositories/journal-parameters.repository

## Variables

### JournalParametersRepository

> `const` **JournalParametersRepository**: `object`

Defined in: [src/repositories/journal-parameters.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/journal-parameters.repository.ts#L7)

#### Type Declaration

##### create

> **create**: (`data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new journal parameter.

###### Parameters

###### data

The journal parameter data

###### activeFlag?

`boolean` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### currency?

`string` &#124; `null`

###### dbcr?

`string` &#124; `null`

###### glCode?

`string` &#124; `null`

###### glDesc?

`string` &#124; `null`

###### glGroup?

`string` &#124; `null`

###### glNumber?

`string` &#124; `null`

###### glType?

`string` &#124; `null`

###### pkid?

`number`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created journal parameter

##### delete

> **delete**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a journal parameter.

###### Parameters

###### id

`bigint`

The journal parameter ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true if deleted, false otherwise

##### findAll

> **findAll**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find all journal parameters.

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of journal parameters

##### findById

> **findById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a journal parameter by ID.

###### Parameters

###### id

`bigint`

The journal parameter ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the journal parameter or null

##### findMany

> **findMany**: (`options`) => `Effect`&lt;&#123; `journals`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Parameters

###### options

###### activeFlag?

`string` &#124; `boolean`

###### currency?

`string`

###### filters?

`Record`&lt;`string`, `unknown`&gt;

###### glGroup?

`string`

###### limit

`number`

###### offset?

`number`

###### page?

`number`

###### search?

`string`

###### sort?

`object`[]

###### Returns

`Effect`&lt;&#123; `journals`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### update

> **update**: (`id`, `data`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing journal parameter.

###### Parameters

###### id

`bigint`

The journal parameter ID

###### data

`Partial`&lt;*typeof* `frs9ParamJournal.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated journal parameter or null
