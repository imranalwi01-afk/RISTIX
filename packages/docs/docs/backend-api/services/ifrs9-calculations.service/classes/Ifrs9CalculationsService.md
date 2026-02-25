[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: Ifrs9CalculationsService

Defined in: [src/services/ifrs9-calculations.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L9)

## Constructors

### Constructor

> **new Ifrs9CalculationsService**(): `Ifrs9CalculationsService`

#### Returns

`Ifrs9CalculationsService`

## Methods

### getAvailableDates()

> **getAvailableDates**(`tenantId`): `Promise`\<`string`[]\>

Defined in: [src/services/ifrs9-calculations.service.ts:411](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L411)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<`string`[]\>

***

### getBatches()

> **getBatches**(`tenantId`): `Promise`\<\{ `batches`: `object`[]; \}\>

Defined in: [src/services/ifrs9-calculations.service.ts:155](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L155)

#### Parameters

##### tenantId

`string`

#### Returns

`Promise`\<\{ `batches`: `object`[]; \}\>

***

### getBatchResults()

> **getBatchResults**(`tenantId`, `processDate`): `Promise`\<\{ `data`: `object`[]; \}\>

Defined in: [src/services/ifrs9-calculations.service.ts:380](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L380)

#### Parameters

##### tenantId

`string`

##### processDate

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; \}\>

***

### getPortfolioTrend()

> **getPortfolioTrend**(`tenantId`, `endDate?`): `Promise`\<`object`[]\>

Defined in: [src/services/ifrs9-calculations.service.ts:304](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L304)

#### Parameters

##### tenantId

`string`

##### endDate?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getSummary()

> **getSummary**(`tenantId`, `requestedDate?`): `Promise`\<\{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count`: `number`; `stage1ECL`: `number`; `stage2Count`: `number`; `stage2ECL`: `number`; `stage3Count`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \} \| \{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count?`: `undefined`; `stage1ECL`: `number`; `stage2Count?`: `undefined`; `stage2ECL`: `number`; `stage3Count?`: `undefined`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \}\>

Defined in: [src/services/ifrs9-calculations.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L11)

#### Parameters

##### tenantId

`string`

##### requestedDate?

`string`

#### Returns

`Promise`\<\{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count`: `number`; `stage1ECL`: `number`; `stage2Count`: `number`; `stage2ECL`: `number`; `stage3Count`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \} \| \{ `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count?`: `undefined`; `stage1ECL`: `number`; `stage2Count?`: `undefined`; `stage2ECL`: `number`; `stage3Count?`: `undefined`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; \}\>

***

### runCalculation()

> **runCalculation**(`tenantId`, `config`): `Promise`\<\{ `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `success`: `boolean`; \} \| \{ `jobId?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>

Defined in: [src/services/ifrs9-calculations.service.ts:183](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/ifrs9-calculations.service.ts#L183)

#### Parameters

##### tenantId

`string`

##### config

`any`

#### Returns

`Promise`\<\{ `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `success`: `boolean`; \} \| \{ `jobId?`: `undefined`; `message`: `string`; `success`: `boolean`; \}\>
