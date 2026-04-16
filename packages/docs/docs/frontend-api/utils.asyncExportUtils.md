[**Frontend API Reference v1.0.0**](index.md)

***

# utils/asyncExportUtils

## Classes

### AsyncExportManager

Defined in: [utils/asyncExportUtils.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L31)

#### Constructors

##### Constructor

> **new AsyncExportManager**(): [`AsyncExportManager`](#asyncexportmanager)

###### Returns

[`AsyncExportManager`](#asyncexportmanager)

#### Methods

##### cancelJob()

> **cancelJob**(`jobId`): `Promise`\<`void`\>

Defined in: [utils/asyncExportUtils.ts:158](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L158)

Cancel export job

###### Parameters

###### jobId

`string`

###### Returns

`Promise`\<`void`\>

##### cleanupOldJobs()

> **cleanupOldJobs**(): `void`

Defined in: [utils/asyncExportUtils.ts:177](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L177)

Clean up old jobs (>24 hours)

###### Returns

`void`

##### createJob()

> **createJob**(`options`): `Promise`\<[`AsyncExportJob`](#asyncexportjob)\>

Defined in: [utils/asyncExportUtils.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L45)

Create async export job

###### Parameters

###### options

[`AsyncExportOptions`](#asyncexportoptions)

###### Returns

`Promise`\<[`AsyncExportJob`](#asyncexportjob)\>

##### downloadExport()

> **downloadExport**(`jobId`): `Promise`\<`void`\>

Defined in: [utils/asyncExportUtils.ts:135](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L135)

Download completed export

###### Parameters

###### jobId

`string`

###### Returns

`Promise`\<`void`\>

##### getJobStatus()

> **getJobStatus**(`jobId`): [`AsyncExportJob`](#asyncexportjob) \| `undefined`

Defined in: [utils/asyncExportUtils.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L113)

Get job status

###### Parameters

###### jobId

`string`

###### Returns

[`AsyncExportJob`](#asyncexportjob) \| `undefined`

##### shouldUseAsync()

> **shouldUseAsync**(`rowCount`): `boolean`

Defined in: [utils/asyncExportUtils.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L38)

Check if export should be async based on row count

###### Parameters

###### rowCount

`number`

###### Returns

`boolean`

## Interfaces

### AsyncExportJob

Defined in: [utils/asyncExportUtils.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L10)

Client-side coordination layer for large export jobs.
It decides when to switch from synchronous export to a background flow
and exposes job lifecycle helpers for progress-aware UI.

#### Properties

##### completedAt?

> `optional` **completedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L17)

##### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: [utils/asyncExportUtils.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L18)

##### error?

> `optional` **error**: `string`

Defined in: [utils/asyncExportUtils.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L19)

##### jobId

> **jobId**: `string`

Defined in: [utils/asyncExportUtils.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L11)

##### processedRows

> **processedRows**: `number`

Defined in: [utils/asyncExportUtils.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L15)

##### progress

> **progress**: `number`

Defined in: [utils/asyncExportUtils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L13)

##### startedAt

> **startedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L16)

##### status

> **status**: `"pending"` \| `"completed"` \| `"failed"` \| `"processing"`

Defined in: [utils/asyncExportUtils.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L12)

##### totalRows

> **totalRows**: `number`

Defined in: [utils/asyncExportUtils.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L14)

***

### AsyncExportOptions

Defined in: [utils/asyncExportUtils.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L22)

#### Properties

##### filters

> **filters**: `Record`\<`string`, `any`\>

Defined in: [utils/asyncExportUtils.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L25)

##### format

> **format**: `"csv"` \| `"xlsx"`

Defined in: [utils/asyncExportUtils.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L24)

##### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [utils/asyncExportUtils.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L28)

###### Parameters

###### progress

`number`

###### Returns

`void`

##### reportName

> **reportName**: `string`

Defined in: [utils/asyncExportUtils.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L23)

##### totalRows

> **totalRows**: `number`

Defined in: [utils/asyncExportUtils.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L26)

##### userEmail

> **userEmail**: `string`

Defined in: [utils/asyncExportUtils.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L27)

## Variables

### asyncExportManager

> `const` **asyncExportManager**: [`AsyncExportManager`](#asyncexportmanager)

Defined in: [utils/asyncExportUtils.ts:190](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L190)

## Functions

### useAsyncExport()

> **useAsyncExport**(): `object`

Defined in: [utils/asyncExportUtils.ts:195](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/asyncExportUtils.ts#L195)

Hook-friendly wrapper

#### Returns

`object`

##### cancelExport()

> **cancelExport**: (`jobId`) => `Promise`\<`void`\>

###### Parameters

###### jobId

`string`

###### Returns

`Promise`\<`void`\>

##### createExport()

> **createExport**: (`options`) => `Promise`\<[`AsyncExportJob`](#asyncexportjob)\>

###### Parameters

###### options

[`AsyncExportOptions`](#asyncexportoptions)

###### Returns

`Promise`\<[`AsyncExportJob`](#asyncexportjob)\>

##### downloadExport()

> **downloadExport**: (`jobId`) => `Promise`\<`void`\>

###### Parameters

###### jobId

`string`

###### Returns

`Promise`\<`void`\>

##### getStatus()

> **getStatus**: (`jobId`) => [`AsyncExportJob`](#asyncexportjob) \| `undefined`

###### Parameters

###### jobId

`string`

###### Returns

[`AsyncExportJob`](#asyncexportjob) \| `undefined`

##### shouldUseAsync()

> **shouldUseAsync**: (`rowCount`) => `boolean`

###### Parameters

###### rowCount

`number`

###### Returns

`boolean`
