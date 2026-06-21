[**Backend API Reference v1.0.0**](index.md)

***

# repositories/product-parameters.repository

## Variables

### ProductParametersRepository

> `const` **ProductParametersRepository**: `object`

Defined in: [src/repositories/product-parameters.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/product-parameters.repository.ts#L7)

#### Type Declaration

##### create()

> **create**: (`data`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Create a new product parameter.

###### Parameters

###### data

The product parameter data

###### activeFlag

`boolean`

###### alFlag?

`string` &#124; `null`

###### amortizationType?

`string` &#124; `null`

###### bmFlag?

`boolean` &#124; `null`

###### borrowingRate?

`number` &#124; `null`

###### createdby

`string`

###### createddate

`string`

###### createdhost

`string`

###### currency

`string`

###### dataSource

`string`

###### expectedLife?

`number` &#124; `null`

###### impairedFlag?

`boolean` &#124; `null`

###### marketRate?

`number` &#124; `null`

###### pkid?

`number`

###### prdCode

`string`

###### prdDesc

`string`

###### prdGroup

`string`

###### prdType

`string`

###### updatedby?

`string` &#124; `null`

###### updateddate?

`string` &#124; `null`

###### updatedhost?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the created product parameter

##### delete()

> **delete**: (`id`) => `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Delete a product parameter.

###### Parameters

###### id

`bigint`

The product parameter ID

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to true on success

##### findAll()

> **findAll**: () => `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

##### findByCode()

> **findByCode**: (`prdCode`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a product parameter by its code.

###### Parameters

###### prdCode

`string`

The product code

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the product parameter or null

##### findById()

> **findById**: (`id`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find a product parameter by ID.

###### Parameters

###### id

`bigint`

The product parameter ID

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the product parameter or null

##### findMany()

> **findMany**: (`options`) => `Effect`&lt;&#123; `products`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Find product parameters with pagination and search.

###### Parameters

###### options

Pagination and search options

###### limit

`number`

###### page

`number`

###### search?

`string`

###### Returns

`Effect`&lt;&#123; `products`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to an array of product parameters and the total count

##### update()

> **update**: (`id`, `data`) => `Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Update an existing product parameter.

###### Parameters

###### id

`bigint`

The product parameter ID

###### data

`Partial`&lt;*typeof* `frs9ParamProduct.$inferInsert`&gt;

The data to update

###### Returns

`Effect`&lt;&#123; `activeFlag`: `boolean`; `alFlag`: `string` &#124; `null`; `amortizationType`: `string` &#124; `null`; `bmFlag`: `boolean` &#124; `null`; `borrowingRate`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` &#124; `null`; `impairedFlag`: `boolean` &#124; `null`; `marketRate`: `number` &#124; `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the updated product parameter or null
