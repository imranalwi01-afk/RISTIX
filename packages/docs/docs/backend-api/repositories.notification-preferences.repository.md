[**Backend API Reference v1.0.0**](index.md)

***

# repositories/notification-preferences.repository

## Interfaces

### NotificationPreferencesInput

Defined in: [src/repositories/notification-preferences.repository.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L8)

#### Properties

##### muteAll

> **muteAll**: `boolean`

Defined in: [src/repositories/notification-preferences.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L11)

##### mutedCategories

> **mutedCategories**: `string`[]

Defined in: [src/repositories/notification-preferences.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L12)

##### quietHoursEnabled

> **quietHoursEnabled**: `boolean`

Defined in: [src/repositories/notification-preferences.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L13)

##### quietHoursEnd

> **quietHoursEnd**: `string`

Defined in: [src/repositories/notification-preferences.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L15)

##### quietHoursStart

> **quietHoursStart**: `string`

Defined in: [src/repositories/notification-preferences.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L14)

##### tenantId

> **tenantId**: `string`

Defined in: [src/repositories/notification-preferences.repository.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L9)

##### timezone

> **timezone**: `string`

Defined in: [src/repositories/notification-preferences.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L16)

##### userId

> **userId**: `string`

Defined in: [src/repositories/notification-preferences.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L10)

## Variables

### NotificationPreferencesRepository

> `const` **NotificationPreferencesRepository**: `object`

Defined in: [src/repositories/notification-preferences.repository.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/notification-preferences.repository.ts#L19)

#### Type Declaration

##### getByUser()

> **getByUser**(`tenantId`, `userId`): `Promise`{`<`}{`{`} `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; {`}`} {`|`} `null`{`>`}

###### Parameters

###### tenantId

`string`

###### userId

`string`

###### Returns

`Promise`{`<`}{`{`} `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; {`}`} {`|`} `null`{`>`}

##### listByUsers()

> **listByUsers**(`tenantId`, `userIds`): `Promise`{`<`}`object`[]{`>`}

###### Parameters

###### tenantId

`string`

###### userIds

`string`[]

###### Returns

`Promise`{`<`}`object`[]{`>`}

##### upsert()

> **upsert**(`input`): `Promise`{`<`}{`{`} `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; {`}`}{`>`}

###### Parameters

###### input

[`NotificationPreferencesInput`](#notificationpreferencesinput)

###### Returns

`Promise`{`<`}{`{`} `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; {`}`}{`>`}
