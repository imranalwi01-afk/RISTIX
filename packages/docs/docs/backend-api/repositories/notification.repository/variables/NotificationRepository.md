[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: NotificationRepository

> `const` **NotificationRepository**: `object`

Defined in: src/repositories/notification.repository.ts:52

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

> **listForUser**(`input`): `Promise`\<[`UserNotificationRow`](../interfaces/UserNotificationRow.md)[]\>

#### Parameters

##### input

###### limit?

`number`

###### offset?

`number`

###### tenantId

`string`

###### unreadOnly?

`boolean`

###### userId

`string`

#### Returns

`Promise`\<[`UserNotificationRow`](../interfaces/UserNotificationRow.md)[]\>

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
