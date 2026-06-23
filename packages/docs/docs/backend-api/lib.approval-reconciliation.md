[**Backend API Reference v1.0.0**](index.md)

***

# lib/approval-reconciliation

## Interfaces

### Assessment

Defined in: [src/lib/approval-reconciliation.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L12)

#### Properties

##### reason

> **reason**: `string`

Defined in: [src/lib/approval-reconciliation.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L14)

##### state

> **state**: `"already_applied"` &#124; `"missing_side_effect"` &#124; `"ambiguous"` &#124; `"unsupported"`

Defined in: [src/lib/approval-reconciliation.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L13)

***

### ReconciliationResult

Defined in: [src/lib/approval-reconciliation.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L17)

#### Extended by

- [`ReconciliationReportRow`](lib.approval-reconciliation-report.md#reconciliationreportrow)

#### Properties

##### entityType

> **entityType**: `string`

Defined in: [src/lib/approval-reconciliation.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L19)

##### operation

> **operation**: `string`

Defined in: [src/lib/approval-reconciliation.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L20)

##### reason

> **reason**: `string`

Defined in: [src/lib/approval-reconciliation.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L23)

##### requestId

> **requestId**: `string`

Defined in: [src/lib/approval-reconciliation.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L18)

##### state

> **state**: [`ReconciliationState`](#reconciliationstate)

Defined in: [src/lib/approval-reconciliation.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L22)

##### title

> **title**: `string`

Defined in: [src/lib/approval-reconciliation.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L21)

***

### ReplayOptions

Defined in: [src/lib/approval-reconciliation.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L26)

#### Properties

##### apply

> **apply**: `boolean`

Defined in: [src/lib/approval-reconciliation.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L27)

##### includeAmbiguous

> **includeAmbiguous**: `boolean`

Defined in: [src/lib/approval-reconciliation.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L28)

## Type Aliases

### Operation

> **Operation** = `"create"` &#124; `"update"` &#124; `"delete"`

Defined in: [src/lib/approval-reconciliation.ts:1](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L1)

***

### ReconciliationState

> **ReconciliationState** = `"already_applied"` &#124; `"missing_side_effect"` &#124; `"ambiguous"` &#124; `"unsupported"` &#124; `"error"` &#124; `"replayed"` &#124; `"replay_failed"`

Defined in: [src/lib/approval-reconciliation.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L3)

## Functions

### assessBucketHeaderRequest()

> **assessBucketHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:183](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L183)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessFlScalarHeaderRequest()

> **assessFlScalarHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:167](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L167)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessJournalHeaderRequest()

> **assessJournalHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:231](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L231)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessLegacyHeaderOperation()

> **assessLegacyHeaderOperation**(`operation`, `row`, `config`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L53)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### row

`unknown`

##### config

###### createMissing

`string`

###### deleteExisting

`string`

###### label

`string`

###### updateMatch

`boolean`

#### Returns

[`Assessment`](#assessment)

***

### assessParameterDetailRequest()

> **assessParameterDetailRequest**(`operation`, `request`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L84)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### request

###### entityId?

`string` &#124; `null`

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessProductHeaderRequest()

> **assessProductHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:215](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L215)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessRuleBaseDetailRequest()

> **assessRuleBaseDetailRequest**(`operation`, `_request`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:118](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L118)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### \_request

###### entityId?

`string` &#124; `null`

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessRuleBaseHeaderRequest()

> **assessRuleBaseHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:199](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L199)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessSegmentationDetailRequest()

> **assessSegmentationDetailRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:135](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L135)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### assessSegmentationHeaderRequest()

> **assessSegmentationHeaderRequest**(`operation`, `data`, `rows`): [`Assessment`](#assessment)

Defined in: [src/lib/approval-reconciliation.ts:151](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L151)

#### Parameters

##### operation

[`Operation`](#operation-1)

##### data

`any`

##### rows

###### rowById?

`any`[]

###### rowByKey?

`any`[]

#### Returns

[`Assessment`](#assessment)

***

### maybeReplayAssessment()

> **maybeReplayAssessment**(`request`, `operation`, `assessment`, `options`, `replay`): `Promise`&lt;[`ReconciliationResult`](#reconciliationresult)&gt;

Defined in: [src/lib/approval-reconciliation.ts:247](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L247)

#### Parameters

##### request

###### completedBy?

`string` &#124; `null`

###### entityType

`string`

###### id

`string`

###### requestedBy?

`string` &#124; `null`

###### title

`string`

##### operation

`string` &#124; `null`

##### assessment

[`Assessment`](#assessment)

##### options

[`ReplayOptions`](#replayoptions)

##### replay

(`request`, `approvedBy?`) => `Promise`&lt;`void`&gt;

#### Returns

`Promise`&lt;[`ReconciliationResult`](#reconciliationresult)&gt;

***

### same()

> **same**(`a`, `b`): `boolean`

Defined in: [src/lib/approval-reconciliation.ts:31](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L31)

#### Parameters

##### a

`unknown`

##### b

`unknown`

#### Returns

`boolean`

***

### toBigIntId()

> **toBigIntId**(`value`): `bigint` &#124; `null`

Defined in: [src/lib/approval-reconciliation.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L44)

#### Parameters

##### value

`unknown`

#### Returns

`bigint` &#124; `null`

***

### toNumericId()

> **toNumericId**(`value`): `number` &#124; `null`

Defined in: [src/lib/approval-reconciliation.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/approval-reconciliation.ts#L39)

#### Parameters

##### value

`unknown`

#### Returns

`number` &#124; `null`
