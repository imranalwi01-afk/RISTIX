[**Backend API Reference v1.0.0**](index.md)

***

# routes/product-parameters.routes

## Variables

### ProductModeSchema

> `const` **ProductModeSchema**: `ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;

Defined in: [src/routes/product-parameters.routes.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L19)

***

### productParameterRoutes

> `const` **productParameterRoutes**: `OpenAPIHono`&lt;[`AppContext`](app.md#appcontext), &#123; &#125;, `"/"`&gt; = `app`

Defined in: [src/routes/product-parameters.routes.ts:339](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L339)

***

### ProductParamSchema

> `const` **ProductParamSchema**: `ZodObject`&lt;&#123; `activeFlag`: `ZodDefault`&lt;`ZodBoolean`&gt;; `alFlag`: `ZodOptional`&lt;`ZodString`&gt;; `amortizationType`: `ZodOptional`&lt;`ZodString`&gt;; `bmFlag`: `ZodOptional`&lt;`ZodBoolean`&gt;; `borrowingRate`: `ZodOptional`&lt;`ZodNumber`&gt;; `createdby`: `ZodDefault`&lt;`ZodString`&gt;; `currency`: `ZodString`; `dataSource`: `ZodString`; `expectedLife`: `ZodOptional`&lt;`ZodNumber`&gt;; `impairedFlag`: `ZodOptional`&lt;`ZodBoolean`&gt;; `marketRate`: `ZodOptional`&lt;`ZodNumber`&gt;; `mode`: `ZodOptional`&lt;`ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;&gt;; `prdCode`: `ZodString`; `prdDesc`: `ZodString`; `prdGroup`: `ZodString`; `prdType`: `ZodString`; &#125;, `"strip"`, `ZodTypeAny`, &#123; `activeFlag`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; &#125;, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency`: `string`; `dataSource`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; &#125;&gt;

Defined in: [src/routes/product-parameters.routes.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L21)

***

### UpdateProductParamSchema

> `const` **UpdateProductParamSchema**: `ZodObject`&lt;&#123; `activeFlag`: `ZodOptional`&lt;`ZodDefault`&lt;`ZodBoolean`&gt;&gt;; `alFlag`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodString`&gt;&gt;; `amortizationType`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodString`&gt;&gt;; `bmFlag`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodBoolean`&gt;&gt;; `borrowingRate`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodNumber`&gt;&gt;; `createdby`: `ZodOptional`&lt;`ZodDefault`&lt;`ZodString`&gt;&gt;; `currency`: `ZodOptional`&lt;`ZodString`&gt;; `dataSource`: `ZodOptional`&lt;`ZodString`&gt;; `expectedLife`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodNumber`&gt;&gt;; `impairedFlag`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodBoolean`&gt;&gt;; `marketRate`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodNumber`&gt;&gt;; `mode`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;&gt;&gt;; `prdCode`: `ZodOptional`&lt;`ZodString`&gt;; `prdDesc`: `ZodOptional`&lt;`ZodString`&gt;; `prdGroup`: `ZodOptional`&lt;`ZodString`&gt;; `prdType`: `ZodOptional`&lt;`ZodString`&gt;; &#125;, `"strip"`, `ZodTypeAny`, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; &#125;, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `bmFlag?`: `boolean`; `borrowingRate?`: `number`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `expectedLife?`: `number`; `impairedFlag?`: `boolean`; `marketRate?`: `number`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; &#125;&gt;

Defined in: [src/routes/product-parameters.routes.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/routes/product-parameters.routes.ts#L40)
