[**Backend API Reference v1.0.0**](index.md)

***

# services/product-parameters.service

## Variables

### ProductParametersService

> `const` **ProductParametersService**: `object`

Defined in: [src/services/product-parameters.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/product-parameters.service.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, `any`, `never`\>

Create a new product parameter.

###### Parameters

###### data

`any`

The product parameter data

###### userId

`string`

The ID of the user creating the parameter

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, `any`, `never`\>

An Effect resolving to the created product parameter

##### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

Delete a product parameter.

###### Parameters

###### id

`number`

The product parameter ID

###### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

An Effect resolving to a success message or NotFoundError

##### get()

> **get**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

Get a product parameter by ID.

###### Parameters

###### id

`number`

The product parameter ID

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

An Effect resolving to the product parameter or NotFoundError

##### getInstrumentClassOptions()

> **getInstrumentClassOptions**: () => `Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

Get instrument class options (AL_FLAG field).
Dynamically sourced from Business Setting B0003 in FRS9_PARAM_COMMOND.
Per tech spec: AL_FLAG = Combo Box (Business Setting 'B0003')

###### Returns

`Effect`\<`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

##### list()

> **list**: (`mode`, `options`) => `Effect`\<\{ `pagination`: \{ `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; \}; `products`: `object`[]; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

List product parameters filtered by mode with pagination.

###### Parameters

###### mode

`string`

The product mode (conventional | sharia)

###### options

Pagination and search options

###### limit

`number`

###### page

`number`

###### search?

`string`

###### Returns

`Effect`\<\{ `pagination`: \{ `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; \}; `products`: `object`[]; \}, [`DatabaseError`](lib.errors.md#databaseerror), `never`\>

An Effect resolving to products and pagination metadata

##### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

Update an existing product parameter.

###### Parameters

###### id

`number`

The product parameter ID

###### data

`any`

The data to update

###### userId

`string`

The ID of the user updating the parameter

###### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror), `never`\>

An Effect resolving to the updated product parameter or NotFoundError
