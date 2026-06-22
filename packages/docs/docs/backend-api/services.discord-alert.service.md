[**Backend API Reference v1.0.0**](index.md)

***

# services/discord-alert.service

## Interfaces

### DiscordAlertPayload

Defined in: [src/services/discord-alert.service.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L6)

#### Properties

##### context?

> `optional` **context**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/services/discord-alert.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L14)

##### event

> **event**: `string`

Defined in: [src/services/discord-alert.service.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L9)

##### message

> **message**: `string`

Defined in: [src/services/discord-alert.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L10)

##### requestId?

> `optional` **requestId**: `string`

Defined in: [src/services/discord-alert.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L11)

##### severity

> **severity**: [`AlertSeverity`](#alertseverity)

Defined in: [src/services/discord-alert.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L8)

##### source

> **source**: `"backend"` &#124; `"frontend"` &#124; `"worker"` &#124; `"system"`

Defined in: [src/services/discord-alert.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L7)

##### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/discord-alert.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L12)

##### userId?

> `optional` **userId**: `string`

Defined in: [src/services/discord-alert.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L13)

## Type Aliases

### AlertSeverity

> **AlertSeverity** = `"info"` &#124; `"warn"` &#124; `"error"` &#124; `"critical"`

Defined in: [src/services/discord-alert.service.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L4)

## Functions

### sendDiscordAlert()

> **sendDiscordAlert**(`payload`): `Promise`&lt;`boolean`&gt;

Defined in: [src/services/discord-alert.service.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/discord-alert.service.ts#L71)

#### Parameters

##### payload

[`DiscordAlertPayload`](#discordalertpayload)

#### Returns

`Promise`&lt;`boolean`&gt;
