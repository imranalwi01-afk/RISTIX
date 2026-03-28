[**Frontend API Reference v1.0.0**](index.md)

***

# utils/notification-utils

## Variables

### NOTIFICATION\_CATEGORIES

> `const` **NOTIFICATION\_CATEGORIES**: [`NotificationCategory`](services.api.notification.api.md#notificationcategory)[]

Defined in: [utils/notification-utils.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/notification-utils.ts#L3)

## Functions

### formatNotificationCategory()

> **formatNotificationCategory**(`category`): `string`

Defined in: [utils/notification-utils.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/notification-utils.ts#L13)

#### Parameters

##### category

[`NotificationCategory`](services.api.notification.api.md#notificationcategory)

#### Returns

`string`

***

### getNotificationCategory()

> **getNotificationCategory**(`type?`): [`NotificationCategory`](services.api.notification.api.md#notificationcategory)

Defined in: [utils/notification-utils.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/notification-utils.ts#L5)

#### Parameters

##### type?

`string`

#### Returns

[`NotificationCategory`](services.api.notification.api.md#notificationcategory)

***

### resolveNotificationActionRoute()

> **resolveNotificationActionRoute**(`actionUrl?`): `string` \| `null`

Defined in: [utils/notification-utils.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/notification-utils.ts#L16)

#### Parameters

##### actionUrl?

`string`

#### Returns

`string` \| `null`
