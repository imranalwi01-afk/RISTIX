[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: JournalParametersService

> `const` **JournalParametersService**: `object`

Defined in: [src/services/journal-parameters.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/journal-parameters.service.ts#L7)

## Type Declaration

### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new journal parameter.

#### Parameters

##### data

`any`

The journal parameter data

##### userId

`string`

The ID of the user creating the parameter

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created journal parameter

### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Delete a journal parameter.

#### Parameters

##### id

`number`

The journal parameter ID

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to a success message or NotFoundError

### get()

> **get**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Get a journal parameter by ID.

#### Parameters

##### id

`number`

The journal parameter ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the journal parameter or NotFoundError

### getCurrencyOptions()

> **getCurrencyOptions**: () => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get Currency options

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### getDbCrOptions()

> **getDbCrOptions**: () => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get Debit/Credit options

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### getGlGroupOptions()

> **getGlGroupOptions**: () => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get GL Group options

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### getJournalCodeOptions()

> **getJournalCodeOptions**: () => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get Journal Code options

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### getJournalTypeOptions()

> **getJournalTypeOptions**: () => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get Journal Type options

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### getOptions()

> **getOptions**: (`paramCode`) => `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Get dropdown options for a specific parameter code (internal helper).

#### Parameters

##### paramCode

`string`

#### Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

### list()

> **list**: () => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List all journal parameters.

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of journal parameters

### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing journal parameter.

#### Parameters

##### id

`number`

The journal parameter ID

##### data

`any`

The data to update

##### userId

`string`

The ID of the user updating the parameter

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `id`: `number`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the updated journal parameter or NotFoundError
