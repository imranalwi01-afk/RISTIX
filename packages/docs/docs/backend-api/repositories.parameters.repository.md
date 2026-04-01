[**Backend API Reference v1.0.0**](index.md)

***

# repositories/parameters.repository

## Variables

### ParametersRepository

> `const` **ParametersRepository**: `object`

Defined in: [src/repositories/parameters.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/parameters.repository.ts#L10)

Repository for accessing Parameters data (App Settings and Business Settings).

#### Type Declaration

##### createDetail()

> **createDetail**: (`data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Create a new parameter detail.

###### Parameters

###### data

The data for the new detail

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### paramCode

`string`

###### paramdesc?

`string` \| `null`

###### paramSeq

`number`

###### pkid?

`bigint`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

###### value1

`string`

###### value2

`string`

###### value3

`string`

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the created detail

##### createHeader()

> **createHeader**: (`data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Create a new parameter header.

###### Parameters

###### data

The data for the new header

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### paramCode?

`string` \| `null`

###### paramName?

`string` \| `null`

###### paramType?

`string` \| `null`

###### paramUsage?

`string` \| `null`

###### pkid?

`bigint`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the created header

##### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Delete a parameter detail.

###### Parameters

###### id

`bigint`

The ID of the detail

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the deleted detail

##### deleteHeader()

> **deleteHeader**: (`code`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Delete a parameter header and its details.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the deleted header

##### findByFilters()

> **findByFilters**: (`code`, `filters`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find parameter details by filters.

###### Parameters

###### code

`string`

The parameter code

###### filters

`Record`\<`string`, `any`\>

The filters to apply (value1, value2, value3)

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of details

##### findDetailByCode()

> **findDetailByCode**: (`code`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find details for a specific parameter code.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of details

##### findDetailBySeq()

> **findDetailBySeq**: (`code`, `seq`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find a specific detail by paramCode and paramSeq.
Used for duplicate sequence validation.

###### Parameters

###### code

`string`

The parameter code

###### seq

`number`

The sequence number

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the detail or null

##### findDetailByValues()

> **findDetailByValues**: (`code`, `value1`, `value2`, `value3`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find a specific detail by paramCode and values.
Used for duplicate record validation in Business Setup.

###### Parameters

###### code

`string`

The parameter code

###### value1

`string`

Value 1

###### value2

`string`

Value 2

###### value3

`string`

Value 3

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the detail or null

##### findDistinct()

> **findDistinct**: (`code`, `field`, `filters?`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find distinct values for a field.

###### Parameters

###### code

`string`

The parameter code

###### field

The field to select distinct values from

`"pkid"` | `"createdby"` | `"createddate"` | `"createdhost"` | `"updatedby"` | `"updateddate"` | `"updatedhost"` | `"paramCode"` | `"paramSeq"` | `"value1"` | `"value2"` | `"value3"` | `"paramdesc"`

###### filters?

`Record`\<`string`, `any`\>

Optional additional filters

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of distinct values

##### findHeaderByCode()

> **findHeaderByCode**: (`code`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find a single header by its unique code.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the header or null

##### findHeaders()

> **findHeaders**: (`paramType`, `code?`) => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Find parameter headers.

###### Parameters

###### paramType

The type of parameter ('S' for System, 'B' for Business)

`string` | `string`[]

###### code?

`string`

Optional parameter code to filter by

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to an array of headers

##### updateDetail()

> **updateDetail**: (`id`, `data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Update an existing parameter detail.

###### Parameters

###### id

The ID of the detail

`number` | `bigint`

###### data

`Partial`\<`InferInsertModel`\<*typeof* [`frs9ParamCommond`](db.schema.md#frs9paramcommond)\>\>

The data to update

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` \| `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the updated detail

##### updateHeader()

> **updateHeader**: (`code`, `data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Update an existing parameter header.

###### Parameters

###### code

`string`

The parameter code

###### data

`Partial`\<`InferInsertModel`\<*typeof* [`frs9ParamCommonh`](db.schema.md#frs9paramcommonh)\>\>

The data to update

###### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to the updated header
