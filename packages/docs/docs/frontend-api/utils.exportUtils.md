[**Frontend API Reference v1.0.0**](index.md)

***

# utils/exportUtils

## Interfaces

### ExportOptions

Defined in: [utils/exportUtils.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L8)

#### Properties

##### confidential?

> `optional` **confidential**: `boolean`

Defined in: [utils/exportUtils.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L15)

##### exportedBy?

> `optional` **exportedBy**: `string`

Defined in: [utils/exportUtils.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L12)

##### filename?

> `optional` **filename**: `string`

Defined in: [utils/exportUtils.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L9)

##### filters?

> `optional` **filters**: `Record`\<`string`, `any`\>

Defined in: [utils/exportUtils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L13)

##### modelVersion?

> `optional` **modelVersion**: `string`

Defined in: [utils/exportUtils.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L14)

##### subtitle?

> `optional` **subtitle**: `string`

Defined in: [utils/exportUtils.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L11)

##### title?

> `optional` **title**: `string`

Defined in: [utils/exportUtils.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L10)

## Functions

### exportToCSV()

> **exportToCSV**\<`T`\>(`data`, `columns`, `options?`): \{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

Defined in: [utils/exportUtils.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L106)

Export to CSV

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

\{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

***

### exportToPDF()

> **exportToPDF**\<`T`\>(`data`, `columns`, `options?`): \{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

Defined in: [utils/exportUtils.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L158)

Export to PDF (simplified - creates HTML that can be printed to PDF)

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

\{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

***

### exportToXLSX()

> **exportToXLSX**\<`T`\>(`data`, `columns`, `options?`): \{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

Defined in: [utils/exportUtils.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L57)

Export to XLSX (using CSV with .xlsx extension - Excel can open it)
This is a simplified approach without external dependencies

#### Type Parameters

##### T

`T` *extends* `Record`\<`string`, `any`\>

#### Parameters

##### data

`T`[]

##### columns

`object`[]

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

\{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

***

### generateExportHeader()

> **generateExportHeader**(`options?`): `string`

Defined in: [utils/exportUtils.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L21)

Generate audit-ready export header (T1 Template)

#### Parameters

##### options?

[`ExportOptions`](#exportoptions) = `{}`

#### Returns

`string`

***

### getCurrentUser()

> **getCurrentUser**(): `string`

Defined in: [utils/exportUtils.ts:276](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/exportUtils.ts#L276)

Get current user info (placeholder - replace with actual auth context)

#### Returns

`string`
