[**Frontend API Reference v1.0.0**](index.md)

***

# hooks/useNotificationSocket

## Interfaces

### NotificationPayload

Defined in: [hooks/useNotificationSocket.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L9)

#### Properties

##### actionUrl?

> `optional` **actionUrl**: `string`

Defined in: [hooks/useNotificationSocket.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L20)

##### category

> **category**: `"analytics"` &#124; `"system"` &#124; `"approval"` &#124; `"workflow"`

Defined in: [hooks/useNotificationSocket.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L12)

##### data?

> `optional` **data**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [hooks/useNotificationSocket.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L19)

##### deliveryStatus?

> `optional` **deliveryStatus**: `string`

Defined in: [hooks/useNotificationSocket.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L22)

##### id

> **id**: `string`

Defined in: [hooks/useNotificationSocket.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L10)

##### message

> **message**: `string`

Defined in: [hooks/useNotificationSocket.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L16)

##### readAt?

> `optional` **readAt**: `string` &#124; `null`

Defined in: [hooks/useNotificationSocket.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L21)

##### severity

> **severity**: `"error"` &#124; `"success"` &#124; `"info"` &#124; `"warning"`

Defined in: [hooks/useNotificationSocket.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L17)

##### tenantId

> **tenantId**: `string`

Defined in: [hooks/useNotificationSocket.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L14)

##### timestamp

> **timestamp**: `string`

Defined in: [hooks/useNotificationSocket.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L18)

##### title

> **title**: `string`

Defined in: [hooks/useNotificationSocket.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L15)

##### type

> **type**: `"APPROVAL_PENDING"` &#124; `"APPROVAL_APPROVED"` &#124; `"APPROVAL_REJECTED"` &#124; `"ECL_STARTED"` &#124; `"ECL_COMPLETED"` &#124; `"ECL_FAILED"` &#124; `"COMPLIANCE_ALERT"`

Defined in: [hooks/useNotificationSocket.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L11)

##### workflowId

> **workflowId**: `string`

Defined in: [hooks/useNotificationSocket.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L13)

## Functions

### useNotifications()

> **useNotifications**(): `object`

Defined in: [hooks/useNotificationSocket.ts:281](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L281)

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

> **loadError**: `string` &#124; `null` = `socket.loadError`

##### notifications

> **notifications**: [`NotificationPayload`](#notificationpayload)[] = `socket.notifications`

##### refreshNotifications()

> **refreshNotifications**: () => `Promise`&lt;`void`&gt; = `socket.refreshNotifications`

###### Returns

`Promise`&lt;`void`&gt;

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

Defined in: [hooks/useNotificationSocket.ts:103](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/hooks/useNotificationSocket.ts#L103)

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

> **loadError**: `string` &#124; `null`

##### notifications

> **notifications**: [`NotificationPayload`](#notificationpayload)[]

##### refreshNotifications()

> **refreshNotifications**: () => `Promise`&lt;`void`&gt;

###### Returns

`Promise`&lt;`void`&gt;

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
