[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useNotifications()

> **useNotifications**(): `object`

Defined in: [hooks/useNotificationSocket.ts:208](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/hooks/useNotificationSocket.ts#L208)

Hook to get current notification state from context/store

## Returns

`object`

### acknowledgeNotification()

> **acknowledgeNotification**: (`notificationId`) => `void` = `socket.acknowledgeNotification`

#### Parameters

##### notificationId

`string`

#### Returns

`void`

### clearNotifications()

> **clearNotifications**: () => `void` = `socket.clearNotifications`

#### Returns

`void`

### isConnected

> **isConnected**: `boolean` = `socket.isConnected`

### isLoading

> **isLoading**: `boolean` = `socket.isLoading`

### loadError

> **loadError**: `string` \| `null` = `socket.loadError`

### notifications

> **notifications**: [`NotificationPayload`](../interfaces/NotificationPayload.md)[] = `socket.notifications`

### refreshNotifications()

> **refreshNotifications**: () => `Promise`\<`void`\> = `socket.refreshNotifications`

#### Returns

`Promise`\<`void`\>

### subscribeToApproval()

> **subscribeToApproval**: (`approvalRequestId`) => `void` = `socket.subscribeToApproval`

#### Parameters

##### approvalRequestId

`string`

#### Returns

`void`

### subscribeToECL()

> **subscribeToECL**: (`workflowId`) => `void` = `socket.subscribeToECL`

#### Parameters

##### workflowId

`string`

#### Returns

`void`

### unreadCount

> **unreadCount**: `number` = `socket.unreadCount`
