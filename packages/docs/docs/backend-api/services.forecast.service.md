[**Backend API Reference v1.0.0**](index.md)

***

# services/forecast.service

## Classes

### ForecastService

Defined in: [src/services/forecast.service.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/forecast.service.ts#L3)

#### Constructors

##### Constructor

> **new ForecastService**(): [`ForecastService`](#forecastservice)

###### Returns

[`ForecastService`](#forecastservice)

#### Methods

##### getForecasts()

> **getForecasts**(`tenantId`, `filters`): `Promise`\<`never`[]\>

Defined in: [src/services/forecast.service.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/forecast.service.ts#L5)

###### Parameters

###### tenantId

`string`

###### filters

###### limit?

`number`

###### offset?

`number`

###### Returns

`Promise`\<`never`[]\>

##### triggerForecast()

> **triggerForecast**(`tenantId`, `params`): `Promise`\<\{ `jobId`: `string`; `status`: `string`; `timestamp`: `string`; \}\>

Defined in: [src/services/forecast.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/forecast.service.ts#L13)

###### Parameters

###### tenantId

`string`

###### params

`any`

###### Returns

`Promise`\<\{ `jobId`: `string`; `status`: `string`; `timestamp`: `string`; \}\>

## Variables

### forecastService

> `const` **forecastService**: [`ForecastService`](#forecastservice)

Defined in: [src/services/forecast.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/forecast.service.ts#L25)
