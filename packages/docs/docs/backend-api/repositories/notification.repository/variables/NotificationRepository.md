[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: NotificationRepository

> `const` **NotificationRepository**: `object`

Defined in: [src/repositories/notification.repository.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L82)

## Type Declaration

### createWithDeliveries()

> **createWithDeliveries**(`input`): `Promise`\<\{ `deliveries`: `object`[]; `notification`: \{ `actionUrl`: `string` \| `null`; `approvalRequestId`: `string` \| `null`; `createdAt`: `Date`; `entityId`: `string` \| `null`; `entityType`: `string` \| `null`; `id`: `string`; `message`: `string`; `metadata`: `unknown`; `severity`: `string`; `source`: `string`; `tenantId`: `string`; `title`: `string`; `triggeredBy`: `string` \| `null`; `type`: `string`; `workflowId`: `string` \| `null`; \}; \}\>

#### Parameters

##### input

[`CreateNotificationInput`](../interfaces/CreateNotificationInput.md)

#### Returns

`Promise`\<\{ `deliveries`: `object`[]; `notification`: \{ `actionUrl`: `string` \| `null`; `approvalRequestId`: `string` \| `null`; `createdAt`: `Date`; `entityId`: `string` \| `null`; `entityType`: `string` \| `null`; `id`: `string`; `message`: `string`; `metadata`: `unknown`; `severity`: `string`; `source`: `string`; `tenantId`: `string`; `title`: `string`; `triggeredBy`: `string` \| `null`; `type`: `string`; `workflowId`: `string` \| `null`; \}; \}\>

### getUnreadCount()

> **getUnreadCount**(`tenantId`, `userId`): `Promise`\<`number`\>

#### Parameters

##### tenantId

`string`

##### userId

`string`

#### Returns

`Promise`\<`number`\>

### listForUser()

> **listForUser**(`input`): `Promise`\<\{ `rows`: [`UserNotificationRow`](../interfaces/UserNotificationRow.md)[]; `total`: `number`; \}\>

#### Parameters

##### input

###### category?

[`NotificationCategory`](../type-aliases/NotificationCategory.md)

###### dateFrom?

`Date`

###### dateTo?

`Date`

###### limit?

`number`

###### offset?

`number`

###### readStatus?

[`NotificationReadStatus`](../type-aliases/NotificationReadStatus.md)

###### search?

`string`

###### tenantId

`string`

###### unreadOnly?

`boolean`

###### userId

`string`

#### Returns

`Promise`\<\{ `rows`: [`UserNotificationRow`](../interfaces/UserNotificationRow.md)[]; `total`: `number`; \}\>

### markAllAsRead()

> **markAllAsRead**(`input`): `Promise`\<`number`\>

#### Parameters

##### input

###### tenantId

`string`

###### userId

`string`

#### Returns

`Promise`\<`number`\>

### markAsRead()

> **markAsRead**(`input`): `Promise`\<`boolean`\>

#### Parameters

##### input

###### notificationId

`string`

###### tenantId

`string`

###### userId

`string`

#### Returns

`Promise`\<`boolean`\>

### markManyReadStatus()

> **markManyReadStatus**(`input`): `Promise`\<`number`\>

#### Parameters

##### input

###### notificationIds

`string`[]

###### read

`boolean`

###### tenantId

`string`

###### userId

`string`

#### Returns

`Promise`\<`number`\>
