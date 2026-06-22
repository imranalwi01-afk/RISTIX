[**Backend API Reference v1.0.0**](index.md)

***

# services/individual-impairment-v2.service

## Classes

### IndividualImpairmentV2Service

Defined in: [src/services/individual-impairment-v2.service.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment-v2.service.ts#L3)

#### Extends

- [`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice)

#### Constructors

##### Constructor

> **new IndividualImpairmentV2Service**(): [`IndividualImpairmentV2Service`](#individualimpairmentv2service)

###### Returns

[`IndividualImpairmentV2Service`](#individualimpairmentv2service)

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`constructor`](services.individual-impairment.service.md#constructor)

#### Properties

##### apiVersion

> `readonly` **apiVersion**: `"v2"` = `'v2'`

Defined in: [src/services/individual-impairment-v2.service.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment-v2.service.ts#L4)

#### Methods

##### addToWatchlist()

> **addToWatchlist**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:2311](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2311)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`addToWatchlist`](services.individual-impairment.service.md#addtowatchlist)

##### applyConsolidatedAssessment()

> **applyConsolidatedAssessment**(`accountId`, `requestData`, `userId`): `Promise`&lt;`void`&gt;

Defined in: [src/services/individual-impairment.service.ts:692](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L692)

Re-applies data from a consolidated approval request to the operational tables.
This ensures that any staged adjustments are persisted upon approval.

###### Parameters

###### accountId

`number`

###### requestData

`any`

###### userId

`string`

###### Returns

`Promise`&lt;`void`&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`applyConsolidatedAssessment`](services.individual-impairment.service.md#applyconsolidatedassessment)

##### approveAssessment()

> **approveAssessment**(`accountId`, `comments`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2599](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2599)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`approveAssessment`](services.individual-impairment.service.md#approveassessment)

##### calculateDcf()

> **calculateDcf**(`tenantId`, `params`): `Promise`&lt;&#123; `assumptions`: `any`; `details`: `object`[]; `eadAmt`: `number`; `eclIaAmt`: `number`; `iaId`: `any`; `lgd`: `number`; `outstandingBalance`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `success`: `boolean`; `totalNpv`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1357](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1357)

###### Parameters

###### tenantId

`string`

###### params

`any`

###### Returns

`Promise`&lt;&#123; `assumptions`: `any`; `details`: `object`[]; `eadAmt`: `number`; `eclIaAmt`: `number`; `iaId`: `any`; `lgd`: `number`; `outstandingBalance`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `success`: `boolean`; `totalNpv`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`calculateDcf`](services.individual-impairment.service.md#calculatedcf)

##### createAssessment()

> **createAssessment**(`data`): `Promise`&lt;`any`&gt;

Defined in: [src/services/individual-impairment.service.ts:2428](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2428)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`any`&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createAssessment`](services.individual-impairment.service.md#createassessment)

##### createAuditLog()

> **createAuditLog**(`entry`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:714](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L714)

###### Parameters

###### entry

`any`

###### Returns

`Promise`&lt;`never`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createAuditLog`](services.individual-impairment.service.md#createauditlog)

##### createDcfCashflows()

> **createDcfCashflows**(`payload`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1234](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1234)

###### Parameters

###### payload

###### cashflows

`any`[]

###### scenario?

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createDcfCashflows`](services.individual-impairment.service.md#createdcfcashflows)

##### createDcfUpload()

> **createDcfUpload**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1129](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1129)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createDcfUpload`](services.individual-impairment.service.md#createdcfupload)

##### createOverride()

> **createOverride**(`data`): `Promise`&lt;`any`&gt;

Defined in: [src/services/individual-impairment.service.ts:2524](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2524)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`any`&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createOverride`](services.individual-impairment.service.md#createoverride)

##### createReport()

> **createReport**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:852](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L852)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createReport`](services.individual-impairment.service.md#createreport)

##### createScenario()

> **createScenario**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:937](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L937)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`createScenario`](services.individual-impairment.service.md#createscenario)

##### getAssessment()

> **getAssessment**(`tenantId`, `accountId`): `Promise`&lt;&#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` &#124; `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` &#124; `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` &#124; `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `status`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; &#125; &#124; &#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` &#124; `null`; `cif_number`: `string` &#124; `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` &#124; `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `status?`: `undefined`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; &#125; &#124; `null`&gt;

Defined in: [src/services/individual-impairment.service.ts:2336](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2336)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`&lt;&#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` &#124; `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` &#124; `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` &#124; `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `status`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; &#125; &#124; &#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` &#124; `null`; `cif_number`: `string` &#124; `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` &#124; `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `status?`: `undefined`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; &#125; &#124; `null`&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getAssessment`](services.individual-impairment.service.md#getassessment)

##### getAssessmentHistory()

> **getAssessmentHistory**(`tenantId`, `accountId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:607](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L607)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getAssessmentHistory`](services.individual-impairment.service.md#getassessmenthistory)

##### getAssessmentSummary()

> **getAssessmentSummary**(`tenantId`, `date?`): `Promise`&lt;&#123; `approve`: `number`; `approved`: `number`; `pending`: `number`; `rejected`: `number`; `total`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2988](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2988)

###### Parameters

###### tenantId

`string`

###### date?

`string`

###### Returns

`Promise`&lt;&#123; `approve`: `number`; `approved`: `number`; `pending`: `number`; `rejected`: `number`; `total`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getAssessmentSummary`](services.individual-impairment.service.md#getassessmentsummary)

##### getAuditTrails()

> **getAuditTrails**(`tenantId`, `filters`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:603](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L603)

###### Parameters

###### tenantId

`string`

###### filters

###### entityType?

`string`

###### limit?

`number`

###### offset?

`number`

###### Returns

`Promise`&lt;`never`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getAuditTrails`](services.individual-impairment.service.md#getaudittrails)

##### getCustomerList()

> **getCustomerList**(`tenantId`, `filters`): `Promise`&lt;&#123; `data`: `Record`&lt;`string`, `unknown`&gt;[]; `hasNextPage`: `boolean`; `hasPreviousPage`: `boolean`; `nextCursor`: `string` &#124; `null`; `previousCursor`: `string` &#124; `null`; `total`: `undefined`; &#125; &#124; &#123; `data`: `never`[]; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125; &#124; &#123; `data`: `RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2041](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2041)

###### Parameters

###### tenantId

`string`

###### filters

###### cursor?

`string`

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

###### paginationMode?

`"offset"` &#124; `"cursor"`

###### search?

`string`

###### sort?

`object`[]

###### Returns

`Promise`&lt;&#123; `data`: `Record`&lt;`string`, `unknown`&gt;[]; `hasNextPage`: `boolean`; `hasPreviousPage`: `boolean`; `nextCursor`: `string` &#124; `null`; `previousCursor`: `string` &#124; `null`; `total`: `undefined`; &#125; &#124; &#123; `data`: `never`[]; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125; &#124; &#123; `data`: `RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getCustomerList`](services.individual-impairment.service.md#getcustomerlist)

##### getDcfCalculations()

> **getDcfCalculations**(`tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1154](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1154)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getDcfCalculations`](services.individual-impairment.service.md#getdcfcalculations)

##### getDcfCashflows()

> **getDcfCashflows**(`tenantId`, `uploadId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1145](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1145)

###### Parameters

###### tenantId

`string`

###### uploadId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getDcfCashflows`](services.individual-impairment.service.md#getdcfcashflows)

##### getDcfUploads()

> **getDcfUploads**(`tenantId`, `limit?`, `offset?`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1090](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1090)

###### Parameters

###### tenantId

`string`

###### limit?

`number` = `50`

###### offset?

`number` = `0`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getDcfUploads`](services.individual-impairment.service.md#getdcfuploads)

##### getIaResultDetail()

> **getIaResultDetail**(`tenantId`, `filters`): `Promise`&lt;&#123; `cashflows`: `never`[]; `details`: `never`[]; `header`: `null`; &#125; &#124; &#123; `cashflows`: `object`[]; `details`: `object`[]; `header`: &#123; `accountId`: `number` &#124; `null`; `accountNumber`: `any`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `any`; `cifNumber`: `any`; `collectability`: `number`; `createdby`: `any`; `createddate`: `any`; `currency`: `any`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `any`; `effInterestRate`: `number`; `iaId`: `number` &#124; `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `any`; `pvDcfAmt`: `number`; `ratingCode`: `any`; &#125;; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1162](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1162)

###### Parameters

###### tenantId

`string`

###### filters

###### accountId?

`number`

###### accountNumber?

`string`

###### Returns

`Promise`&lt;&#123; `cashflows`: `never`[]; `details`: `never`[]; `header`: `null`; &#125; &#124; &#123; `cashflows`: `object`[]; `details`: `object`[]; `header`: &#123; `accountId`: `number` &#124; `null`; `accountNumber`: `any`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `any`; `cifNumber`: `any`; `collectability`: `number`; `createdby`: `any`; `createddate`: `any`; `currency`: `any`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `any`; `effInterestRate`: `number`; `iaId`: `number` &#124; `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `any`; `pvDcfAmt`: `number`; `ratingCode`: `any`; &#125;; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getIaResultDetail`](services.individual-impairment.service.md#getiaresultdetail)

##### getOverrides()

> **getOverrides**(`tenantId`, `filters`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:2483](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2483)

###### Parameters

###### tenantId

`string`

###### filters

###### accountId?

`number`

###### accountNumber?

`string`

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getOverrides`](services.individual-impairment.service.md#getoverrides)

##### getReports()

> **getReports**(`tenantId`, `filters`): `Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:722](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L722)

###### Parameters

###### tenantId

`string`

###### filters

###### accountNumber?

`string`

###### cifName?

`string`

###### dateFrom?

`string`

###### dateTo?

`string`

###### impaired_flag?

`string`

###### limit?

`number`

###### offset?

`number`

###### reportPeriod?

`string`

###### search?

`string`

###### sort?

`object`[]

###### status?

`string`

###### Returns

`Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getReports`](services.individual-impairment.service.md#getreports)

##### getScenarios()

> **getScenarios**(`tenantId`, `filters`): `Promise`&lt;(&#123; `accountId`: `number`; `accountNumber`: `any`; `activeFlag`: `boolean`; `configuration`: &#123; `nScenarios`: `number`; `repaymentPlan`: `object`[]; `scenarioRows`: `object`[]; `weights`: &#123; `base`: `number`; `best`: `number`; `worst`: `number`; &#125;; &#125;; `createdAt`: `any`; `createdBy`: `any`; `createdDate`: `any`; `description`: `any`; `discountRate`: `number`; `growthRate`: `number`; `iaId`: `number`; `id`: `string`; `paymentFrequency`: `string`; `pkid`: `number`; `recoveryRate`: `number`; `scenarioCode`: `string`; `scenarioId`: `number`; `scenarioName`: `string`; `status`: `string`; `timeHorizon`: `number`; &#125; &#124; &#123; `accountId`: `number`; `accountNumber`: `null`; `activeFlag`: `boolean`; `configuration`: &#123; `nScenarios`: `number`; `repaymentPlan`: `never`[]; `scenarioRows`: `never`[]; `weights`: &#123; `base`: `number`; `best`: `number`; `worst`: `number`; &#125;; &#125;; `createdAt`: `null`; `createdBy`: `string`; `createdDate`: `null`; `description`: `string`; `discountRate`: `number`; `growthRate`: `number`; `iaId`: `null`; `id`: `string`; `paymentFrequency`: `string`; `pkid`: `number`; `recoveryRate`: `number`; `scenarioCode`: `string`; `scenarioId`: `number`; `scenarioName`: `string`; `status`: `string`; `timeHorizon`: `number`; &#125;)[]&gt;

Defined in: [src/services/individual-impairment.service.ts:860](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L860)

###### Parameters

###### tenantId

`string`

###### filters

###### accountId?

`number`

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

###### Returns

`Promise`&lt;(&#123; `accountId`: `number`; `accountNumber`: `any`; `activeFlag`: `boolean`; `configuration`: &#123; `nScenarios`: `number`; `repaymentPlan`: `object`[]; `scenarioRows`: `object`[]; `weights`: &#123; `base`: `number`; `best`: `number`; `worst`: `number`; &#125;; &#125;; `createdAt`: `any`; `createdBy`: `any`; `createdDate`: `any`; `description`: `any`; `discountRate`: `number`; `growthRate`: `number`; `iaId`: `number`; `id`: `string`; `paymentFrequency`: `string`; `pkid`: `number`; `recoveryRate`: `number`; `scenarioCode`: `string`; `scenarioId`: `number`; `scenarioName`: `string`; `status`: `string`; `timeHorizon`: `number`; &#125; &#124; &#123; `accountId`: `number`; `accountNumber`: `null`; `activeFlag`: `boolean`; `configuration`: &#123; `nScenarios`: `number`; `repaymentPlan`: `never`[]; `scenarioRows`: `never`[]; `weights`: &#123; `base`: `number`; `best`: `number`; `worst`: `number`; &#125;; &#125;; `createdAt`: `null`; `createdBy`: `string`; `createdDate`: `null`; `description`: `string`; `discountRate`: `number`; `growthRate`: `number`; `iaId`: `null`; `id`: `string`; `paymentFrequency`: `string`; `pkid`: `number`; `recoveryRate`: `number`; `scenarioCode`: `string`; `scenarioId`: `number`; `scenarioName`: `string`; `status`: `string`; `timeHorizon`: `number`; &#125;)[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getScenarios`](services.individual-impairment.service.md#getscenarios)

##### getStagingAnalysis()

> **getStagingAnalysis**(`tenantId`, `filters?`): `Promise`&lt;`RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;&gt;

Defined in: [src/services/individual-impairment.service.ts:2754](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2754)

###### Parameters

###### tenantId

`string`

###### filters?

###### endDate?

`string`

###### segmentId?

`string`

###### stage?

`string`

###### startDate?

`string`

###### Returns

`Promise`&lt;`RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getStagingAnalysis`](services.individual-impairment.service.md#getstaginganalysis)

##### getStagingSummary()

> **getStagingSummary**(`tenantId`): `Promise`&lt;`Record`&lt;`string`, `unknown`&gt;&gt;

Defined in: [src/services/individual-impairment.service.ts:2906](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2906)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`Record`&lt;`string`, `unknown`&gt;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getStagingSummary`](services.individual-impairment.service.md#getstagingsummary)

##### getWatchlist()

> **getWatchlist**(`tenantId`, `filters`): `Promise`&lt;&#123; `data`: `object`[]; `hasNextPage`: `any`; `hasPreviousPage`: `any`; `nextCursor`: `any`; `previousCursor`: `any`; `total`: `undefined`; &#125; &#124; &#123; `data`: `object`[]; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1775](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1775)

###### Parameters

###### tenantId

`string`

###### filters

###### cursor?

`string`

###### dateFrom?

`string`

###### dateTo?

`string`

###### impaired_flag?

`string`

###### limit?

`number`

###### offset?

`number`

###### paginationMode?

`"offset"` &#124; `"cursor"`

###### priority_level?

`string`

###### rating_code?

`string`

###### search?

`string`

###### sort?

`object`[]

###### stage?

`number`

###### status?

`string`

###### Returns

`Promise`&lt;&#123; `data`: `object`[]; `hasNextPage`: `any`; `hasPreviousPage`: `any`; `nextCursor`: `any`; `previousCursor`: `any`; `total`: `undefined`; &#125; &#124; &#123; `data`: `object`[]; `hasNextPage?`: `undefined`; `hasPreviousPage?`: `undefined`; `nextCursor?`: `undefined`; `previousCursor?`: `undefined`; `total`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getWatchlist`](services.individual-impairment.service.md#getwatchlist)

##### getWatchlistSummary()

> **getWatchlistSummary**(`tenantId`, `date?`): `Promise`&lt;&#123; `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2847](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2847)

###### Parameters

###### tenantId

`string`

###### date?

`string`

###### Returns

`Promise`&lt;&#123; `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`getWatchlistSummary`](services.individual-impairment.service.md#getwatchlistsummary)

##### rejectAssessment()

> **rejectAssessment**(`accountId`, `reason`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2616](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2616)

###### Parameters

###### accountId

`number`

###### reason

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`rejectAssessment`](services.individual-impairment.service.md#rejectassessment)

##### removeFromWatchlist()

> **removeFromWatchlist**(`accountId`, `tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:2326](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2326)

###### Parameters

###### accountId

`string` &#124; `number`

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`removeFromWatchlist`](services.individual-impairment.service.md#removefromwatchlist)

##### resetAssessment()

> **resetAssessment**(`accountId`, `userId`): `Promise`&lt;&#123; `deletedAccountId`: `number`; `message`: `string`; `success`: `boolean`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2638](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2638)

Resets an individual impairment assessment by deleting all associated records.
This effectively returns the account to the 'NEW' assessment state.

###### Parameters

###### accountId

`number`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `deletedAccountId`: `number`; `message`: `string`; `success`: `boolean`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`resetAssessment`](services.individual-impairment.service.md#resetassessment)

##### submitAssessment()

> **submitAssessment**(`accountId`, `comments`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:2581](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L2581)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`submitAssessment`](services.individual-impairment.service.md#submitassessment)

##### updateScenarioStatus()

> **updateScenarioStatus**(`id`, `tenantId`, `status`, `approverId?`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:1081](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment.service.ts#L1081)

###### Parameters

###### id

`string`

###### tenantId

`string`

###### status

`string`

###### approverId?

`string`

###### Returns

`Promise`&lt;`never`[]&gt;

###### Inherited from

[`IndividualImpairmentService`](services.individual-impairment.service.md#individualimpairmentservice).[`updateScenarioStatus`](services.individual-impairment.service.md#updatescenariostatus)

## Variables

### individualImpairmentV2Service

> `const` **individualImpairmentV2Service**: [`IndividualImpairmentV2Service`](#individualimpairmentv2service)

Defined in: [src/services/individual-impairment-v2.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/individual-impairment-v2.service.ts#L7)
