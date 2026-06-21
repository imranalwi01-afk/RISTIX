[**Backend API Reference v1.0.0**](index.md)

***

# routes/product-parameters.routes

## Variables

### ProductModeSchema

> `const` **ProductModeSchema**: `ZodEnum`{`<`}\[`"conventional"`, `"sharia"`\]{`>`}

Defined in: [src/routes/product-parameters.routes.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L19)

***

### productParameterRoutes

> `const` **productParameterRoutes**: `OpenAPIHono`{`<`}[`AppContext`](app.md#appcontext), {`{`} {`}`}, `"/"`{`>`} = `app`

Defined in: [src/routes/product-parameters.routes.ts:339](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L339)

***

### ProductParamSchema

> `const` **ProductParamSchema**: `ZodObject`{`<`}{`{`} `activeFlag`: `ZodDefault`{`<`}`ZodBoolean`{`>`}; `alFlag`: `ZodOptional`{`<`}`ZodString`{`>`}; `amortizationType`: `ZodOptional`{`<`}`ZodString`{`>`}; `bmFlag`: `ZodOptional`{`<`}`ZodBoolean`{`>`}; `borrowingRate`: `ZodOptional`{`<`}`ZodNumber`{`>`}; `createdby`: `ZodDefault`{`<`}`ZodString`{`>`}; `currency`: `ZodString`; `dataSource`: `ZodString`; `expectedLife`: `ZodOptional`{`<`}`ZodNumber`{`>`}; `impairedFlag`: `ZodOptional`{`<`}`ZodBoolean`{`>`}; `marketRate`: `ZodOptional`{`<`}`ZodNumber`{`>`}; `mode`: `ZodOptional`{`<`}`ZodEnum`{`<`}\[`"conventional"`, `"sharia"`\]{`>`}{`>`}; `prdCode`: `ZodString`; `prdDesc`: `ZodString`; `prdGroup`: `ZodString`; `prdType`: `ZodString`; {`}`}, `"strip"`, `ZodTypeAny`, {`{`} `activeFlag`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` {`|`} `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; {`}`}, {`{`} `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` {`|`} `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; {`}`}{`>`}

Defined in: [src/routes/product-parameters.routes.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L21)

***

### UpdateProductParamSchema

> `const` **UpdateProductParamSchema**: `ZodObject`{`<`}{`{`} `activeFlag`: `ZodOptional`{`<`}`ZodDefault`{`<`}`ZodBoolean`{`>`}{`>`}; `alFlag`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodString`{`>`}{`>`}; `amortizationType`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodString`{`>`}{`>`}; `bmFlag`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodBoolean`{`>`}{`>`}; `borrowingRate`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodNumber`{`>`}{`>`}; `createdby`: `ZodOptional`{`<`}`ZodDefault`{`<`}`ZodString`{`>`}{`>`}; `currency`: `ZodOptional`{`<`}`ZodString`{`>`}; `dataSource`: `ZodOptional`{`<`}`ZodString`{`>`}; `expectedLife`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodNumber`{`>`}{`>`}; `impairedFlag`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodBoolean`{`>`}{`>`}; `marketRate`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodNumber`{`>`}{`>`}; `mode`: `ZodOptional`{`<`}`ZodOptional`{`<`}`ZodEnum`{`<`}\[`"conventional"`, `"sharia"`\]{`>`}{`>`}{`>`}; `prdCode`: `ZodOptional`{`<`}`ZodString`{`>`}; `prdDesc`: `ZodOptional`{`<`}`ZodString`{`>`}; `prdGroup`: `ZodOptional`{`<`}`ZodString`{`>`}; `prdType`: `ZodOptional`{`<`}`ZodString`{`>`}; {`}`}, `"strip"`, `ZodTypeAny`, {`{`} `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` {`|`} `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; {`}`}, {`{`} `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` {`|`} `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; {`}`}{`>`}

Defined in: [src/routes/product-parameters.routes.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L40)
