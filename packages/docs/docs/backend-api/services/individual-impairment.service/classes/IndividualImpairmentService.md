[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: IndividualImpairmentService

Defined in: [src/services/individual-impairment.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L27)

## Constructors

### Constructor

> **new IndividualImpairmentService**(): `IndividualImpairmentService`

#### Returns

`IndividualImpairmentService`

## Methods

### addToWatchlist()

> **addToWatchlist**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:465](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L465)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### calculateDcf()

> **calculateDcf**(`tenantId`, `params`): `Promise`\<\{ `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` \| `null`; `scenario`: `any`; \}\>

Defined in: [src/services/individual-impairment.service.ts:270](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L270)

#### Parameters

##### tenantId

`string`

##### params

`any`

#### Returns

`Promise`\<\{ `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` \| `null`; `scenario`: `any`; \}\>

***

### createAssessment()

> **createAssessment**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:531](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L531)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createAuditLog()

> **createAuditLog**(`entry`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L113)

#### Parameters

##### entry

`any`

#### Returns

`Promise`\<`never`[]\>

***

### createDcfCashflows()

> **createDcfCashflows**(`data`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:266](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L266)

#### Parameters

##### data

`any`[]

#### Returns

`Promise`\<`never`[]\>

***

### createDcfUpload()

> **createDcfUpload**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:239](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L239)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createOverride()

> **createOverride**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:574](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L574)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createReport()

> **createReport**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:137](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L137)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createScenario()

> **createScenario**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:199](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L199)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### getAssessment()

> **getAssessment**(`tenantId`, `accountId`): `Promise`\<\{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` \| `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` \| `null`; `interest_rate`: `number`; `method`: `string` \| `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; \} \| `null`\>

Defined in: [src/services/individual-impairment.service.ts:486](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L486)

#### Parameters

##### tenantId

`string`

##### accountId

`number`

#### Returns

`Promise`\<\{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` \| `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` \| `null`; `interest_rate`: `number`; `method`: `string` \| `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; \} \| `null`\>

***

### getAssessmentHistory()

> **getAssessmentHistory**(`tenantId`, `accountId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L37)

#### Parameters

##### tenantId

`string`

##### accountId

`number`

#### Returns

`Promise`\<`object`[]\>

***

### getAuditTrails()

> **getAuditTrails**(`tenantId`, `filters`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L33)

#### Parameters

##### tenantId

`string`

##### filters

###### entityType?

`string`

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<`never`[]\>

***

### getDcfCalculations()

> **getDcfCalculations**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:258](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L258)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getDcfCashflows()

> **getDcfCashflows**(`tenantId`, `uploadId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:251](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L251)

#### Parameters

##### tenantId

`string`

##### uploadId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getDcfUploads()

> **getDcfUploads**(`tenantId`, `limit`, `offset`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:231](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L231)

#### Parameters

##### tenantId

`string`

##### limit

`number` = `50`

##### offset

`number` = `0`

#### Returns

`Promise`\<`object`[]\>

***

### getOverrides()

> **getOverrides**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:541](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L541)

#### Parameters

##### tenantId

`string`

##### filters

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getReports()

> **getReports**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:121](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L121)

#### Parameters

##### tenantId

`string`

##### filters

###### limit?

`number`

###### offset?

`number`

###### reportPeriod?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getScenarios()

> **getScenarios**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L145)

#### Parameters

##### tenantId

`string`

##### filters

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getStagingAnalysis()

> **getStagingAnalysis**(`tenantId`, `filters`): `Promise`\<`RowList`\<`Record`\<`string`, `unknown`\>[]\>\>

Defined in: [src/services/individual-impairment.service.ts:653](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L653)

#### Parameters

##### tenantId

`string`

##### filters

###### endDate?

`string`

###### segmentId?

`string`

###### stage?

`string`

###### startDate?

`string`

#### Returns

`Promise`\<`RowList`\<`Record`\<`string`, `unknown`\>[]\>\>

***

### getStagingSummary()

> **getStagingSummary**(`tenantId`): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [src/services/individual-impairment.service.ts:709](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L709)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

***

### getWatchlist()

> **getWatchlist**(`tenantId`, `filters`): `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Defined in: [src/services/individual-impairment.service.ts:338](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L338)

#### Parameters

##### tenantId

`string`

##### filters

###### impaired_flag?

`string`

###### limit?

`number`

###### offset?

`number`

###### rating_code?

`string`

###### search?

`string`

###### stage?

`number`

###### status?

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

***

### removeFromWatchlist()

> **removeFromWatchlist**(`id`, `tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:476](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L476)

#### Parameters

##### id

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### updateScenarioStatus()

> **updateScenarioStatus**(`id`, `tenantId`, `status`, `approverId?`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:215](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/individual-impairment.service.ts#L215)

#### Parameters

##### id

`string`

##### tenantId

`string`

##### status

`string`

##### approverId?

`string`

#### Returns

`Promise`\<`object`[]\>
