[**Backend API Reference v1.0.0**](index.md)

***

# services/users.service

## Interfaces

### CreateUserInput

Defined in: [src/services/users.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L13)

#### Properties

##### department?

> `optional` **department?**: `string`

Defined in: [src/services/users.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L17)

##### email

> **email**: `string`

Defined in: [src/services/users.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L14)

##### isPlatformAdmin?

> `optional` **isPlatformAdmin?**: `boolean`

Defined in: [src/services/users.service.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L20)

##### password

> **password**: `string`

Defined in: [src/services/users.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L15)

##### phone?

> `optional` **phone?**: `string`

Defined in: [src/services/users.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L16)

##### position?

> `optional` **position?**: `string`

Defined in: [src/services/users.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L18)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/users.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L19)

***

### UpdateUserInput

Defined in: [src/services/users.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L23)

#### Properties

##### department?

> `optional` **department?**: `string`

Defined in: [src/services/users.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L25)

##### isActive?

> `optional` **isActive?**: `boolean`

Defined in: [src/services/users.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L27)

##### phone?

> `optional` **phone?**: `string`

Defined in: [src/services/users.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L24)

##### position?

> `optional` **position?**: `string`

Defined in: [src/services/users.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L26)

##### tenantId?

> `optional` **tenantId?**: `string`

Defined in: [src/services/users.service.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L28)

## Functions

### createUser()

> **createUser**(`input`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/services/users.service.ts:115](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L115)

Create a new user.
Hashes the password and creates the user record.

#### Parameters

##### input

[`CreateUserInput`](#createuserinput)

The user creation data

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

An Effect resolving to the created User or an error (DatabaseError/ValidationError)

***

### deleteUser()

> **deleteUser**(`userId`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/users.service.ts:205](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L205)

Delete a user (soft delete).
Sets isActive to false.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated user

***

### disableUser()

> **disableUser**(`userId`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/users.service.ts:323](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L323)

Disable a user.
Sets isActive to false.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated user

***

### enableUser()

> **enableUser**(`userId`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/users.service.ts:306](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L306)

Enable a user.
Sets isActive to true.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated user

***

### getUserByEmail()

> **getUserByEmail**(`email`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/users.service.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L80)

Get user by email.

#### Parameters

##### email

`string`

The email address

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to the user or undefined

***

### getUserById()

> **getUserById**(`userId`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/users.service.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L58)

Get user by ID.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID to pick the database

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect resolving to the user or NotFoundError

***

### getUsers()

> **getUsers**(`tenantId`, `options?`): `Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/users.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L42)

Get users with pagination and filtering.

#### Parameters

##### tenantId

`string`

The tenant ID

##### options?

Query options including search, active status, pagination, and sorting

###### isActive?

`boolean`

###### limit?

`number`

###### offset?

`number`

###### order?

`"asc"` &#124; `"desc"`

###### search?

`string`

###### sort?

`string`

#### Returns

`Effect`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to paginated user results

***

### getUserStats()

> **getUserStats**(`tenantId`): `Effect`&lt;&#123; `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/users.service.ts:95](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L95)

Get user statistics.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`&lt;&#123; `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect resolving to user statistics

***

### resetPassword()

> **resetPassword**(`userId`, `newPassword`, `tenantId`, `options?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/services/users.service.ts:261](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L261)

Administrative password reset with optional force-change-on-login.

#### Parameters

##### userId

`string`

##### newPassword

`string`

##### tenantId

`string`

##### options?

###### forcePasswordChange?

`boolean`

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

***

### updatePassword()

> **updatePassword**(`userId`, `newPassword`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/services/users.service.ts:228](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L228)

Update user password.
Hashes the new password before updating.

#### Parameters

##### userId

`string`

The user ID

##### newPassword

`string`

The new password

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

An Effect resolving to the updated user

***

### updateUser()

> **updateUser**(`userId`, `input`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/users.service.ts:183](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L183)

Update a user.

#### Parameters

##### userId

`string`

The user ID

##### input

[`UpdateUserInput`](#updateuserinput)

The data to update

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated User or error

***

### verifyEmail()

> **verifyEmail**(`userId`, `tenantId?`): `Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/services/users.service.ts:339](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/users.service.ts#L339)

Mark email as verified.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`&lt;&#123; `backupCodes`: `string`[] &#124; `null`; `bankId`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `department`: `string` &#124; `null`; `email`: `string`; `emailVerifiedAt`: `Date` &#124; `null`; `employeeId`: `string` &#124; `null`; `failedLoginAttempts`: `number` &#124; `null`; `forcePasswordChange`: `boolean` &#124; `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isVerified`: `boolean` &#124; `null`; `lastLoginAt`: `Date` &#124; `null`; `loginCount`: `number` &#124; `null`; `mfaEnabled`: `boolean` &#124; `null`; `mfaSecret`: `string` &#124; `null`; `passwordChangedAt`: `Date` &#124; `null`; `passwordHash`: `string`; `phone`: `string` &#124; `null`; `position`: `string` &#124; `null`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `username`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect resolving to the updated user
