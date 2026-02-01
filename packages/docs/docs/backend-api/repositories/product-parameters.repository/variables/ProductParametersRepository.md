[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: ProductParametersRepository

> `const` **ProductParametersRepository**: `object`

Defined in: [packages/new-backend/src/repositories/product-parameters.repository.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/product-parameters.repository.ts#L7)

## Type Declaration

### create()

> **create**: (`data`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Create a new product parameter.

#### Parameters

##### data

The product parameter data

###### activeFlag

`boolean`

###### alFlag?

`string` \| `null`

###### amortizationType?

`string` \| `null`

###### bmFlag?

`boolean` \| `null`

###### borrowingRate?

`number` \| `null`

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

`number` \| `null`

###### impairedFlag?

`boolean` \| `null`

###### marketRate?

`number` \| `null`

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

`string` \| `null`

###### updateddate?

`string` \| `null`

###### updatedhost?

`string` \| `null`

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the created product parameter

### delete()

> **delete**: (`id`) => `Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Delete a product parameter.

#### Parameters

##### id

`bigint`

The product parameter ID

#### Returns

`Effect`\<`boolean`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to true on success

### findAll()

> **findAll**: () => `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find all product parameters.

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to an array of product parameters

### findById()

> **findById**: (`id`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Find a product parameter by ID.

#### Parameters

##### id

`bigint`

The product parameter ID

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the product parameter or null

### update()

> **update**: (`id`, `data`) => `Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

Update an existing product parameter.

#### Parameters

##### id

`bigint`

The product parameter ID

##### data

`Partial`\<*typeof* `frs9ParamProduct.$inferInsert`\>

The data to update

#### Returns

`Effect`\<\{ `activeFlag`: `boolean`; `alFlag`: `string` \| `null`; `amortizationType`: `string` \| `null`; `bmFlag`: `boolean` \| `null`; `borrowingRate`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife`: `number` \| `null`; `impairedFlag`: `boolean` \| `null`; `marketRate`: `number` \| `null`; `pkid`: `number`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md), `never`\>

An Effect resolving to the updated product parameter or null
