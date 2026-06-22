[**Backend API Reference v1.0.0**](index.md)

***

# services/journal-parameters.service

## Variables

### JournalParametersService

> `const` **JournalParametersService**: `object`

Defined in: [src/services/journal-parameters.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/journal-parameters.service.ts#L7)

#### Type Declaration

##### create()

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

##### delete()

> **delete**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete a journal parameter.

###### Parameters

###### id

`number`

The journal parameter ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to a success message or NotFoundError

##### get()

> **get**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a journal parameter by ID.

###### Parameters

###### id

`number`

The journal parameter ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` &#124; `null`; `dbcr`: `string` &#124; `null`; `glCode`: `string` &#124; `null`; `glDesc`: `string` &#124; `null`; `glGroup`: `string` &#124; `null`; `glNumber`: `string` &#124; `null`; `glType`: `string` &#124; `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the journal parameter or NotFoundError

##### getCurrencyOptions()

> **getCurrencyOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Currency options

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getDbCrOptions()

> **getDbCrOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Debit/Credit options

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getGlGroupOptions()

> **getGlGroupOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get GL Group options

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getJournalCodeOptions()

> **getJournalCodeOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Journal Code options

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getJournalTypeOptions()

> **getJournalTypeOptions**: () => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get Journal Type options

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### getOptions()

> **getOptions**: (`paramCode`) => `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get dropdown options for a specific parameter code (internal helper).

###### Parameters

###### paramCode

`string`

###### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### list()

> **list**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

List all journal parameters.

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of journal parameters

##### update()

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
