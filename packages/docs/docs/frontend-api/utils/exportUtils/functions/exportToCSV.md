[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: exportToCSV()

> **exportToCSV**\<`T`\>(`data`, `columns`, `options?`): \{ `error?`: `undefined`; `filename`: `string`; `success`: `boolean`; \} \| \{ `error`: `string`; `filename?`: `undefined`; `success`: `boolean`; \}

Defined in: [utils/exportUtils.ts:106](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/exportUtils.ts#L106)

Export to CSV

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
