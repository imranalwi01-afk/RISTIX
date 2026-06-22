[**Backend API Reference v1.0.0**](index.md)

***

# services/journal-parameters.service

## Variables

### JournalParametersService

> `const` **JournalParametersService**: `object`

Defined in: [src/services/journal-parameters.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/journal-parameters.service.ts#L9)

#### Type Declaration

##### create

> **create**: (`data`, `userId`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new journal parameter.

###### Parameters

###### data

`any`

The journal parameter data

###### userId

`string`

The ID of the user creating the parameter

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created journal parameter

##### delete

> **delete**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete a journal parameter.

###### Parameters

###### id

`number`

The journal parameter ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to a success message or NotFoundError

##### get

> **get**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a journal parameter by ID.

###### Parameters

###### id

`number`

The journal parameter ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the journal parameter or NotFoundError

##### getCurrencyOptions

> **getCurrencyOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Currency options from Business Setting B0001.

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getDbCrOptions

> **getDbCrOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Debit/Credit options from Business Setting B0007.

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getGlGroupOptions

> **getGlGroupOptions**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get GL Group options from Rule Base Setting (type = GL).

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getJournalCodeOptions

> **getJournalCodeOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Journal Code options from Business Setting B0006 (per tech spec).

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getJournalTypeOptions

> **getJournalTypeOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Journal Type options from Business Setting B0005 (per tech spec).

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getOptions

> **getOptions**: (`paramCode`) => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get dropdown options from a Business Setting code (e.g. B0001).

###### Parameters

###### paramCode

`string`

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### list

> **list**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List all journal parameters.

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of journal parameters

##### listPage

> **listPage**: (`query`) => `Effect`&lt;&#123; `rows`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Parameters

###### query

`ListQuery`

###### Returns

`Effect`&lt;&#123; `rows`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### update

> **update**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Update an existing journal parameter.

###### Parameters

###### id

`number`

The journal parameter ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the parameter

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated journal parameter or NotFoundError
