[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useNotificationSocket

## Interfaces

### NotificationPayload

Defined in: [hooks/useNotificationSocket.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L8)

#### Properties

##### actionUrl?

> `optional` **actionUrl**: `string`

Defined in: [hooks/useNotificationSocket.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L19)

##### category

> **category**: `"analytics"` \| `"system"` \| `"approval"` \| `"workflow"`

Defined in: [hooks/useNotificationSocket.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L11)

##### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Defined in: [hooks/useNotificationSocket.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L18)

##### deliveryStatus?

> `optional` **deliveryStatus**: `string`

Defined in: [hooks/useNotificationSocket.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L21)

##### id

> **id**: `string`

Defined in: [hooks/useNotificationSocket.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L9)

##### message

> **message**: `string`

Defined in: [hooks/useNotificationSocket.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L15)

##### readAt?

> `optional` **readAt**: `string` \| `null`

Defined in: [hooks/useNotificationSocket.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L20)

##### severity

> **severity**: `"error"` \| `"success"` \| `"info"` \| `"warning"`

Defined in: [hooks/useNotificationSocket.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L16)

##### tenantId

> **tenantId**: `string`

Defined in: [hooks/useNotificationSocket.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L13)

##### timestamp

> **timestamp**: `string`

Defined in: [hooks/useNotificationSocket.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L17)

##### title

> **title**: `string`

Defined in: [hooks/useNotificationSocket.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L14)

##### type

> **type**: `"APPROVAL_PENDING"` \| `"APPROVAL_APPROVED"` \| `"APPROVAL_REJECTED"` \| `"ECL_STARTED"` \| `"ECL_COMPLETED"` \| `"ECL_FAILED"` \| `"COMPLIANCE_ALERT"`

Defined in: [hooks/useNotificationSocket.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L10)

##### workflowId

> **workflowId**: `string`

Defined in: [hooks/useNotificationSocket.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L12)

## Functions

### useNotifications()

> **useNotifications**(): `object`

Defined in: [hooks/useNotificationSocket.ts:248](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L248)

Hook to get current notification state from context/store

#### Returns

`object`

##### acknowledgeNotification()

> **acknowledgeNotification**: (`notificationId`) => `void` = `socket.acknowledgeNotification`

###### Parameters

###### notificationId

`string`

###### Returns

`void`

##### clearNotifications()

> **clearNotifications**: () => `void` = `socket.clearNotifications`

###### Returns

`void`

##### isConnected

> **isConnected**: `boolean` = `socket.isConnected`

##### isLoading

> **isLoading**: `boolean` = `socket.isLoading`

##### loadError

> **loadError**: `string` \| `null` = `socket.loadError`

##### notifications

> **notifications**: [`NotificationPayload`](#notificationpayload)[] = `socket.notifications`

##### refreshNotifications()

> **refreshNotifications**: () => `Promise`\<`void`\> = `socket.refreshNotifications`

###### Returns

`Promise`\<`void`\>

##### subscribeToApproval()

> **subscribeToApproval**: (`approvalRequestId`) => `void` = `socket.subscribeToApproval`

###### Parameters

###### approvalRequestId

`string`

###### Returns

`void`

##### subscribeToECL()

> **subscribeToECL**: (`workflowId`) => `void` = `socket.subscribeToECL`

###### Parameters

###### workflowId

`string`

###### Returns

`void`

##### unreadCount

> **unreadCount**: `number` = `socket.unreadCount`

***

### useNotificationSocket()

> **useNotificationSocket**(): `object`

Defined in: [hooks/useNotificationSocket.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/hooks/useNotificationSocket.ts#L85)

#### Returns

##### acknowledgeNotification()

> **acknowledgeNotification**: (`notificationId`) => `void`

Acknowledge notification (mark as read)

###### Parameters

###### notificationId

`string`

###### Returns

`void`

##### clearNotifications()

> **clearNotifications**: () => `void`

Clear notifications

###### Returns

`void`

##### isConnected

> **isConnected**: `boolean`

##### isLoading

> **isLoading**: `boolean`

##### loadError

> **loadError**: `string` \| `null`

##### notifications

> **notifications**: [`NotificationPayload`](#notificationpayload)[]

##### refreshNotifications()

> **refreshNotifications**: () => `Promise`\<`void`\> = `loadPersistedNotifications`

###### Returns

`Promise`\<`void`\>

##### subscribeToApproval()

> **subscribeToApproval**: (`approvalRequestId`) => `void`

Subscribe to approval updates

###### Parameters

###### approvalRequestId

`string`

###### Returns

`void`

##### subscribeToECL()

> **subscribeToECL**: (`workflowId`) => `void`

Subscribe to ECL calculation updates

###### Parameters

###### workflowId

`string`

###### Returns

`void`

##### unreadCount

> **unreadCount**: `number`
