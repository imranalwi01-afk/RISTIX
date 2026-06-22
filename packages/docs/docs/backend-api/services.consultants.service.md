[**Backend API Reference v1.0.0**](index.md)

***

# services/consultants.service

## Functions

### createConsultant()

> **createConsultant**(`data`): `Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/consultants.service.ts:93](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/consultants.service.ts#L93)

Create new consultant.

#### Parameters

##### data

The consultant data

###### createdAt?

`Date`

###### email

`string`

###### endDate?

`string` &#124; `null`

###### firmName?

`string` &#124; `null`

###### fullName

`string`

###### id?

`string`

###### isActive?

`boolean` &#124; `null`

###### notes?

`string` &#124; `null`

###### specialization?

`string` &#124; `null`

###### startDate?

`string` &#124; `null`

###### status?

`string` &#124; `null`

###### updatedAt?

`Date`

#### Returns

`Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created consultant record

***

### deleteConsultant()

> **deleteConsultant**(`id`): `Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/consultants.service.ts:136](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/consultants.service.ts#L136)

Delete consultant.

#### Parameters

##### id

`string`

The consultant ID

#### Returns

`Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the deleted consultant record or NotFoundError

***

### getConsultantById()

> **getConsultantById**(`id`): `Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/consultants.service.ts:72](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/consultants.service.ts#L72)

Get consultant by ID.

#### Parameters

##### id

`string`

The consultant ID

#### Returns

`Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the consultant record or NotFoundError

***

### getConsultants()

> **getConsultants**(`options`): `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/consultants.service.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/consultants.service.ts#L21)

Get all consultants with pagination and filtering.

#### Parameters

##### options

Pagination and filtering options

###### limit

`number`

Number of records to return

###### offset

`number`

Number of records to skip

###### search?

`string`

Search term for full name or firm name

###### status?

`string`

Filter by consultant status

#### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an object with data array and total count

***

### updateConsultant()

> **updateConsultant**(`id`, `data`): `Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/consultants.service.ts:109](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/consultants.service.ts#L109)

Update consultant.

#### Parameters

##### id

`string`

The consultant ID

##### data

`Partial`&lt;[`NewConsultant`](db.schema.consultants.schema.md#newconsultant)&gt;

The data to update

#### Returns

`Effect`&lt;&#123; `createdAt`: `Date`; `email`: `string`; `endDate`: `string` &#124; `null`; `firmName`: `string` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `notes`: `string` &#124; `null`; `specialization`: `string` &#124; `null`; `startDate`: `string` &#124; `null`; `status`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated consultant record or NotFoundError
