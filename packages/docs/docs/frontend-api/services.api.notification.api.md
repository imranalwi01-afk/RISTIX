[**Frontend API Reference v1.0.0**](index.md)

***

# services/api/notification.api

## Interfaces

### NotificationListParams

Defined in: [services/api/notification.api.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L6)

#### Properties

##### category?

> `optional` **category**: [`NotificationCategory`](#notificationcategory)

Defined in: [services/api/notification.api.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L9)

##### dateFrom?

> `optional` **dateFrom**: `string`

Defined in: [services/api/notification.api.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L11)

##### dateTo?

> `optional` **dateTo**: `string`

Defined in: [services/api/notification.api.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L12)

##### limit?

> `optional` **limit**: `number`

Defined in: [services/api/notification.api.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L13)

##### offset?

> `optional` **offset**: `number`

Defined in: [services/api/notification.api.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L14)

##### readStatus?

> `optional` **readStatus**: [`NotificationReadStatus`](#notificationreadstatus)

Defined in: [services/api/notification.api.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L8)

##### search?

> `optional` **search**: `string`

Defined in: [services/api/notification.api.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L10)

##### unreadOnly?

> `optional` **unreadOnly**: `boolean`

Defined in: [services/api/notification.api.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L7)

***

### NotificationPreferences

Defined in: [services/api/notification.api.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L17)

#### Properties

##### muteAll

> **muteAll**: `boolean`

Defined in: [services/api/notification.api.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L18)

##### mutedCategories

> **mutedCategories**: [`NotificationCategory`](#notificationcategory)[]

Defined in: [services/api/notification.api.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L19)

##### quietHoursEnabled

> **quietHoursEnabled**: `boolean`

Defined in: [services/api/notification.api.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L20)

##### quietHoursEnd

> **quietHoursEnd**: `string`

Defined in: [services/api/notification.api.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L22)

##### quietHoursStart

> **quietHoursStart**: `string`

Defined in: [services/api/notification.api.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L21)

##### timezone

> **timezone**: `string`

Defined in: [services/api/notification.api.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L23)

## Type Aliases

### NotificationCategory

> **NotificationCategory** = `"approval"` \| `"workflow"` \| `"analytics"` \| `"system"`

Defined in: [services/api/notification.api.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L3)

***

### NotificationReadStatus

> **NotificationReadStatus** = `"all"` \| `"read"` \| `"unread"`

Defined in: [services/api/notification.api.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L4)

## Variables

### notificationAPI

> `const` **notificationAPI**: `object`

Defined in: [services/api/notification.api.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/services/api/notification.api.ts#L26)

#### Type Declaration

##### getPreferences()

> **getPreferences**: () => `Promise`\<`any`\>

###### Returns

`Promise`\<`any`\>

##### getUnreadCount()

> **getUnreadCount**: () => `Promise`\<`any`\>

###### Returns

`Promise`\<`any`\>

##### list()

> **list**: (`params?`) => `Promise`\<`any`\>

###### Parameters

###### params?

[`NotificationListParams`](#notificationlistparams)

###### Returns

`Promise`\<`any`\>

##### markAllRead()

> **markAllRead**: () => `Promise`\<`any`\>

###### Returns

`Promise`\<`any`\>

##### markRead()

> **markRead**: (`notificationId`) => `Promise`\<`any`\>

###### Parameters

###### notificationId

`string`

###### Returns

`Promise`\<`any`\>

##### markReadStatusBulk()

> **markReadStatusBulk**: (`payload`) => `Promise`\<`any`\>

###### Parameters

###### payload

###### notificationIds

`string`[]

###### read

`boolean`

###### Returns

`Promise`\<`any`\>

##### updatePreferences()

> **updatePreferences**: (`payload`) => `Promise`\<`any`\>

###### Parameters

###### payload

`Partial`\<[`NotificationPreferences`](#notificationpreferences)\>

###### Returns

`Promise`\<`any`\>
