[**Backend API Reference v1.0.0**](index.md)

***

# services/individual-impairment.service

## Classes

### IndividualImpairmentService

Defined in: [src/services/individual-impairment.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L28)

#### Constructors

##### Constructor

> **new IndividualImpairmentService**(): [`IndividualImpairmentService`](#individualimpairmentservice)

###### Returns

[`IndividualImpairmentService`](#individualimpairmentservice)

#### Methods

##### addToWatchlist()

> **addToWatchlist**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:724](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L724)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<`object`[]\>

##### approveAssessment()

> **approveAssessment**(`accountId`, `comments`, `userId`): `Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

Defined in: [src/services/individual-impairment.service.ts:1052](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1052)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

##### calculateDcf()

> **calculateDcf**(`tenantId`, `params`): `Promise`\<\{ `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` \| `null`; `scenario`: `any`; \}\>

Defined in: [src/services/individual-impairment.service.ts:367](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L367)

###### Parameters

###### tenantId

`string`

###### params

`any`

###### Returns

`Promise`\<\{ `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` \| `null`; `scenario`: `any`; \}\>

##### createAssessment()

> **createAssessment**(`data`): `Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

Defined in: [src/services/individual-impairment.service.ts:836](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L836)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

##### createAuditLog()

> **createAuditLog**(`entry`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:102](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L102)

###### Parameters

###### entry

`any`

###### Returns

`Promise`\<`never`[]\>

##### createDcfCashflows()

> **createDcfCashflows**(`data`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:363](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L363)

###### Parameters

###### data

`any`[]

###### Returns

`Promise`\<`never`[]\>

##### createDcfUpload()

> **createDcfUpload**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:222](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L222)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<`object`[]\>

##### createOverride()

> **createOverride**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:955](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L955)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<`object`[]\>

##### createReport()

> **createReport**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L126)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<`object`[]\>

##### createScenario()

> **createScenario**(`data`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:173](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L173)

###### Parameters

###### data

`any`

###### Returns

`Promise`\<`object`[]\>

##### getAssessment()

> **getAssessment**(`tenantId`, `accountId`): `Promise`\<\{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` \| `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` \| `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` \| `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; \} \| \{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` \| `null`; `cif_number`: `string` \| `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` \| `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; \} \| `null`\>

Defined in: [src/services/individual-impairment.service.ts:745](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L745)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`\<\{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` \| `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` \| `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` \| `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; \} \| \{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` \| `null`; `cif_number`: `string` \| `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` \| `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; \} \| `null`\>

##### getAssessmentHistory()

> **getAssessmentHistory**(`tenantId`, `accountId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L38)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`\<`object`[]\>

##### getAuditTrails()

> **getAuditTrails**(`tenantId`, `filters`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L34)

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

`Promise`\<`never`[]\>

##### getCustomerList()

> **getCustomerList**(`tenantId`, `filters`): `Promise`\<\{ `data`: `never`[]; `total`: `number`; \} \| \{ `data`: `RowList`\<`Record`\<`string`, `unknown`\>[]\>; `total`: `number`; \}\>

Defined in: [src/services/individual-impairment.service.ts:585](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L585)

###### Parameters

###### tenantId

`string`

###### filters

###### dateFrom?

`string`

###### dateTo?

`string`

###### limit?

`number`

###### offset?

`number`

###### search?

`string`

###### Returns

`Promise`\<\{ `data`: `never`[]; `total`: `number`; \} \| \{ `data`: `RowList`\<`Record`\<`string`, `unknown`\>[]\>; `total`: `number`; \}\>

##### getDcfCalculations()

> **getDcfCalculations**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:241](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L241)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`\<`object`[]\>

##### getDcfCashflows()

> **getDcfCashflows**(`tenantId`, `uploadId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:234](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L234)

###### Parameters

###### tenantId

`string`

###### uploadId

`string`

###### Returns

`Promise`\<`object`[]\>

##### getDcfUploads()

> **getDcfUploads**(`tenantId`, `limit`, `offset`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:214](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L214)

###### Parameters

###### tenantId

`string`

###### limit

`number` = `50`

###### offset

`number` = `0`

###### Returns

`Promise`\<`object`[]\>

##### getIaResultDetail()

> **getIaResultDetail**(`tenantId`, `filters`): `Promise`\<\{ `details`: `never`[]; `header`: `null`; \} \| \{ `details`: `object`[]; `header`: \{ `accountId`: `number` \| `null`; `accountNumber`: `string`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string` \| `null`; `currency`: `string`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `string` \| `null`; `effInterestRate`: `number`; `iaId`: `number` \| `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `string` \| `null`; `pvDcfAmt`: `number`; `ratingCode`: `string`; \}; \}\>

Defined in: [src/services/individual-impairment.service.ts:249](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L249)

###### Parameters

###### tenantId

`string`

###### filters

###### accountId?

`number`

###### accountNumber?

`string`

###### Returns

`Promise`\<\{ `details`: `never`[]; `header`: `null`; \} \| \{ `details`: `object`[]; `header`: \{ `accountId`: `number` \| `null`; `accountNumber`: `string`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string` \| `null`; `currency`: `string`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `string` \| `null`; `effInterestRate`: `number`; `iaId`: `number` \| `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `string` \| `null`; `pvDcfAmt`: `number`; `ratingCode`: `string`; \}; \}\>

##### getOverrides()

> **getOverrides**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:922](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L922)

###### Parameters

###### tenantId

`string`

###### filters

###### limit?

`number`

###### offset?

`number`

###### status?

`string`

###### Returns

`Promise`\<`object`[]\>

##### getReports()

> **getReports**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:110](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L110)

###### Parameters

###### tenantId

`string`

###### filters

###### limit?

`number`

###### offset?

`number`

###### reportPeriod?

`string`

###### Returns

`Promise`\<`object`[]\>

##### getScenarios()

> **getScenarios**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L134)

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

`Promise`\<`object`[]\>

##### getStagingAnalysis()

> **getStagingAnalysis**(`tenantId`, `filters`): `Promise`\<`RowList`\<`Record`\<`string`, `unknown`\>[]\>\>

Defined in: [src/services/individual-impairment.service.ts:1106](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1106)

###### Parameters

###### tenantId

`string`

###### filters

###### endDate?

`string`

###### segmentId?

`string`

###### stage?

`string`

###### startDate?

`string`

###### Returns

`Promise`\<`RowList`\<`Record`\<`string`, `unknown`\>[]\>\>

##### getStagingSummary()

> **getStagingSummary**(`tenantId`): `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [src/services/individual-impairment.service.ts:1258](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1258)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>

##### getWatchlist()

> **getWatchlist**(`tenantId`, `filters`): `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Defined in: [src/services/individual-impairment.service.ts:435](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L435)

###### Parameters

###### tenantId

`string`

###### filters

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

###### rating_code?

`string`

###### search?

`string`

###### stage?

`number`

###### status?

`string`

###### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

##### getWatchlistSummary()

> **getWatchlistSummary**(`tenantId`, `date?`): `Promise`\<\{ `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; \}\>

Defined in: [src/services/individual-impairment.service.ts:1199](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1199)

###### Parameters

###### tenantId

`string`

###### date?

`string`

###### Returns

`Promise`\<\{ `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; \}\>

##### rejectAssessment()

> **rejectAssessment**(`accountId`, `reason`, `userId`): `Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

Defined in: [src/services/individual-impairment.service.ts:1075](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1075)

###### Parameters

###### accountId

`number`

###### reason

`string`

###### userId

`string`

###### Returns

`Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

##### removeFromWatchlist()

> **removeFromWatchlist**(`accountId`, `tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/individual-impairment.service.ts:735](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L735)

###### Parameters

###### accountId

`string` | `number`

###### tenantId

`string`

###### Returns

`Promise`\<`object`[]\>

##### submitAssessment()

> **submitAssessment**(`accountId`, `comments`, `userId`): `Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

Defined in: [src/services/individual-impairment.service.ts:1027](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1027)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`\<\{ `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` \| `null`; `nOfScenario`: `number` \| `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` \| `null`; `reviewedby`: `string` \| `null`; `revieweddate`: `string` \| `null`; `reviewedhost`: `string` \| `null`; `scenarioId`: `number` \| `null`; `scName1`: `string` \| `null`; `scName2`: `string` \| `null`; `scName3`: `string` \| `null`; `status`: `number`; `triggerFilename`: `string` \| `null`; `triggerRemarks`: `string` \| `null`; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; `updatedhost`: `string` \| `null`; \}\>

##### updateScenarioStatus()

> **updateScenarioStatus**(`id`, `tenantId`, `status`, `approverId?`): `Promise`\<`never`[]\>

Defined in: [src/services/individual-impairment.service.ts:205](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L205)

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

`Promise`\<`never`[]\>

## Variables

### individualImpairmentService

> `const` **individualImpairmentService**: [`IndividualImpairmentService`](#individualimpairmentservice)

Defined in: [src/services/individual-impairment.service.ts:1340](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1340)
