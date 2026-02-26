[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: Ifrs9ReportsService

Defined in: [src/services/ifrs9-reports.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L47)

## Constructors

### Constructor

> **new Ifrs9ReportsService**(): `Ifrs9ReportsService`

#### Returns

`Ifrs9ReportsService`

## Methods

### getEADModel()

> **getEADModel**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:574](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L574)

Get EAD Model Report (Payment Average by Tenor)
SQL: 
```sql
SELECT TENOR AS [LT/MONTH], COUNTER AS SEQ, PAYM_AVG
FROM FRS9_IMP_CA_EAD_PAYM_AVG A 
WHERE A.PRC_DATE = :PRC_DATE AND A.SEGMENT_ID = :EAD_CONFIG_ID
PIVOT (SUM(PAYM_AVG) FOR SEQ IN (...))
```

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

### getEADPaymentAverage()

> **getEADPaymentAverage**(`tenantId`, `page`, `limit`, `params?`): `Promise`\<\{ `data`: `any`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:648](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L648)

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

Defined in: [src/services/ifrs9-reports.service.ts:716](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L716)

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

Defined in: [src/services/ifrs9-reports.service.ts:228](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L228)

Get ECL Result Report
SQL Script:
```sql
SELECT SUM(OUTSTANDING), SUM(ECL_CA_ONBS_AMT), SUM(ECL_FINAL_AMT), etc.
FROM FRS9_MASTER_ACCOUNT WHERE PRC_DATE = :PRC_DATE AND SEGMENT_ID = :SEGMENT_ID AND STAGE = :STAGE
GROUP BY PRC_DATE, BRANCH_CODE, SEGMENT_ID, GROUP_SEGMENT, SEGMENT, SUB_SEGMENT, CURRENCY, etc.
```

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

***

### getGCAMovement()

> **getGCAMovement**(`tenantId`, `params?`): `Promise`\<\{ `data`: (\{ `closing_gca`: `number`; `current_stage`: `number`; `new_business`: `number`; `opening_gca`: `number`; `repayments`: `number`; `stage1_to_stage2`: `number`; `stage2_to_stage1`: `number`; `write_offs`: `number`; \} \| \{ `closing_gca`: `number`; `current_stage`: `number`; `new_business?`: `undefined`; `opening_gca`: `number`; `repayments?`: `undefined`; `stage1_to_stage2?`: `undefined`; `stage2_to_stage1?`: `undefined`; `write_offs?`: `undefined`; \})[]; `page?`: `undefined`; `total?`: `undefined`; `totalPages?`: `undefined`; \} \| \{ `data`: `never`[]; `page`: `number`; `total`: `number`; `totalPages`: `number`; \}\>

Defined in: [src/services/ifrs9-reports.service.ts:795](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L795)

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

Defined in: [src/services/ifrs9-reports.service.ts:429](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L429)

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

Defined in: [src/services/ifrs9-reports.service.ts:517](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L517)

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

Defined in: [src/services/ifrs9-reports.service.ts:172](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L172)

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

Defined in: [src/services/ifrs9-reports.service.ts:121](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L121)

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

Defined in: [src/services/ifrs9-reports.service.ts:320](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-reports.service.ts#L320)

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
