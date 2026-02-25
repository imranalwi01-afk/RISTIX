[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: NotificationPreferencesRepository

> `const` **NotificationPreferencesRepository**: `object`

Defined in: src/repositories/notification-preferences.repository.ts:19

## Type Declaration

### getByUser()

> **getByUser**(`tenantId`, `userId`): `Promise`\<\{ `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; \} \| `null`\>

#### Parameters

##### tenantId

`string`

##### userId

`string`

#### Returns

`Promise`\<\{ `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; \} \| `null`\>

### listByUsers()

> **listByUsers**(`tenantId`, `userIds`): `Promise`\<`object`[]\>

#### Parameters

##### tenantId

`string`

##### userIds

`string`[]

#### Returns

`Promise`\<`object`[]\>

### upsert()

> **upsert**(`input`): `Promise`\<\{ `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; \}\>

#### Parameters

##### input

[`NotificationPreferencesInput`](../interfaces/NotificationPreferencesInput.md)

#### Returns

`Promise`\<\{ `createdAt`: `Date`; `id`: `string`; `muteAll`: `boolean`; `mutedCategories`: `string`[]; `quietHoursEnabled`: `boolean`; `quietHoursEnd`: `string`; `quietHoursStart`: `string`; `tenantId`: `string`; `timezone`: `string`; `updatedAt`: `Date`; `userId`: `string`; \}\>
