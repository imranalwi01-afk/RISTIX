[**Backend API Reference v1.0.0**](index.md)

***

# repositories/parameters.repository

## Variables

### ParametersRepository

> `const` **ParametersRepository**: `object`

Defined in: [src/repositories/parameters.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/repositories/parameters.repository.ts#L10)

Repository for accessing Parameters data (App Settings and Business Settings).

#### Type Declaration

##### createDetail

> **createDetail**: (`data`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`string` &#124; `null`

###### paramSeq

`number`

###### pkid?

`bigint`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### value1

`string`

###### value2

`string`

###### value3

`string`

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created detail

##### createHeader

> **createHeader**: (`data`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`string` &#124; `null`

###### paramName?

`string` &#124; `null`

###### paramType?

`string` &#124; `null`

###### paramUsage?

`string` &#124; `null`

###### pkid?

`bigint`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created header

##### deleteDetail

> **deleteDetail**: (`id`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a parameter detail.

###### Parameters

###### id

`bigint`

The ID of the detail

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the deleted detail

##### deleteHeader

> **deleteHeader**: (`code`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a parameter header and its details.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the deleted header

##### findByFilters

> **findByFilters**: (`code`, `filters`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find parameter details by filters.

###### Parameters

###### code

`string`

The parameter code

###### filters

`Record`&lt;`string`, `any`&gt;

The filters to apply (value1, value2, value3)

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of details

##### findDetailByCode

> **findDetailByCode**: (`code`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find details for a specific parameter code.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of details

##### findDetailBySeq

> **findDetailBySeq**: (`code`, `seq`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the detail or null

##### findDetailByValues

> **findDetailByValues**: (`code`, `value1`, `value2`, `value3`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the detail or null

##### findDistinct

> **findDistinct**: (`code`, `field`, `filters?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find distinct values for a field.

###### Parameters

###### code

`string`

The parameter code

###### field

`"pkid"` &#124; `"createdby"` &#124; `"createddate"` &#124; `"createdhost"` &#124; `"updatedby"` &#124; `"updateddate"` &#124; `"updatedhost"` &#124; `"paramCode"` &#124; `"paramSeq"` &#124; `"value1"` &#124; `"value2"` &#124; `"value3"` &#124; `"paramdesc"`

The field to select distinct values from

###### filters?

`Record`&lt;`string`, `any`&gt;

Optional additional filters

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of distinct values

##### findHeaderByCode

> **findHeaderByCode**: (`code`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a single header by its unique code.

###### Parameters

###### code

`string`

The parameter code

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `details`: `object`[]; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the header or null

##### findHeaders

> **findHeaders**: (`paramType`, `code?`) => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find parameter headers.

###### Parameters

###### paramType

`string` &#124; `string`[]

The type of parameter ('S' for System, 'B' for Business)

###### code?

`string`

Optional parameter code to filter by

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of headers

##### findHeadersPage

> **findHeadersPage**: (`paramType`, `options`) => `Effect`&lt;&#123; `rows`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Parameters

###### paramType

`string` &#124; `string`[]

###### options

###### code?

`string`

###### filters?

`Record`&lt;`string`, `string` &#124; `number` &#124; `boolean` &#124; `string`[]&gt;

###### limit

`number`

###### offset

`number`

###### search?

`string`

###### sort?

`object`[]

###### Returns

`Effect`&lt;&#123; `rows`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### updateDetail

> **updateDetail**: (`id`, `data`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing parameter detail.

###### Parameters

###### id

`number` &#124; `bigint`

The ID of the detail

###### data

`Partial`&lt;`InferInsertModel`&lt;*typeof* [`frs9ParamCommond`](db.schema.md#frs9paramcommond)&gt;&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string`; `paramdesc`: `string` &#124; `null`; `paramSeq`: `number`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; `value1`: `string`; `value2`: `string`; `value3`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated detail

##### updateHeader

> **updateHeader**: (`code`, `data`) => `Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing parameter header.

###### Parameters

###### code

`string`

The parameter code

###### data

`Partial`&lt;`InferInsertModel`&lt;*typeof* [`frs9ParamCommonh`](db.schema.md#frs9paramcommonh)&gt;&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `paramCode`: `string` &#124; `null`; `paramName`: `string` &#124; `null`; `paramType`: `string` &#124; `null`; `paramUsage`: `string` &#124; `null`; `pkid`: `bigint`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated header
