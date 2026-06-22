[**Backend API Reference v1.0.0**](index.md)

***

# services/ifrs9-calculations.service

## Classes

### Ifrs9CalculationsService

Defined in: [src/services/ifrs9-calculations.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L8)

#### Constructors

##### Constructor

> **new Ifrs9CalculationsService**(): [`Ifrs9CalculationsService`](#ifrs9calculationsservice)

###### Returns

[`Ifrs9CalculationsService`](#ifrs9calculationsservice)

#### Methods

##### getAvailableDates()

> **getAvailableDates**(`tenantId`, `mode?`): `Promise`&lt;`string`[]&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:814](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L814)

###### Parameters

###### tenantId

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;`string`[]&gt;

##### getBatches()

> **getBatches**(`tenantId`, `mode?`): `Promise`&lt;&#123; `batches`: `object`[]; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:382](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L382)

###### Parameters

###### tenantId

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;&#123; `batches`: `object`[]; &#125;&gt;

##### getBatchResults()

> **getBatchResults**(`tenantId`, `processDate`, `mode?`): `Promise`&lt;&#123; `data`: `object`[]; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:775](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L775)

###### Parameters

###### tenantId

`string`

###### processDate

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;&#123; `data`: `object`[]; &#125;&gt;

##### getPortfolioTrend()

> **getPortfolioTrend**(`tenantId`, `endDate?`, `_mode?`): `Promise`&lt;`object`[]&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:691](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L691)

###### Parameters

###### tenantId

`string`

###### endDate?

`string`

###### \_mode?

`string`

###### Returns

`Promise`&lt;`object`[]&gt;

##### getSummary()

> **getSummary**(`tenantId`, `requestedDate?`, `mode?`): `Promise`&lt;&#123; `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count`: `number`; `stage1ECL`: `number`; `stage2Count`: `number`; `stage2ECL`: `number`; `stage3Count`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; &#125; &#124; &#123; `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count?`: `undefined`; `stage1ECL`: `number`; `stage2Count?`: `undefined`; `stage2ECL`: `number`; `stage3Count?`: `undefined`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L145)

###### Parameters

###### tenantId

`string`

###### requestedDate?

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;&#123; `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count`: `number`; `stage1ECL`: `number`; `stage2Count`: `number`; `stage2ECL`: `number`; `stage3Count`: `number`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; &#125; &#124; &#123; `activeAccounts`: `number`; `coverageRatio`: `number`; `currency`: `string`; `eclRate`: `number`; `impairedRatio`: `number`; `isFallback`: `boolean`; `lastUpdated`: `string`; `stage1Count?`: `undefined`; `stage1ECL`: `number`; `stage2Count?`: `undefined`; `stage2ECL`: `number`; `stage3Count?`: `undefined`; `stage3ECL`: `number`; `totalAccounts`: `number`; `totalECL`: `number`; `totalExposure`: `number`; `totalPortfolio`: `number`; &#125;&gt;

##### runCalculation()

> **runCalculation**(`tenantId`, `config`): `Promise`&lt;&#123; `activeExecutionId`: `string`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:563](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L563)

###### Parameters

###### tenantId

`string`

###### config

`any`

###### Returns

`Promise`&lt;&#123; `activeExecutionId`: `string`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

##### runPreviewCalculation()

> **runPreviewCalculation**(`tenantId`, `config`): `Promise`&lt;&#123; `activeExecutionId`: `string`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader`: `string`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:406](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L406)

###### Parameters

###### tenantId

`string`

###### config

`any`

###### Returns

`Promise`&lt;&#123; `activeExecutionId`: `string`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader`: `string`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

## Variables

### ifrs9CalculationsService

> `const` **ifrs9CalculationsService**: [`Ifrs9CalculationsService`](#ifrs9calculationsservice)

Defined in: [src/services/ifrs9-calculations.service.ts:886](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/ifrs9-calculations.service.ts#L886)
