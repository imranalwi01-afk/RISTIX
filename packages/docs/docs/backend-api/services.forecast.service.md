[**Backend API Reference v1.0.0**](index.md)

***

# services/forecast.service

## Classes

### ForecastService

Defined in: [src/services/forecast.service.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/forecast.service.ts#L3)

#### Constructors

##### Constructor

> **new ForecastService**(): [`ForecastService`](#forecastservice)

###### Returns

[`ForecastService`](#forecastservice)

#### Methods

##### getForecasts()

> **getForecasts**(`tenantId`, `filters`): `Promise`&lt;`never`[]&gt;

Defined in: [src/services/forecast.service.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/forecast.service.ts#L5)

###### Parameters

###### tenantId

`string`

###### filters

###### limit?

`number`

###### offset?

`number`

###### Returns

`Promise`&lt;`never`[]&gt;

##### triggerForecast()

> **triggerForecast**(`tenantId`, `params`): `Promise`&lt;&#123; `jobId`: `string`; `status`: `string`; `timestamp`: `string`; &#125;&gt;

Defined in: [src/services/forecast.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/forecast.service.ts#L13)

###### Parameters

###### tenantId

`string`

###### params

`any`

###### Returns

`Promise`&lt;&#123; `jobId`: `string`; `status`: `string`; `timestamp`: `string`; &#125;&gt;

## Variables

### forecastService

> `const` **forecastService**: [`ForecastService`](#forecastservice)

Defined in: [src/services/forecast.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/forecast.service.ts#L25)
