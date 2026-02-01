[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: Ifrs9ReportsService

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L42)

## Constructors

### Constructor

> **new Ifrs9ReportsService**(): `Ifrs9ReportsService`

#### Returns

`Ifrs9ReportsService`

## Methods

### getEADModel()

> **getEADModel**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:470](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L470)

Get EAD Model Report (Payment Average by Tenor)
SQL: SELECT TENOR AS [LT/MONTH], COUNTER AS SEQ, PAYM_AVG
FROM FRS9_IMP_CA_EAD_PAYM_AVG A 
WHERE A.PRC_DATE =

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`EADModelParams`](../interfaces/EADModelParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

#### DATE

AND A.SEGMENT_ID = @EAD_CONFIG_ID
PIVOT (SUM(PAYM_AVG) FOR SEQ IN (...))

***

### getEADPaymentAverage()

> **getEADPaymentAverage**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:531](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L531)

Get EAD Payment Average by Tenor
Queries: frs9_imp_ca_ead_paym_avg with pivot on counter

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`EADModelParams`](../interfaces/EADModelParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getECLMovement()

> **getECLMovement**(`tenantId`, `params?`): `Promise`\<\{ `data`: `object`[]; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:586](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L586)

Get ECL Movement Report
Calculates Opening Balance, Provisions, Releases, Writes-offs, and Closing Balance

#### Parameters

##### tenantId

`string`

##### params?

###### prc_date

`string`

###### segment_id?

`number`

###### stage?

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; \}\>

***

### getECLResult()

> **getECLResult**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:190](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L190)

Get ECL Result Report
SQL Script: SELECT SUM(OUTSTANDING), SUM(ECL_CA_ONBS_AMT), SUM(ECL_FINAL_AMT), etc.
FROM FRS9_MASTER_ACCOUNT WHERE PRC_DATE =

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`ECLResultParams`](../interfaces/ECLResultParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

#### DATE

AND SEGMENT_ID =

#### SEGMENT

AND STAGE =

#### STAGE

GROUP BY PRC_DATE, BRANCH_CODE, SEGMENT_ID, GROUP_SEGMENT, SEGMENT, SUB_SEGMENT, CURRENCY, etc.

***

### getGCAMovement()

> **getGCAMovement**(`tenantId`, `params?`): `Promise`\<\{ `data`: (\{ `closing_gca`: `number`; `current_stage`: `number`; `new_business`: `number`; `opening_gca`: `number`; `repayments`: `number`; `stage1_to_stage2`: `number`; `stage2_to_stage1`: `number`; `write_offs`: `number`; \} \| \{ `closing_gca`: `number`; `current_stage`: `number`; `new_business?`: `undefined`; `opening_gca`: `number`; `repayments?`: `undefined`; `stage1_to_stage2?`: `undefined`; `stage2_to_stage1?`: `undefined`; `write_offs?`: `undefined`; \})[]; `page?`: `undefined`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `data`: `never`[]; `page`: `any`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:650](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L650)

Get GCA Movement Report
Calculates Gross Carrying Amount movement

#### Parameters

##### tenantId

`string`

##### params?

###### prc_date

`string`

###### segment_id?

`number`

###### stage?

`string`

#### Returns

`Promise`\<\{ `data`: (\{ `closing_gca`: `number`; `current_stage`: `number`; `new_business`: `number`; `opening_gca`: `number`; `repayments`: `number`; `stage1_to_stage2`: `number`; `stage2_to_stage1`: `number`; `write_offs`: `number`; \} \| \{ `closing_gca`: `number`; `current_stage`: `number`; `new_business?`: `undefined`; `opening_gca`: `number`; `repayments?`: `undefined`; `stage1_to_stage2?`: `undefined`; `stage2_to_stage1?`: `undefined`; `write_offs?`: `undefined`; \})[]; `page?`: `undefined`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `data`: `never`[]; `page`: `any`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getLifetimeLGDDetail()

> **getLifetimeLGDDetail**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:347](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L347)

Get Lifetime LGD Detail Report (Account Level with Recovery Pivot)
Queries: frs9_account_id + frs9_imp_ca_lgd_data + frs9_imp_ca_lgd_rec_d
Implements pivot on SEQ for recovery sequences

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`LifetimeLGDParams`](../interfaces/LifetimeLGDParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getLifetimeLGDSummary()

> **getLifetimeLGDSummary**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:422](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L422)

Get Lifetime LGD Summary Report
Queries: frs9_imp_ca_lgd_h + frs9_imp_ca_lgd_config

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`LifetimeLGDParams`](../interfaces/LifetimeLGDParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getLifetimePDMonthly()

> **getLifetimePDMonthly**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L145)

Get Lifetime PD Report (Monthly)
Queries: frs9_imp_ca_pd_structure with monthly pivot transformation

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`LifetimePDParams`](../interfaces/LifetimePDParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getLifetimePDYearly()

> **getLifetimePDYearly**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:102](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L102)

Get Lifetime PD Report (Yearly)
Queries: frs9_imp_ca_pd_structure with pivot transformation

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

[`LifetimePDParams`](../interfaces/LifetimePDParams.md)

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getNominativeReport()

> **getNominativeReport**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-reports.service.ts:269](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-reports.service.ts#L269)

Get Nominative Report (Detailed Account Level)
Queries: frs9_master_account - Account level IFRS9 data

#### Parameters

##### tenantId

`string`

##### page

`number`

##### limit

`number`

##### params?

###### branch_code?

`string`

###### prc_date?

`string`

###### segment_id?

`number`

###### stage?

`string`

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>
