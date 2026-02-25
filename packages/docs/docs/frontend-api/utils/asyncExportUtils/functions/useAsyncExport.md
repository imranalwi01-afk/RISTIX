[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useAsyncExport()

> **useAsyncExport**(): `object`

Defined in: [utils/asyncExportUtils.ts:194](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/asyncExportUtils.ts#L194)

Hook-friendly wrapper

## Returns

`object`

### cancelExport()

> **cancelExport**: (`jobId`) => `Promise`\<`void`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`void`\>

### createExport()

> **createExport**: (`options`) => `Promise`\<[`AsyncExportJob`](../interfaces/AsyncExportJob.md)\>

#### Parameters

##### options

[`AsyncExportOptions`](../interfaces/AsyncExportOptions.md)

#### Returns

`Promise`\<[`AsyncExportJob`](../interfaces/AsyncExportJob.md)\>

### downloadExport()

> **downloadExport**: (`jobId`) => `Promise`\<`void`\>

#### Parameters

##### jobId

`string`

#### Returns

`Promise`\<`void`\>

### getStatus()

> **getStatus**: (`jobId`) => [`AsyncExportJob`](../interfaces/AsyncExportJob.md) \| `undefined`

#### Parameters

##### jobId

`string`

#### Returns

[`AsyncExportJob`](../interfaces/AsyncExportJob.md) \| `undefined`

### shouldUseAsync()

> **shouldUseAsync**: (`rowCount`) => `boolean`

#### Parameters

##### rowCount

`number`

#### Returns

`boolean`
