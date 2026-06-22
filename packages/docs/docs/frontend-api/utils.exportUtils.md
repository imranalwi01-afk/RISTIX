[**Frontend API Reference v1.0.0**](index.md)

***

# utils/exportUtils

## Interfaces

### ExportOptions

Defined in: [utils/exportUtils.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L8)

#### Properties

##### confidential?

> `optional` **confidential**: `boolean`

Defined in: [utils/exportUtils.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L15)

##### exportedBy?

> `optional` **exportedBy**: `string`

Defined in: [utils/exportUtils.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L12)

##### filename?

> `optional` **filename**: `string`

Defined in: [utils/exportUtils.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L9)

##### filters?

> `optional` **filters**: `Record`&lt;`string`, `any`&gt;

Defined in: [utils/exportUtils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L13)

##### modelVersion?

> `optional` **modelVersion**: `string`

Defined in: [utils/exportUtils.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L14)

##### subtitle?

> `optional` **subtitle**: `string`

Defined in: [utils/exportUtils.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L11)

##### title?

> `optional` **title**: `string`

Defined in: [utils/exportUtils.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L10)

## Functions

### exportToCSV()

> **exportToCSV**&lt;`T`&gt;(`data`, `columns`, `options?`): &#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

Defined in: [utils/exportUtils.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L106)

Export to CSV

#### Type Parameters

##### T

`T` *extends* `Record`&lt;`string`, `any`&gt;

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

&#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

***

### exportToPDF()

> **exportToPDF**&lt;`T`&gt;(`data`, `columns`, `options?`): &#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

Defined in: [utils/exportUtils.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L158)

Export to PDF (simplified - creates HTML that can be printed to PDF)

#### Type Parameters

##### T

`T` *extends* `Record`&lt;`string`, `any`&gt;

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

&#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

***

### exportToXLSX()

> **exportToXLSX**&lt;`T`&gt;(`data`, `columns`, `options?`): &#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

Defined in: [utils/exportUtils.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L57)

Export to XLSX (using CSV with .xlsx extension - Excel can open it)
This is a simplified approach without external dependencies

#### Type Parameters

##### T

`T` *extends* `Record`&lt;`string`, `any`&gt;

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

&#123; `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; &#125; &#124; &#123; `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; &#125;

***

### generateExportHeader()

> **generateExportHeader**(`options?`): `string`

Defined in: [utils/exportUtils.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L21)

Generate audit-ready export header (T1 Template)

#### Parameters

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

`string`

***

### getCurrentUser()

> **getCurrentUser**(): `string`

Defined in: [utils/exportUtils.ts:277](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/exportUtils.ts#L277)

Get current user info from localStorage (for non-React contexts).
Returns the display name or username of the currently authenticated user.

#### Returns

`string`
