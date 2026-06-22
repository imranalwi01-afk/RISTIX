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

> **addToWatchlist**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:724](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L724)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

##### approveAssessment()

> **approveAssessment**(`accountId`, `comments`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1052](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1052)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

##### calculateDcf()

> **calculateDcf**(`tenantId`, `params`): `Promise`&lt;&#123; `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` &#124; `null`; `scenario`: `any`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:367](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L367)

###### Parameters

###### tenantId

`string`

###### params

`any`

###### Returns

`Promise`&lt;&#123; `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` &#124; `null`; `scenario`: `any`; &#125;&gt;

##### createAssessment()

> **createAssessment**(`data`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:836](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L836)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

##### createAuditLog()

> **createAuditLog**(`entry`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:102](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L102)

###### Parameters

###### entry

`any`

###### Returns

`Promise`&lt;`never`[]&gt;

##### createDcfCashflows()

> **createDcfCashflows**(`data`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:363](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L363)

###### Parameters

###### data

`any`[]

###### Returns

`Promise`&lt;`never`[]&gt;

##### createDcfUpload()

> **createDcfUpload**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:222](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L222)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

##### createOverride()

> **createOverride**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:955](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L955)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

##### createReport()

> **createReport**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:126](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L126)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

##### createScenario()

> **createScenario**(`data`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:173](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L173)

###### Parameters

###### data

`any`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getAssessment()

> **getAssessment**(`tenantId`, `accountId`): `Promise`&lt;&#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` &#124; `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` &#124; `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` &#124; `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; &#125; &#124; &#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` &#124; `null`; `cif_number`: `string` &#124; `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` &#124; `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; &#125; &#124; `null`&gt;

Defined in: [src/services/individual-impairment.service.ts:745](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L745)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`&lt;&#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` &#124; `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` &#124; `null`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string` &#124; `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; &#125; &#124; &#123; `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string` &#124; `null`; `cif_number`: `string` &#124; `null`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string`; `currency`: `string` &#124; `null`; `dpd`: `number`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `null`; `impaired_flag`: `string`; `impairment_reason`: `string`; `interest_rate`: `number`; `is_override`: `boolean`; `method`: `string`; `outstanding_balance`: `number`; `pkid`: `number`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` &#124; `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `never`[]; `updatedby`: `null`; `updateddate`: `null`; &#125; &#124; `null`&gt;

##### getAssessmentHistory()

> **getAssessmentHistory**(`tenantId`, `accountId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L38)

###### Parameters

###### tenantId

`string`

###### accountId

`number`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getAuditTrails()

> **getAuditTrails**(`tenantId`, `filters`): `Promise`&lt;`never`[]&gt;

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

`Promise`&lt;`never`[]&gt;

##### getCustomerList()

> **getCustomerList**(`tenantId`, `filters`): `Promise`&lt;&#123; `data`: `never`[]; `total`: `number`; &#125; &#124; &#123; `data`: `RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;; `total`: `number`; &#125;&gt;

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

`Promise`&lt;&#123; `data`: `never`[]; `total`: `number`; &#125; &#124; &#123; `data`: `RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;; `total`: `number`; &#125;&gt;

##### getDcfCalculations()

> **getDcfCalculations**(`tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:241](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L241)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getDcfCashflows()

> **getDcfCashflows**(`tenantId`, `uploadId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:234](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L234)

###### Parameters

###### tenantId

`string`

###### uploadId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getDcfUploads()

> **getDcfUploads**(`tenantId`, `limit`, `offset`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:214](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L214)

###### Parameters

###### tenantId

`string`

###### limit

`number` = `50`

###### offset

`number` = `0`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getIaResultDetail()

> **getIaResultDetail**(`tenantId`, `filters`): `Promise`&lt;&#123; `details`: `never`[]; `header`: `null`; &#125; &#124; &#123; `details`: `object`[]; `header`: &#123; `accountId`: `number` &#124; `null`; `accountNumber`: `string`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `currency`: `string`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `string` &#124; `null`; `effInterestRate`: `number`; `iaId`: `number` &#124; `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `string` &#124; `null`; `pvDcfAmt`: `number`; `ratingCode`: `string`; &#125;; &#125;&gt;

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

`Promise`&lt;&#123; `details`: `never`[]; `header`: `null`; &#125; &#124; &#123; `details`: `object`[]; `header`: &#123; `accountId`: `number` &#124; `null`; `accountNumber`: `string`; `accruedInterest`: `number`; `carryingAmt`: `number`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number`; `createdby`: `string`; `createddate`: `string` &#124; `null`; `currency`: `string`; `dpd`: `number`; `eadAmt`: `number`; `eclIaAmt`: `number`; `effectiveDate`: `string` &#124; `null`; `effInterestRate`: `number`; `iaId`: `number` &#124; `null`; `interestRate`: `number`; `outstanding`: `number`; `pkid`: `number`; `prcDate`: `string` &#124; `null`; `pvDcfAmt`: `number`; `ratingCode`: `string`; &#125;; &#125;&gt;

##### getOverrides()

> **getOverrides**(`tenantId`, `filters`): `Promise`&lt;`object`[]&gt;

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

`Promise`&lt;`object`[]&gt;

##### getReports()

> **getReports**(`tenantId`, `filters`): `Promise`&lt;`object`[]&gt;

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

`Promise`&lt;`object`[]&gt;

##### getScenarios()

> **getScenarios**(`tenantId`, `filters`): `Promise`&lt;`object`[]&gt;

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

`Promise`&lt;`object`[]&gt;

##### getStagingAnalysis()

> **getStagingAnalysis**(`tenantId`, `filters`): `Promise`&lt;`RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;&gt;

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

`Promise`&lt;`RowList`&lt;`Record`&lt;`string`, `unknown`&gt;[]&gt;&gt;

##### getStagingSummary()

> **getStagingSummary**(`tenantId`): `Promise`&lt;`Record`&lt;`string`, `unknown`&gt;&gt;

Defined in: [src/services/individual-impairment.service.ts:1258](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1258)

###### Parameters

###### tenantId

`string`

###### Returns

`Promise`&lt;`Record`&lt;`string`, `unknown`&gt;&gt;

##### getWatchlist()

> **getWatchlist**(`tenantId`, `filters`): `Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

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

`Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

##### getWatchlistSummary()

> **getWatchlistSummary**(`tenantId`, `date?`): `Promise`&lt;&#123; `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1199](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1199)

###### Parameters

###### tenantId

`string`

###### date?

`string`

###### Returns

`Promise`&lt;&#123; `dataDate`: `unknown`; `impairedAccounts`: `number`; `pendingAssessments`: `number`; `totalAccounts`: `number`; `totalProvisions`: `number`; &#125;&gt;

##### rejectAssessment()

> **rejectAssessment**(`accountId`, `reason`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1075](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1075)

###### Parameters

###### accountId

`number`

###### reason

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

##### removeFromWatchlist()

> **removeFromWatchlist**(`accountId`, `tenantId`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/individual-impairment.service.ts:735](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L735)

###### Parameters

###### accountId

`string` | `number`

###### tenantId

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### submitAssessment()

> **submitAssessment**(`accountId`, `comments`, `userId`): `Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

Defined in: [src/services/individual-impairment.service.ts:1027](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1027)

###### Parameters

###### accountId

`number`

###### comments

`string`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `accountId`: `number`; `accountNumber`: `string`; `accruedInterest`: `string`; `carryingAmt`: `string`; `cifName`: `string`; `cifNumber`: `string`; `collectability`: `number` &#124; `null`; `createdby`: `string`; `createddate`: `string`; `createdhost`: `string`; `currency`: `string`; `dpd`: `number` &#124; `null`; `eadAmt`: `string`; `eclIaAmt`: `string`; `effDate`: `string`; `effInterestRate`: `number`; `iaId`: `number`; `impairedFlag`: `string`; `interestRate`: `number`; `method`: `string` &#124; `null`; `nOfScenario`: `number` &#124; `null`; `outstanding`: `string`; `pkid`: `bigint`; `plafond`: `string`; `poRate1`: `number`; `poRate2`: `number`; `poRate3`: `number`; `prcDate`: `string`; `pvDcfAmt`: `string`; `ratingCode`: `string` &#124; `null`; `reviewedby`: `string` &#124; `null`; `revieweddate`: `string` &#124; `null`; `reviewedhost`: `string` &#124; `null`; `scenarioId`: `number` &#124; `null`; `scName1`: `string` &#124; `null`; `scName2`: `string` &#124; `null`; `scName3`: `string` &#124; `null`; `status`: `number`; `triggerFilename`: `string` &#124; `null`; `triggerRemarks`: `string` &#124; `null`; `updatedby`: `string` &#124; `null`; `updateddate`: `string` &#124; `null`; `updatedhost`: `string` &#124; `null`; &#125;&gt;

##### updateScenarioStatus()

> **updateScenarioStatus**(`id`, `tenantId`, `status`, `approverId?`): `Promise`&lt;`never`[]&gt;

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

`Promise`&lt;`never`[]&gt;

## Variables

### individualImpairmentService

> `const` **individualImpairmentService**: [`IndividualImpairmentService`](#individualimpairmentservice)

Defined in: [src/services/individual-impairment.service.ts:1340](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/individual-impairment.service.ts#L1340)
