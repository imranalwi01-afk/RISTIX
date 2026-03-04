[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Function: useNotifications()

> **useNotifications**(): `object`

Defined in: [hooks/useNotificationSocket.ts:248](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/useNotificationSocket.ts#L248)

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
