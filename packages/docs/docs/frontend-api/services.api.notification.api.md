[**Frontend API Reference v1.0.0**](index.md)

***

# services/api/notification.api

## Interfaces

### NotificationListParams

Defined in: [services/api/notification.api.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L6)

#### Properties

##### category?

> `optional` **category**: [`NotificationCategory`](#notificationcategory)

Defined in: [services/api/notification.api.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L9)

##### dateFrom?

> `optional` **dateFrom**: `string`

Defined in: [services/api/notification.api.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L11)

##### dateTo?

> `optional` **dateTo**: `string`

Defined in: [services/api/notification.api.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L12)

##### limit?

> `optional` **limit**: `number`

Defined in: [services/api/notification.api.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L13)

##### offset?

> `optional` **offset**: `number`

Defined in: [services/api/notification.api.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L14)

##### readStatus?

> `optional` **readStatus**: [`NotificationReadStatus`](#notificationreadstatus)

Defined in: [services/api/notification.api.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L8)

##### search?

> `optional` **search**: `string`

Defined in: [services/api/notification.api.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L10)

##### unreadOnly?

> `optional` **unreadOnly**: `boolean`

Defined in: [services/api/notification.api.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L7)

***

### NotificationPreferences

Defined in: [services/api/notification.api.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L17)

#### Properties

##### muteAll

> **muteAll**: `boolean`

Defined in: [services/api/notification.api.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L18)

##### mutedCategories

> **mutedCategories**: [`NotificationCategory`](#notificationcategory)[]

Defined in: [services/api/notification.api.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L19)

##### quietHoursEnabled

> **quietHoursEnabled**: `boolean`

Defined in: [services/api/notification.api.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L20)

##### quietHoursEnd

> **quietHoursEnd**: `string`

Defined in: [services/api/notification.api.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L22)

##### quietHoursStart

> **quietHoursStart**: `string`

Defined in: [services/api/notification.api.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L21)

##### timezone

> **timezone**: `string`

Defined in: [services/api/notification.api.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L23)

## Type Aliases

### NotificationCategory

> **NotificationCategory** = `"approval"` &#124; `"workflow"` &#124; `"analytics"` &#124; `"system"`

Defined in: [services/api/notification.api.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L3)

***

### NotificationReadStatus

> **NotificationReadStatus** = `"all"` &#124; `"read"` &#124; `"unread"`

Defined in: [services/api/notification.api.ts:4](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L4)

## Variables

### notificationAPI

> `const` **notificationAPI**: `object`

Defined in: [services/api/notification.api.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/services/api/notification.api.ts#L26)

#### Type Declaration

##### getPreferences()

> **getPreferences**: () => `Promise`&lt;`any`&gt;

###### Returns

`Promise`&lt;`any`&gt;

##### getUnreadCount()

> **getUnreadCount**: () => `Promise`&lt;`any`&gt;

###### Returns

`Promise`&lt;`any`&gt;

##### list()

> **list**: (`params?`) => `Promise`&lt;`any`&gt;

###### Parameters

###### params?

[`NotificationListParams`](#notificationlistparams)

###### Returns

`Promise`&lt;`any`&gt;

##### markAllRead()

> **markAllRead**: () => `Promise`&lt;`any`&gt;

###### Returns

`Promise`&lt;`any`&gt;

##### markRead()

> **markRead**: (`notificationId`) => `Promise`&lt;`any`&gt;

###### Parameters

###### notificationId

`string`

###### Returns

`Promise`&lt;`any`&gt;

##### markReadStatusBulk()

> **markReadStatusBulk**: (`payload`) => `Promise`&lt;`any`&gt;

###### Parameters

###### payload

###### notificationIds

`string`[]

###### read

`boolean`

###### Returns

`Promise`&lt;`any`&gt;

##### updatePreferences()

> **updatePreferences**: (`payload`) => `Promise`&lt;`any`&gt;

###### Parameters

###### payload

`Partial`&lt;[`NotificationPreferences`](#notificationpreferences)&gt;

###### Returns

`Promise`&lt;`any`&gt;
