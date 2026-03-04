[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getMyNotifications()

> **getMyNotifications**(`input`): `Effect`\<\{ `rows`: `any`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/notifications.service.ts:107](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/notifications.service.ts#L107)

## Parameters

### input

#### category?

[`NotificationCategory`](../type-aliases/NotificationCategory.md)

#### dateFrom?

`Date`

#### dateTo?

`Date`

#### limit?

`number`

#### offset?

`number`

#### readStatus?

[`NotificationReadStatus`](../type-aliases/NotificationReadStatus.md)

#### search?

`string`

#### tenantId

`string`

#### unreadOnly?

`boolean`

#### userId

`string`

## Returns

`Effect`\<\{ `rows`: `any`[]; `total`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
