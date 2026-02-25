[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useNotificationSocket()

> **useNotificationSocket**(): `object`

Defined in: [hooks/useNotificationSocket.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/hooks/useNotificationSocket.ts#L46)

## Returns

### acknowledgeNotification()

> **acknowledgeNotification**: (`notificationId`) => `void`

Acknowledge notification (mark as read)

#### Parameters

##### notificationId

`string`

#### Returns

`void`

### clearNotifications()

> **clearNotifications**: () => `void`

Clear notifications

#### Returns

`void`

### isConnected

> **isConnected**: `boolean`

### isLoading

> **isLoading**: `boolean`

### loadError

> **loadError**: `string` \| `null`

### notifications

> **notifications**: [`NotificationPayload`](../interfaces/NotificationPayload.md)[]

### refreshNotifications()

> **refreshNotifications**: () => `Promise`\<`void`\> = `loadPersistedNotifications`

#### Returns

`Promise`\<`void`\>

### subscribeToApproval()

> **subscribeToApproval**: (`approvalRequestId`) => `void`

Subscribe to approval updates

#### Parameters

##### approvalRequestId

`string`

#### Returns

`void`

### subscribeToECL()

> **subscribeToECL**: (`workflowId`) => `void`

Subscribe to ECL calculation updates

#### Parameters

##### workflowId

`string`

#### Returns

`void`

### unreadCount

> **unreadCount**: `number`
