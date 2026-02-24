[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: Ifrs9ReportsService

Defined in: [src/services/ifrs9-reports.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L47)

## Constructors

### Constructor

> **new Ifrs9ReportsService**(): `Ifrs9ReportsService`

#### Returns

`Ifrs9ReportsService`

## Methods

### getEADModel()

> **getEADModel**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:568](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L568)

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

Defined in: [src/services/ifrs9-reports.service.ts:642](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L642)

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

Defined in: [src/services/ifrs9-reports.service.ts:710](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L710)

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

`string` \| `string`[]

#### Returns

`Promise`\<\{ `data`: `object`[]; \}\>

***

### getECLResult()

> **getECLResult**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:225](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L225)

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

> **getGCAMovement**(`tenantId`, `params?`): `Promise`\<\{ `data`: (\{ `closing_gca`: `number`; `current_stage`: `number`; `new_business`: `number`; `opening_gca`: `number`; `repayments`: `number`; `stage1_to_stage2`: `number`; `stage2_to_stage1`: `number`; `write_offs`: `number`; \} \| \{ `closing_gca`: `number`; `current_stage`: `number`; `new_business?`: `undefined`; `opening_gca`: `number`; `repayments?`: `undefined`; `stage1_to_stage2?`: `undefined`; `stage2_to_stage1?`: `undefined`; `write_offs?`: `undefined`; \})[]; `page?`: `undefined`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `data`: `never`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:789](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L789)

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

`string` \| `string`[]

#### Returns

`Promise`\<\{ `data`: (\{ `closing_gca`: `number`; `current_stage`: `number`; `new_business`: `number`; `opening_gca`: `number`; `repayments`: `number`; `stage1_to_stage2`: `number`; `stage2_to_stage1`: `number`; `write_offs`: `number`; \} \| \{ `closing_gca`: `number`; `current_stage`: `number`; `new_business?`: `undefined`; `opening_gca`: `number`; `repayments?`: `undefined`; `stage1_to_stage2?`: `undefined`; `stage2_to_stage1?`: `undefined`; `write_offs?`: `undefined`; \})[]; `page?`: `undefined`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `data`: `never`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

***

### getLifetimeLGDDetail()

> **getLifetimeLGDDetail**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:426](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L426)

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

Defined in: [src/services/ifrs9-reports.service.ts:514](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L514)

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

Defined in: [src/services/ifrs9-reports.service.ts:172](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L172)

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

Defined in: [src/services/ifrs9-reports.service.ts:121](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L121)

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

> **getNominativeReport**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `summary`: \{ `totalECL`: `number`; `totalOutstanding`: `number`; \}; `total`: `number`; `totalPages`: `number`; \} \| \{ `data`: `never`[]; `page`: `number`; `summary?`: `undefined`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:317](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/ifrs9-reports.service.ts#L317)

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

`string`[]

###### prc_date?

`string`

###### segment?

`string`[]

###### stage?

`string` \| `string`[]

#### Returns

`Promise`\<\{ `data`: `any`[]; `page`: `number`; `summary`: \{ `totalECL`: `number`; `totalOutstanding`: `number`; \}; `total`: `number`; `totalPages`: `number`; \} \| \{ `data`: `never`[]; `page`: `number`; `summary?`: `undefined`; `total`: `number`; `totalPages`: `number`; \}\>
