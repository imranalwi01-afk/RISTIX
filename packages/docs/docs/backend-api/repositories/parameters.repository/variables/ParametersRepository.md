[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: ParametersRepository

> `const` **ParametersRepository**: `object`

Defined in: [packages/new-backend/src/repositories/parameters.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/parameters.repository.ts#L10)

Repository for accessing Parameters data (App Settings and Business Settings).

## Type Declaration

### createDetail()

> **createDetail**: (`data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new parameter detail.

#### Parameters

##### data

The data for the new detail

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### paramCode

`string`

###### paramdesc

`string`

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

#### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created detail

### createHeader()

> **createHeader**: (`data`) => `Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new parameter header.

#### Parameters

##### data

The data for the new header

###### bankingType?

`string` \| `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### isActive?

`boolean` \| `null`

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

###### requiresApproval?

`boolean` \| `null`

###### updatedby?

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

#### Returns

`Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created header

### deleteDetail()

> **deleteDetail**: (`id`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a parameter detail.

#### Parameters

##### id

`bigint`

The ID of the detail

#### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the deleted detail

### deleteHeader()

> **deleteHeader**: (`code`) => `Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a parameter header and its details.

#### Parameters

##### code

`string`

The parameter code

#### Returns

`Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the deleted header

### findByFilters()

> **findByFilters**: (`code`, `filters`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find parameter details by filters.

#### Parameters

##### code

`string`

The parameter code

##### filters

`Record`\<`string`, `any`\>

The filters to apply (value1, value2, value3)

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of details

### findDetailByCode()

> **findDetailByCode**: (`code`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find details for a specific parameter code.

#### Parameters

##### code

`string`

The parameter code

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of details

### findDistinct()

> **findDistinct**: (`code`, `field`, `filters?`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find distinct values for a field.

#### Parameters

##### code

`string`

The parameter code

##### field

The field to select distinct values from

`"pkid"` | `"createdby"` | `"createddate"` | `"createdhost"` | `"updatedby"` | `"updateddate"` | `"updatedhost"` | `"paramCode"` | `"paramSeq"` | `"value1"` | `"value2"` | `"value3"` | `"paramdesc"`

##### filters?

`Record`\<`string`, `any`\>

Optional additional filters

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of distinct values

### findHeaderByCode()

> **findHeaderByCode**: (`code`) => `Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find a single header by its unique code.

#### Parameters

##### code

`string`

The parameter code

#### Returns

`Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the header or null

### findHeaders()

> **findHeaders**: (`paramType`, `code?`) => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find parameter headers.

#### Parameters

##### paramType

The type of parameter ('S' for System, 'B' for Business)

`string` | `string`[]

##### code?

`string`

Optional parameter code to filter by

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of headers

### updateDetail()

> **updateDetail**: (`id`, `data`) => `Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing parameter detail.

#### Parameters

##### id

The ID of the detail

`number` | `bigint`

##### data

`Partial`\<`InferInsertModel`\<*typeof* [`frs9ParamCommond`](../../../db/schema/variables/frs9ParamCommond.md)\>\>

The data to update

#### Returns

`Effect`\<\{ `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated detail

### updateHeader()

> **updateHeader**: (`code`, `data`) => `Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing parameter header.

#### Parameters

##### code

`string`

The parameter code

##### data

`Partial`\<`InferInsertModel`\<*typeof* [`frs9ParamCommonh`](../../../db/schema/variables/frs9ParamCommonh.md)\>\>

The data to update

#### Returns

`Effect`\<\{ `bankingType`: `string` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `isActive`: `boolean` \| `null`; `paramCode`: `string` \| `null`; `paramName`: `string` \| `null`; `paramType`: `string` \| `null`; `paramUsage`: `string` \| `null`; `pkid`: `bigint`; `requiresApproval`: `boolean` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated header
