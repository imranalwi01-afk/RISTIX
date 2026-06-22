[**Backend API Reference v1.0.0**](index.md)

***

# services/ifrs9-calculations.service

## Classes

### Ifrs9CalculationsService

Defined in: [src/services/ifrs9-calculations.service.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L57)

#### Constructors

##### Constructor

> **new Ifrs9CalculationsService**(): [`Ifrs9CalculationsService`](#ifrs9calculationsservice)

###### Returns

[`Ifrs9CalculationsService`](#ifrs9calculationsservice)

#### Methods

##### getAvailableDates()

> **getAvailableDates**(`tenantId`, `mode?`, `groupBy?`): `Promise`&lt;`string`[] &#124; `Record`&lt;`string`, `string`[]&gt;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:883](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L883)

###### Parameters

###### tenantId

`string`

###### mode?

`string`

###### groupBy?

`string`

###### Returns

`Promise`&lt;`string`[] &#124; `Record`&lt;`string`, `string`[]&gt;&gt;

##### getBatches()

> **getBatches**(`tenantId`, `mode?`): `Promise`&lt;&#123; `batches`: `object`[]; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:421](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L421)

###### Parameters

###### tenantId

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;&#123; `batches`: `object`[]; &#125;&gt;

##### getBatchResults()

> **getBatchResults**(`tenantId`, `processDate`, `mode?`): `Promise`&lt;&#123; `data`: `object`[]; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:844](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L844)

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

> **getPortfolioTrend**(`tenantId`, `endDate?`, `_mode?`): `Promise`&lt;`DashboardTrendPayload`&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:736](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L736)

###### Parameters

###### tenantId

`string`

###### endDate?

`string`

###### \_mode?

`string`

###### Returns

`Promise`&lt;`DashboardTrendPayload`&gt;

##### getSummary()

> **getSummary**(`tenantId`, `requestedDate?`, `mode?`): `Promise`&lt;`DashboardSummaryPayload`&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:253](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L253)

###### Parameters

###### tenantId

`string`

###### requestedDate?

`string`

###### mode?

`string`

###### Returns

`Promise`&lt;`DashboardSummaryPayload`&gt;

##### runCalculation()

> **runCalculation**(`tenantId`, `config`): `Promise`&lt;&#123; `activeExecutionId`: `string`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:605](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L605)

###### Parameters

###### tenantId

`string`

###### config

`any`

###### Returns

`Promise`&lt;&#123; `activeExecutionId`: `string`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

##### runPreviewCalculation()

> **runPreviewCalculation**(`tenantId`, `config`): `Promise`&lt;&#123; `activeExecutionId`: `string`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime`: `string` &#124; `null`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader`: `string`; `executionId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `jobId`: `` `${string}-${string}-${string}-${string}-${string}` ``; `message`: `string`; `processDate`: `any`; `startTime?`: `undefined`; `status`: `string`; `success`: `boolean`; &#125; &#124; &#123; `activeExecutionId?`: `undefined`; `configHeader?`: `undefined`; `executionId?`: `undefined`; `jobId?`: `undefined`; `message`: `string`; `processDate?`: `undefined`; `startTime?`: `undefined`; `status?`: `undefined`; `success`: `boolean`; &#125;&gt;

Defined in: [src/services/ifrs9-calculations.service.ts:445](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L445)

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

Defined in: [src/services/ifrs9-calculations.service.ts:959](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/ifrs9-calculations.service.ts#L959)
