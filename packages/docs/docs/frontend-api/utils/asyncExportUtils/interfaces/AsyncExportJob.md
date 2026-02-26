[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Interface: AsyncExportJob

Defined in: [utils/asyncExportUtils.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L9)

Async Export Utilities for Large Datasets
Handles exports >50k rows with progress tracking and email notification

## Properties

### completedAt?

> `optional` **completedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L16)

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: [utils/asyncExportUtils.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L17)

***

### error?

> `optional` **error**: `string`

Defined in: [utils/asyncExportUtils.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L18)

***

### jobId

> **jobId**: `string`

Defined in: [utils/asyncExportUtils.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L10)

***

### processedRows

> **processedRows**: `number`

Defined in: [utils/asyncExportUtils.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L14)

***

### progress

> **progress**: `number`

Defined in: [utils/asyncExportUtils.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L12)

***

### startedAt

> **startedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L15)

***

### status

> **status**: `"pending"` \| `"completed"` \| `"failed"` \| `"processing"`

Defined in: [utils/asyncExportUtils.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L11)

***

### totalRows

> **totalRows**: `number`

Defined in: [utils/asyncExportUtils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L13)
