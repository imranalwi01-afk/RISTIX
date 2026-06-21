[**Backend API Reference v1.0.0**](index.md)

***

# services/notifications.service

## Interfaces

### NotificationPreferencesShape

Defined in: [src/services/notifications.service.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L10)

#### Properties

##### muteAll

> **muteAll**: `boolean`

Defined in: [src/services/notifications.service.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L11)

##### mutedCategories

> **mutedCategories**: [`NotificationCategory`](#notificationcategory)[]

Defined in: [src/services/notifications.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L12)

##### quietHoursEnabled

> **quietHoursEnabled**: `boolean`

Defined in: [src/services/notifications.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L13)

##### quietHoursEnd

> **quietHoursEnd**: `string`

Defined in: [src/services/notifications.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L15)

##### quietHoursStart

> **quietHoursStart**: `string`

Defined in: [src/services/notifications.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L14)

##### timezone

> **timezone**: `string`

Defined in: [src/services/notifications.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L16)

## Type Aliases

### NotificationCategory

> **NotificationCategory** = `"approval"` &#124; `"workflow"` &#124; `"analytics"` &#124; `"system"`

Defined in: [src/services/notifications.service.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L7)

***

### NotificationReadStatus

> **NotificationReadStatus** = `"all"` &#124; `"read"` &#124; `"unread"`

Defined in: [src/services/notifications.service.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L8)

## Variables

### DEFAULT\_NOTIFICATION\_PREFERENCES

> `const` **DEFAULT\_NOTIFICATION\_PREFERENCES**: [`NotificationPreferencesShape`](#notificationpreferencesshape)

Defined in: [src/services/notifications.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L19)

## Functions

### deriveNotificationCategory()

> **deriveNotificationCategory**(`type`): [`NotificationCategory`](#notificationcategory)

Defined in: [src/services/notifications.service.ts:52](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L52)

#### Parameters

##### type

`string`

#### Returns

[`NotificationCategory`](#notificationcategory)

***

### filterNotificationRecipientsByPreferences()

> **filterNotificationRecipientsByPreferences**(`input`): `Promise`&lt;`string`[]&gt;

Defined in: [src/services/notifications.service.ts:210](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L210)

#### Parameters

##### input

###### category

[`NotificationCategory`](#notificationcategory)

###### now?

`Date`

###### tenantId

`string`

###### userIds

`string`[]

#### Returns

`Promise`&lt;`string`[]&gt;

***

### getMyNotificationPreferences()

> **getMyNotificationPreferences**(`tenantId`, `userId`): `Effect`&lt;[`NotificationPreferencesShape`](#notificationpreferencesshape), [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:161](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L161)

#### Parameters

##### tenantId

`string`

##### userId

`string`

#### Returns

`Effect`&lt;[`NotificationPreferencesShape`](#notificationpreferencesshape), [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### getMyNotifications()

> **getMyNotifications**(`input`): `Effect`&lt;&#123; `rows`: `any`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:107](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L107)

#### Parameters

##### input

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

#### Returns

`Effect`&lt;&#123; `rows`: `any`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### getMyUnreadNotificationCount()

> **getMyUnreadNotificationCount**(`tenantId`, `userId`): `Effect`&lt;`number`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:123](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L123)

#### Parameters

##### tenantId

`string`

##### userId

`string`

#### Returns

`Effect`&lt;`number`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### markAllNotificationsAsRead()

> **markAllNotificationsAsRead**(`input`): `Effect`&lt;&#123; `updatedCount`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:141](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L141)

#### Parameters

##### input

###### tenantId

`string`

###### userId

`string`

#### Returns

`Effect`&lt;&#123; `updatedCount`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### markManyNotificationsReadStatus()

> **markManyNotificationsReadStatus**(`input`): `Effect`&lt;&#123; `updatedCount`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:150](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L150)

#### Parameters

##### input

###### notificationIds

`string`[]

###### read

`boolean`

###### tenantId

`string`

###### userId

`string`

#### Returns

`Effect`&lt;&#123; `updatedCount`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### markNotificationAsRead()

> **markNotificationAsRead**(`input`): `Effect`&lt;&#123; `updated`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:131](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L131)

#### Parameters

##### input

###### notificationId

`string`

###### tenantId

`string`

###### userId

`string`

#### Returns

`Effect`&lt;&#123; `updated`: `boolean`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### updateMyNotificationPreferences()

> **updateMyNotificationPreferences**(`input`): `Effect`&lt;[`NotificationPreferencesShape`](#notificationpreferencesshape), [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/notifications.service.ts:177](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notifications.service.ts#L177)

#### Parameters

##### input

###### preferences

`Partial`&lt;[`NotificationPreferencesShape`](#notificationpreferencesshape)&gt;

###### tenantId

`string`

###### userId

`string`

#### Returns

`Effect`&lt;[`NotificationPreferencesShape`](#notificationpreferencesshape), [`DatabaseError`](lib.errors.md#databaseerror)&gt;
