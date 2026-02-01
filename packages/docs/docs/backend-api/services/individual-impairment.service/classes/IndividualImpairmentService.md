[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: IndividualImpairmentService

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L28)

## Constructors

### Constructor

> **new IndividualImpairmentService**(): `IndividualImpairmentService`

#### Returns

`IndividualImpairmentService`

## Methods

### addToWatchlist()

> **addToWatchlist**(`data`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:375](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L375)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### calculateDcf()

> **calculateDcf**(`tenantId`, `params`): `Promise`\<\{ `account_id`: `any`; `assumptions`: `any`; `details`: `object`[]; `lgd`: `number`; `outstanding`: `number`; `presentValue`: `number`; `recommendedProvision`: `number`; `savedId`: `bigint` \| `null`; `scenario`: `any`; \}\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:201](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L201)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:441](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L441)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createAuditLog()

> **createAuditLog**(`entry`): `Promise`\<`never`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L114)

#### Parameters

##### entry

`any`

#### Returns

`Promise`\<`never`[]\>

***

### createDcfCashflows()

> **createDcfCashflows**(`data`): `Promise`\<`never`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:197](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L197)

#### Parameters

##### data

`any`[]

#### Returns

`Promise`\<`never`[]\>

***

### createDcfUpload()

> **createDcfUpload**(`data`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:170](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L170)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createOverride()

> **createOverride**(`data`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:484](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L484)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createReport()

> **createReport**(`data`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L138)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`object`[]\>

***

### createScenario()

> **createScenario**(`data`): `Promise`\<`never`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:150](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L150)

#### Parameters

##### data

`any`

#### Returns

`Promise`\<`never`[]\>

***

### getAssessment()

> **getAssessment**(`tenantId`, `accountId`): `Promise`\<\{ `account_id`: `number`; `account_number`: `string`; `analyst_comments`: `string` \| `null`; `approval_status`: `string`; `assessment_basis`: `string`; `cif_name`: `string`; `cif_number`: `string`; `collectability`: `number` \| `null`; `createdby`: `string`; `createddate`: `string`; `currency`: `string`; `dpd`: `number` \| `null`; `eff_date`: `string`; `eff_interest_rate`: `number`; `ia_id`: `number`; `impaired_flag`: `string`; `impairment_reason`: `string` \| `null`; `interest_rate`: `number`; `method`: `string` \| `null`; `outstanding_balance`: `number`; `pkid`: `bigint`; `prc_date`: `string`; `previous_stage`: `number`; `rating_code`: `string` \| `null`; `reviewer_comments`: `null`; `stage`: `number`; `supporting_documents`: `string`[]; `updatedby`: `string` \| `null`; `updateddate`: `string` \| `null`; \} \| `null`\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:396](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L396)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L38)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L34)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:189](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L189)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getDcfCashflows()

> **getDcfCashflows**(`tenantId`, `uploadId`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:182](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L182)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:162](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L162)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:451](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L451)

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

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:122](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L122)

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

> **getScenarios**(`tenantId`, `filters`): `Promise`\<`never`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:146](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L146)

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

`Promise`\<`never`[]\>

***

### getWatchlist()

> **getWatchlist**(`tenantId`, `filters`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:269](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L269)

#### Parameters

##### tenantId

`string`

##### filters

###### limit?

`number`

###### offset?

`number`

###### segment?

`string`

###### status?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### removeFromWatchlist()

> **removeFromWatchlist**(`id`, `tenantId`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:386](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L386)

#### Parameters

##### id

`string`

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### updateScenarioStatus()

> **updateScenarioStatus**(`id`, `tenantId`, `status`, `approverId?`): `Promise`\<`never`[]\>

Defined in: [packages/new-backend/src/services/individual-impairment.service.ts:154](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/individual-impairment.service.ts#L154)

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

`Promise`\<`never`[]\>
