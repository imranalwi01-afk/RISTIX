[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: JournalParametersRepository

> `const` **JournalParametersRepository**: `object`

Defined in: [src/repositories/journal-parameters.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/journal-parameters.repository.ts#L7)

## Type Declaration

### create()

> **create**: (`data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new journal parameter.

#### Parameters

##### data

The journal parameter data

###### activeFlag?

`boolean` \| `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### currency?

`string` \| `null`

###### dbcr?

`string` \| `null`

###### glCode?

`string` \| `null`

###### glDesc?

`string` \| `null`

###### glGroup?

`string` \| `null`

###### glNumber?

`string` \| `null`

###### glType?

`string` \| `null`

###### pkid?

`number`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created journal parameter

### delete()

> **delete**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a journal parameter.

#### Parameters

##### id

`bigint`

The journal parameter ID

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to true if deleted, false otherwise

### findAll()

> **findAll**: () => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find all journal parameters.

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of journal parameters

### findById()

> **findById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find a journal parameter by ID.

#### Parameters

##### id

`bigint`

The journal parameter ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the journal parameter or null

### update()

> **update**: (`id`, `data`) => `Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing journal parameter.

#### Parameters

##### id

`bigint`

The journal parameter ID

##### data

`Partial`\<*typeof* `frs9ParamJournal.$inferInsert`\>

The data to update

#### Returns

`Effect`\<\{ `activeFlag`: `boolean` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string` \| `null`; `dbcr`: `string` \| `null`; `glCode`: `string` \| `null`; `glDesc`: `string` \| `null`; `glGroup`: `string` \| `null`; `glNumber`: `string` \| `null`; `glType`: `string` \| `null`; `pkid`: `number`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated journal parameter or null
