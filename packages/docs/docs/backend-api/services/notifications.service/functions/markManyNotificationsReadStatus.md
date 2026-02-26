[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: markManyNotificationsReadStatus()

> **markManyNotificationsReadStatus**(`input`): `Effect`\<\{ `updatedCount`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/notifications.service.ts:150](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/notifications.service.ts#L150)

## Parameters

### input

#### notificationIds

`string`[]

#### read

`boolean`

#### tenantId

`string`

#### userId

`string`

## Returns

`Effect`\<\{ `updatedCount`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
