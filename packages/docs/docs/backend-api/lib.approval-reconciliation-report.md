[**Backend API Reference v1.0.0**](index.md)

***

# lib/approval-reconciliation-report

## Interfaces

### ReconciliationJsonReport

Defined in: [src/lib/approval-reconciliation-report.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L16)

#### Properties

##### filters

> **filters**: `Record`&lt;`string`, `string` &#124; `number` &#124; `boolean`&gt;

Defined in: [src/lib/approval-reconciliation-report.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L23)

##### generatedAt

> **generatedAt**: `string`

Defined in: [src/lib/approval-reconciliation-report.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L17)

##### rows

> **rows**: [`ReconciliationReportRow`](#reconciliationreportrow)[]

Defined in: [src/lib/approval-reconciliation-report.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L24)

##### summary

> **summary**: `object`

Defined in: [src/lib/approval-reconciliation-report.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L18)

###### byEntityType

> **byEntityType**: `Record`&lt;`string`, `number`&gt;

###### byState

> **byState**: `Record`&lt;`string`, `number`&gt;

###### total

> **total**: `number`

***

### ReconciliationReportOptions

Defined in: [src/lib/approval-reconciliation-report.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L5)

#### Properties

##### filters?

> `optional` **filters?**: `Record`&lt;`string`, `string` &#124; `number` &#124; `boolean` &#124; `undefined`&gt;

Defined in: [src/lib/approval-reconciliation-report.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L8)

##### format

> **format**: [`ReconciliationReportFormat`](#reconciliationreportformat)

Defined in: [src/lib/approval-reconciliation-report.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L6)

##### generatedAt?

> `optional` **generatedAt?**: `string`

Defined in: [src/lib/approval-reconciliation-report.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L7)

***

### ReconciliationReportRow

Defined in: [src/lib/approval-reconciliation-report.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L11)

#### Extends

- [`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult)

#### Properties

##### entityType

> **entityType**: `string`

Defined in: [src/lib/approval-reconciliation.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L19)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`entityType`](lib.approval-reconciliation.md#entitytype)

##### operation

> **operation**: `string`

Defined in: [src/lib/approval-reconciliation.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L20)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`operation`](lib.approval-reconciliation.md#operation)

##### reason

> **reason**: `string`

Defined in: [src/lib/approval-reconciliation.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L23)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`reason`](lib.approval-reconciliation.md#reason-1)

##### recommendedAction

> **recommendedAction**: `string`

Defined in: [src/lib/approval-reconciliation-report.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L13)

##### requestId

> **requestId**: `string`

Defined in: [src/lib/approval-reconciliation.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L18)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`requestId`](lib.approval-reconciliation.md#requestid)

##### requiresManualReview

> **requiresManualReview**: `boolean`

Defined in: [src/lib/approval-reconciliation-report.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L12)

##### state

> **state**: [`ReconciliationState`](lib.approval-reconciliation.md#reconciliationstate)

Defined in: [src/lib/approval-reconciliation.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L22)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`state`](lib.approval-reconciliation.md#state-1)

##### title

> **title**: `string`

Defined in: [src/lib/approval-reconciliation.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L21)

###### Inherited from

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult).[`title`](lib.approval-reconciliation.md#title)

## Type Aliases

### ReconciliationReportFormat

> **ReconciliationReportFormat** = `"console"` &#124; `"json"` &#124; `"csv"`

Defined in: [src/lib/approval-reconciliation-report.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L3)

## Functions

### buildReconciliationCsv()

> **buildReconciliationCsv**(`results`): `string`

Defined in: [src/lib/approval-reconciliation-report.ts:104](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L104)

#### Parameters

##### results

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult)[]

#### Returns

`string`

***

### buildReconciliationJsonReport()

> **buildReconciliationJsonReport**(`results`, `options?`): [`ReconciliationJsonReport`](#reconciliationjsonreport)

Defined in: [src/lib/approval-reconciliation-report.ts:64](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L64)

#### Parameters

##### results

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult)[]

##### options?

`Omit`&lt;[`ReconciliationReportOptions`](#reconciliationreportoptions), `"format"`&gt; = `{}`

#### Returns

[`ReconciliationJsonReport`](#reconciliationjsonreport)

***

### decorateReconciliationResult()

> **decorateReconciliationResult**(`result`): [`ReconciliationReportRow`](#reconciliationreportrow)

Defined in: [src/lib/approval-reconciliation-report.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation-report.ts#L27)

#### Parameters

##### result

[`ReconciliationResult`](lib.approval-reconciliation.md#reconciliationresult)

#### Returns

[`ReconciliationReportRow`](#reconciliationreportrow)
