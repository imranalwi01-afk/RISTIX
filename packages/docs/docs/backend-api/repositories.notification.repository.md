[**Backend API Reference v1.0.0**](index.md)

***

# repositories/notification.repository

## Interfaces

### CreateNotificationInput

Defined in: [src/repositories/notification.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L10)

#### Properties

##### actionUrl?

> `optional` **actionUrl**: `string`

Defined in: [src/repositories/notification.repository.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L18)

##### approvalRequestId?

> `optional` **approvalRequestId**: `string`

Defined in: [src/repositories/notification.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L12)

##### channel?

> `optional` **channel**: `"email"` &#124; `"in_app"` &#124; `"socket"` &#124; `"webhook"`

Defined in: [src/repositories/notification.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L26)

##### deliveredAt?

> `optional` **deliveredAt**: `Date`

Defined in: [src/repositories/notification.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L28)

##### deliveryStatus?

> `optional` **deliveryStatus**: `"pending"` &#124; `"sent"` &#124; `"read"` &#124; `"failed"`

Defined in: [src/repositories/notification.repository.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L27)

##### entityId?

> `optional` **entityId**: `string`

Defined in: [src/repositories/notification.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L20)

##### entityType?

> `optional` **entityType**: `string`

Defined in: [src/repositories/notification.repository.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L19)

##### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [src/repositories/notification.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L29)

##### message

> **message**: `string`

Defined in: [src/repositories/notification.repository.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L17)

##### metadata?

> `optional` **metadata**: `Record`&lt;`string`, `unknown`&gt;

Defined in: [src/repositories/notification.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L23)

##### roleTargets?

> `optional` **roleTargets**: `string`[]

Defined in: [src/repositories/notification.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L25)

##### severity

> **severity**: `"info"` &#124; `"error"` &#124; `"warning"` &#124; `"success"`

Defined in: [src/repositories/notification.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L15)

##### source?

> `optional` **source**: `string`

Defined in: [src/repositories/notification.repository.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L21)

##### tenantId

> **tenantId**: `string`

Defined in: [src/repositories/notification.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L11)

##### title

> **title**: `string`

Defined in: [src/repositories/notification.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L16)

##### triggeredBy?

> `optional` **triggeredBy**: `string`

Defined in: [src/repositories/notification.repository.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L22)

##### type

> **type**: `string`

Defined in: [src/repositories/notification.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L14)

##### userTargets?

> `optional` **userTargets**: `string`[]

Defined in: [src/repositories/notification.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L24)

##### workflowId?

> `optional` **workflowId**: `string`

Defined in: [src/repositories/notification.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L13)

***

### UserNotificationRow

Defined in: [src/repositories/notification.repository.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L32)

#### Properties

##### actionUrl

> **actionUrl**: `string` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L39)

##### approvalRequestId

> **approvalRequestId**: `string` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L41)

##### createdAt

> **createdAt**: `Date`

Defined in: [src/repositories/notification.repository.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L49)

##### deliveredAt

> **deliveredAt**: `Date` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L47)

##### deliveryStatus

> **deliveryStatus**: `string`

Defined in: [src/repositories/notification.repository.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L46)

##### entityId

> **entityId**: `string` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L43)

##### entityType

> **entityType**: `string` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L42)

##### id

> **id**: `string`

Defined in: [src/repositories/notification.repository.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L33)

##### message

> **message**: `string`

Defined in: [src/repositories/notification.repository.ts:38](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L38)

##### metadata

> **metadata**: `Record`&lt;`string`, `unknown`&gt; &#124; `null`

Defined in: [src/repositories/notification.repository.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L45)

##### notificationId

> **notificationId**: `string`

Defined in: [src/repositories/notification.repository.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L34)

##### readAt

> **readAt**: `Date` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L48)

##### severity

> **severity**: `string`

Defined in: [src/repositories/notification.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L36)

##### source

> **source**: `string`

Defined in: [src/repositories/notification.repository.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L44)

##### title

> **title**: `string`

Defined in: [src/repositories/notification.repository.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L37)

##### type

> **type**: `string`

Defined in: [src/repositories/notification.repository.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L35)

##### workflowId

> **workflowId**: `string` &#124; `null`

Defined in: [src/repositories/notification.repository.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L40)

## Type Aliases

### NotificationCategory

> **NotificationCategory** = `"approval"` &#124; `"workflow"` &#124; `"analytics"` &#124; `"system"`

Defined in: [src/repositories/notification.repository.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L52)

***

### NotificationReadStatus

> **NotificationReadStatus** = `"all"` &#124; `"read"` &#124; `"unread"`

Defined in: [src/repositories/notification.repository.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L53)

## Variables

### NotificationRepository

> `const` **NotificationRepository**: `object`

Defined in: [src/repositories/notification.repository.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification.repository.ts#L82)

#### Type Declaration

##### createWithDeliveries()

> **createWithDeliveries**(`input`): `Promise`&lt;&#123; `deliveries`: `object`[]; `notification`: &#123; `actionUrl`: `string` &#124; `null`; `approvalRequestId`: `string` &#124; `null`; `createdAt`: `Date`; `entityId`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `id`: `string`; `message`: `string`; `metadata`: `unknown`; `severity`: `string`; `source`: `string`; `tenantId`: `string`; `title`: `string`; `triggeredBy`: `string` &#124; `null`; `type`: `string`; `workflowId`: `string` &#124; `null`; &#125;; &#125;&gt;

###### Parameters

###### input

[`CreateNotificationInput`](#createnotificationinput)

###### Returns

`Promise`&lt;&#123; `deliveries`: `object`[]; `notification`: &#123; `actionUrl`: `string` &#124; `null`; `approvalRequestId`: `string` &#124; `null`; `createdAt`: `Date`; `entityId`: `string` &#124; `null`; `entityType`: `string` &#124; `null`; `id`: `string`; `message`: `string`; `metadata`: `unknown`; `severity`: `string`; `source`: `string`; `tenantId`: `string`; `title`: `string`; `triggeredBy`: `string` &#124; `null`; `type`: `string`; `workflowId`: `string` &#124; `null`; &#125;; &#125;&gt;

##### getUnreadCount()

> **getUnreadCount**(`tenantId`, `userId`): `Promise`&lt;`number`&gt;

###### Parameters

###### tenantId

`string`

###### userId

`string`

###### Returns

`Promise`&lt;`number`&gt;

##### listForUser()

> **listForUser**(`input`): `Promise`&lt;&#123; `rows`: [`UserNotificationRow`](#usernotificationrow)[]; `total`: `number`; &#125;&gt;

###### Parameters

###### input

###### category?

[`NotificationCategory`](#notificationcategory)

###### dateFrom?

`Date`

###### dateTo?

`Date`

###### limit?

`number`

###### offset?

`number`

###### readStatus?

[`NotificationReadStatus`](#notificationreadstatus)

###### search?

`string`

###### tenantId

`string`

###### unreadOnly?

`boolean`

###### userId

`string`

###### Returns

`Promise`&lt;&#123; `rows`: [`UserNotificationRow`](#usernotificationrow)[]; `total`: `number`; &#125;&gt;

##### markAllAsRead()

> **markAllAsRead**(`input`): `Promise`&lt;`number`&gt;

###### Parameters

###### input

###### tenantId

`string`

###### userId

`string`

###### Returns

`Promise`&lt;`number`&gt;

##### markAsRead()

> **markAsRead**(`input`): `Promise`&lt;`boolean`&gt;

###### Parameters

###### input

###### notificationId

`string`

###### tenantId

`string`

###### userId

`string`

###### Returns

`Promise`&lt;`boolean`&gt;

##### markManyReadStatus()

> **markManyReadStatus**(`input`): `Promise`&lt;`number`&gt;

###### Parameters

###### input

###### notificationIds

`string`[]

###### read

`boolean`

###### tenantId

`string`

###### userId

`string`

###### Returns

`Promise`&lt;`number`&gt;
