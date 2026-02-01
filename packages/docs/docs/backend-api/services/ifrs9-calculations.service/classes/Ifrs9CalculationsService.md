[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: Ifrs9CalculationsService

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L8)

## Constructors

### Constructor

> **new Ifrs9CalculationsService**(): `Ifrs9CalculationsService`

#### Returns

`Ifrs9CalculationsService`

## Methods

### getBatches()

> **getBatches**(`tenantId`): `Promise`\<\{ `batches`: `object`[]; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:72](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L72)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<\{ `batches`: `object`[]; \}\>

***

### getBatchResults()

> **getBatchResults**(`tenantId`, `processDate`): `Promise`\<\{ `data`: `object`[]; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:167](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L167)

#### Parameters

##### tenantId

`string`

##### processDate

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; \}\>

***

### getPortfolioTrend()

> **getPortfolioTrend**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:137](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L137)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getSummary()

> **getSummary**(`tenantId`): `Promise`\<\{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `impairedRatio`: `number`; `lastUpdated`: `string`; `stage1ECL`: `number`; `stage2ECL`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L10)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<\{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `impairedRatio`: `number`; `lastUpdated`: `string`; `stage1ECL`: `number`; `stage2ECL`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \}\>

***

### runCalculation()

> **runCalculation**(`tenantId`, `config`): `Promise`\<\{ `jobId`: `string`; `message`: `string`; `success`: `boolean`; \} \| \{ `jobId?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Defined in: [packages/new-backend/src/services/ifrs9-calculations.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/ifrs9-calculations.service.ts#L98)

#### Parameters

##### tenantId

`string`

##### config

`any`

#### Returns

`Promise`\<\{ `jobId`: `string`; `message`: `string`; `success`: `boolean`; \} \| \{ `jobId?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>
