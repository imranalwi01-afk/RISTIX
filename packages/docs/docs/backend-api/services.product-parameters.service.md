[**Backend API Reference v1.0.0**](index.md)

***

# services/product-parameters.service

## Variables

### ProductParametersService

> `const` **ProductParametersService**: `object`

Defined in: [src/services/product-parameters.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/product-parameters.service.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`, `userId`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, `any`, `never`&gt;

Create a new product parameter.

###### Parameters

###### data

`any`

The product parameter data

###### userId

`string`

The ID of the user creating the parameter

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, `any`, `never`&gt;

An Effect resolving to the created product parameter

##### delete()

> **delete**: (`id`) => `Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Delete a product parameter.

###### Parameters

###### id

`number`

The product parameter ID

###### Returns

`Effect`&lt;&#123; `message`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to a success message or NotFoundError

##### get()

> **get**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Get a product parameter by ID.

###### Parameters

###### id

`number`

The product parameter ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the product parameter or NotFoundError

##### getInstrumentClassOptions()

> **getInstrumentClassOptions**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Get instrument class options (AL_FLAG field).
Dynamically sourced from Business Setting B0003 in FRS9_PARAM_COMMOND.
Per tech spec: AL_FLAG = Combo Box (Business Setting 'B0003')

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### list()

> **list**: (`mode`, `options`) => `Effect`&lt;&#123; `pagination`: &#123; `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; &#125;; `products`: `object`[]; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

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

`Effect`&lt;&#123; `pagination`: &#123; `limit`: `number`; `page`: `number`; `pages`: `number`; `total`: `number`; &#125;; `products`: `object`[]; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to products and pagination metadata

##### update()

> **update**: (`id`, `data`, `userId`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

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

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `id`: `number`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the updated product parameter or NotFoundError
