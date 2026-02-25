[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: exportToXLSX()

> **exportToXLSX**\<`T`\>(`data`, `columns`, `options?`): \{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

Defined in: [utils/exportUtils.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/exportUtils.ts#L57)

Export to XLSX (using CSV with .xlsx extension - Excel can open it)
This is a simplified approach without external dependencies

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `any`\>

## Parameters

### data

`T`[]

### columns

`object`[]

### options?

[`ExportOptions`](../interfaces/ExportOptions.md) = `{}`

## Returns

\{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}
