[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: ProductParametersService

> `const` **ProductParametersService**: `object`

Defined in: [src/services/product-parameters.service.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/product-parameters.service.ts#L6)

## Type Declaration

### create()

> **create**: (`data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, `any`, `never`\>

Create a new product parameter.

#### Parameters

##### data

`any`

The product parameter data

##### userId

`string`

The ID of the user creating the parameter

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, `any`, `never`\>

An Effect resolving to the created product parameter

### delete()

> **delete**: (`id`) => `Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Delete a product parameter.

#### Parameters

##### id

`number`

The product parameter ID

#### Returns

`Effect`\<\{ `message`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to a success message or NotFoundError

### get()

> **get**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Get a product parameter by ID.

#### Parameters

##### id

`number`

The product parameter ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the product parameter or NotFoundError

### getInstrumentClassOptions()

> **getInstrumentClassOptions**: () => `Effect`\<`object`[], `never`, `never`\>

Get instrument class options.

#### Returns

`Effect`\<`object`[], `never`, `never`\>

### list()

> **list**: (`mode`, `options`) => `Effect`\<\{ `pagination`: \{ `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; \}; `products`: `object`[]; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

List product parameters filtered by mode with pagination.

#### Parameters

##### mode

`string`

The product mode (conventional | sharia)

##### options

Pagination and search options

###### limit

`number`

###### page

`number`

###### search?

`string`

#### Returns

`Effect`\<\{ `pagination`: \{ `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; \}; `products`: `object`[]; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to products and pagination metadata

### update()

> **update**: (`id`, `data`, `userId`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

Update an existing product parameter.

#### Parameters

##### id

`number`

The product parameter ID

##### data

`any`

The data to update

##### userId

`string`

The ID of the user updating the parameter

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string` \| `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `id`: `number`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md), `never`\>

An Effect resolving to the updated product parameter or NotFoundError
