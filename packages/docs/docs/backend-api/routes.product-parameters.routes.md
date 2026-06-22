[**Backend API Reference v1.0.0**](index.md)

***

# routes/product-parameters.routes

## Variables

### ProductModeSchema

> `const` **ProductModeSchema**: `ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;

Defined in: [src/routes/product-parameters.routes.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/routes/product-parameters.routes.ts#L21)

***

### productParameterRoutes

> `const` **productParameterRoutes**: `OpenAPIHono`&lt;[`AppContext`](app.md#appcontext), &#123; &#125;, `"/"`&gt; = `app`

Defined in: [src/routes/product-parameters.routes.ts:442](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/routes/product-parameters.routes.ts#L442)

***

### ProductParamSchema

> `const` **ProductParamSchema**: `ZodObject`&lt;&#123; `activeFlag`: `ZodDefault`&lt;`ZodBoolean`&gt;; `alFlag`: `ZodOptional`&lt;`ZodString`&gt;; `amortizationType`: `ZodOptional`&lt;`ZodString`&gt;; `createdby`: `ZodDefault`&lt;`ZodString`&gt;; `currency`: `ZodString`; `dataSource`: `ZodString`; `impairedFlag`: `ZodOptional`&lt;`ZodBoolean`&gt;; `mode`: `ZodOptional`&lt;`ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;&gt;; `prdCode`: `ZodString`; `prdDesc`: `ZodString`; `prdGroup`: `ZodString`; `prdType`: `ZodString`; &#125;, `"strip"`, `ZodTypeAny`, &#123; `activeFlag`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `createdby`: `string`; `currency`: `string`; `dataSource`: `string`; `impairedFlag?`: `boolean`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; &#125;, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `createdby?`: `string`; `currency`: `string`; `dataSource`: `string`; `impairedFlag?`: `boolean`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode`: `string`; `prdDesc`: `string`; `prdGroup`: `string`; `prdType`: `string`; &#125;&gt;

Defined in: [src/routes/product-parameters.routes.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/routes/product-parameters.routes.ts#L23)

***

### UpdateProductParamSchema

> `const` **UpdateProductParamSchema**: `ZodObject`&lt;&#123; `activeFlag`: `ZodOptional`&lt;`ZodDefault`&lt;`ZodBoolean`&gt;&gt;; `alFlag`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodString`&gt;&gt;; `amortizationType`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodString`&gt;&gt;; `createdby`: `ZodOptional`&lt;`ZodDefault`&lt;`ZodString`&gt;&gt;; `currency`: `ZodOptional`&lt;`ZodString`&gt;; `dataSource`: `ZodOptional`&lt;`ZodString`&gt;; `impairedFlag`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodBoolean`&gt;&gt;; `mode`: `ZodOptional`&lt;`ZodOptional`&lt;`ZodEnum`&lt;\[`"conventional"`, `"sharia"`\]&gt;&gt;&gt;; `prdCode`: `ZodOptional`&lt;`ZodString`&gt;; `prdDesc`: `ZodOptional`&lt;`ZodString`&gt;; `prdGroup`: `ZodOptional`&lt;`ZodString`&gt;; `prdType`: `ZodOptional`&lt;`ZodString`&gt;; &#125;, `"strip"`, `ZodTypeAny`, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `impairedFlag?`: `boolean`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; &#125;, &#123; `activeFlag?`: `boolean`; `alFlag?`: `string`; `amortizationType?`: `string`; `createdby?`: `string`; `currency?`: `string`; `dataSource?`: `string`; `impairedFlag?`: `boolean`; `mode?`: `"conventional"` &#124; `"sharia"`; `prdCode?`: `string`; `prdDesc?`: `string`; `prdGroup?`: `string`; `prdType?`: `string`; &#125;&gt;

Defined in: [src/routes/product-parameters.routes.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/routes/product-parameters.routes.ts#L38)
