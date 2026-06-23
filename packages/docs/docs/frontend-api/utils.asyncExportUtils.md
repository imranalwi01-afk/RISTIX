[**Frontend API Reference v1.0.0**](index.md)

***

# utils/asyncExportUtils

## Classes

### AsyncExportManager

Defined in: [utils/asyncExportUtils.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L31)

#### Constructors

##### Constructor

> **new AsyncExportManager**(): [`AsyncExportManager`](#asyncexportmanager)

###### Returns

[`AsyncExportManager`](#asyncexportmanager)

#### Methods

##### cancelJob()

> **cancelJob**(`jobId`): `Promise`&lt;`void`&gt;

Defined in: [utils/asyncExportUtils.ts:155](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L155)

Cancel export job

###### Parameters

###### jobId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### cleanupOldJobs()

> **cleanupOldJobs**(): `void`

Defined in: [utils/asyncExportUtils.ts:174](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L174)

Clean up old jobs (>24 hours)

###### Returns

`void`

##### createJob()

> **createJob**(`options`): `Promise`&lt;[`AsyncExportJob`](#asyncexportjob)&gt;

Defined in: [utils/asyncExportUtils.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L45)

Create async export job

###### Parameters

###### options

[`AsyncExportOptions`](#asyncexportoptions)

###### Returns

`Promise`&lt;[`AsyncExportJob`](#asyncexportjob)&gt;

##### downloadExport()

> **downloadExport**(`jobId`): `Promise`&lt;`void`&gt;

Defined in: [utils/asyncExportUtils.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L133)

Download completed export

###### Parameters

###### jobId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### getJobStatus()

> **getJobStatus**(`jobId`): [`AsyncExportJob`](#asyncexportjob) &#124; `undefined`

Defined in: [utils/asyncExportUtils.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L113)

Get job status

###### Parameters

###### jobId

`string`

###### Returns

[`AsyncExportJob`](#asyncexportjob) &#124; `undefined`

##### shouldUseAsync()

> **shouldUseAsync**(`rowCount`): `boolean`

Defined in: [utils/asyncExportUtils.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L38)

Check if export should be async based on row count

###### Parameters

###### rowCount

`number`

###### Returns

`boolean`

## Interfaces

### AsyncExportJob

Defined in: [utils/asyncExportUtils.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L10)

Client-side coordination layer for large export jobs.
It decides when to switch from synchronous export to a background flow
and exposes job lifecycle helpers for progress-aware UI.

#### Properties

##### completedAt?

> `optional` **completedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L17)

##### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: [utils/asyncExportUtils.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L18)

##### error?

> `optional` **error**: `string`

Defined in: [utils/asyncExportUtils.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L19)

##### jobId

> **jobId**: `string`

Defined in: [utils/asyncExportUtils.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L11)

##### processedRows

> **processedRows**: `number`

Defined in: [utils/asyncExportUtils.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L15)

##### progress

> **progress**: `number`

Defined in: [utils/asyncExportUtils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L13)

##### startedAt

> **startedAt**: `string`

Defined in: [utils/asyncExportUtils.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L16)

##### status

> **status**: `"pending"` &#124; `"completed"` &#124; `"failed"` &#124; `"processing"`

Defined in: [utils/asyncExportUtils.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L12)

##### totalRows

> **totalRows**: `number`

Defined in: [utils/asyncExportUtils.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L14)

***

### AsyncExportOptions

Defined in: [utils/asyncExportUtils.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L22)

#### Properties

##### filters

> **filters**: `Record`&lt;`string`, `any`&gt;

Defined in: [utils/asyncExportUtils.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L25)

##### format

> **format**: `"csv"` &#124; `"xlsx"`

Defined in: [utils/asyncExportUtils.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L24)

##### onProgress()?

> `optional` **onProgress**: (`progress`) => `void`

Defined in: [utils/asyncExportUtils.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L28)

###### Parameters

###### progress

`number`

###### Returns

`void`

##### reportName

> **reportName**: `string`

Defined in: [utils/asyncExportUtils.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L23)

##### totalRows

> **totalRows**: `number`

Defined in: [utils/asyncExportUtils.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L26)

##### userEmail

> **userEmail**: `string`

Defined in: [utils/asyncExportUtils.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L27)

## Variables

### asyncExportManager

> `const` **asyncExportManager**: [`AsyncExportManager`](#asyncexportmanager)

Defined in: [utils/asyncExportUtils.ts:187](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L187)

## Functions

### useAsyncExport()

> **useAsyncExport**(): `object`

Defined in: [utils/asyncExportUtils.ts:192](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/asyncExportUtils.ts#L192)

Hook-friendly wrapper

#### Returns

`object`

##### cancelExport()

> **cancelExport**: (`jobId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### jobId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### createExport()

> **createExport**: (`options`) => `Promise`&lt;[`AsyncExportJob`](#asyncexportjob)&gt;

###### Parameters

###### options

[`AsyncExportOptions`](#asyncexportoptions)

###### Returns

`Promise`&lt;[`AsyncExportJob`](#asyncexportjob)&gt;

##### downloadExport()

> **downloadExport**: (`jobId`) => `Promise`&lt;`void`&gt;

###### Parameters

###### jobId

`string`

###### Returns

`Promise`&lt;`void`&gt;

##### getStatus()

> **getStatus**: (`jobId`) => [`AsyncExportJob`](#asyncexportjob) &#124; `undefined`

###### Parameters

###### jobId

`string`

###### Returns

[`AsyncExportJob`](#asyncexportjob) &#124; `undefined`

##### shouldUseAsync()

> **shouldUseAsync**: (`rowCount`) => `boolean`

###### Parameters

###### rowCount

`number`

###### Returns

`boolean`
