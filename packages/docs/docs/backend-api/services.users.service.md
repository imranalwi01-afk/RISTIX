[**Backend API Reference v1.0.0**](index.md)

***

# services/users.service

## Interfaces

### CreateUserInput

Defined in: [src/services/users.service.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L12)

#### Properties

##### department?

> `optional` **department**: `string`

Defined in: [src/services/users.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L16)

##### email

> **email**: `string`

Defined in: [src/services/users.service.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L13)

##### isPlatformAdmin?

> `optional` **isPlatformAdmin**: `boolean`

Defined in: [src/services/users.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L19)

##### password

> **password**: `string`

Defined in: [src/services/users.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L14)

##### phone?

> `optional` **phone**: `string`

Defined in: [src/services/users.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L15)

##### position?

> `optional` **position**: `string`

Defined in: [src/services/users.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L17)

##### tenantId

> **tenantId**: `string`

Defined in: [src/services/users.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L18)

***

### UpdateUserInput

Defined in: [src/services/users.service.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L22)

#### Properties

##### department?

> `optional` **department**: `string`

Defined in: [src/services/users.service.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L24)

##### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/services/users.service.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L26)

##### phone?

> `optional` **phone**: `string`

Defined in: [src/services/users.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L23)

##### position?

> `optional` **position**: `string`

Defined in: [src/services/users.service.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L25)

##### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/users.service.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L27)

## Functions

### createUser()

> **createUser**(`input`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`ValidationError`](lib.errors.md#validationerror){`>`}

Defined in: [src/services/users.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L114)

Create a new user.
Hashes the password and creates the user record.

#### Parameters

##### input

[`CreateUserInput`](#createuserinput)

The user creation data

#### Returns

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`ValidationError`](lib.errors.md#validationerror){`>`}

An Effect resolving to the created User or an error (DatabaseError/ValidationError)

***

### deleteUser()

> **deleteUser**(`userId`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:202](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L202)

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

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated user

***

### disableUser()

> **disableUser**(`userId`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:312](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L312)

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

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated user

***

### enableUser()

> **enableUser**(`userId`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:295](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L295)

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

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated user

***

### getUserByEmail()

> **getUserByEmail**(`email`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`} {`|`} `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Defined in: [src/services/users.service.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L79)

Get user by email.

#### Parameters

##### email

`string`

The email address

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`} {`|`} `undefined`, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to the user or undefined

***

### getUserById()

> **getUserById**(`userId`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

Defined in: [src/services/users.service.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L57)

Get user by ID.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID to pick the database

#### Returns

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror), `never`{`>`}

An Effect resolving to the user or NotFoundError

***

### getUsers()

> **getUsers**(`tenantId`, `options?`): `Effect`{`<`}{`{`} `data`: `object`[]; `total`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Defined in: [src/services/users.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L41)

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

`"asc"` {`|`} `"desc"`

###### search?

`string`

###### sort?

`string`

#### Returns

`Effect`{`<`}{`{`} `data`: `object`[]; `total`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to paginated user results

***

### getUserStats()

> **getUserStats**(`tenantId`): `Effect`{`<`}{`{`} `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

Defined in: [src/services/users.service.ts:94](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L94)

Get user statistics.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`{`<`}{`{`} `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror), `never`{`>`}

An Effect resolving to user statistics

***

### resetPassword()

> **resetPassword**(`userId`, `newPassword`, `tenantId`, `options?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:254](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L254)

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

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

***

### updatePassword()

> **updatePassword**(`userId`, `newPassword`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:225](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L225)

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

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated user

***

### updateUser()

> **updateUser**(`userId`, `input`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:180](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L180)

Update a user.

#### Parameters

##### userId

`string`

The user ID

##### input

[`UpdateUserInput`](#updateuserinput)

The data to update

#### Returns

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated User or error

***

### verifyEmail()

> **verifyEmail**(`userId`, `tenantId?`): `Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

Defined in: [src/services/users.service.ts:328](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/users.service.ts#L328)

Mark email as verified.

#### Parameters

##### userId

`string`

The user ID

##### tenantId?

`string`

Optional tenant ID

#### Returns

`Effect`{`<`}{`{`} `backupCodes`: `string`[] {`|`} `null`; `bankId`: `string` {`|`} `null`; `createdAt`: `Date` {`|`} `null`; `department`: `string` {`|`} `null`; `email`: `string`; `emailVerifiedAt`: `Date` {`|`} `null`; `employeeId`: `string` {`|`} `null`; `failedLoginAttempts`: `number` {`|`} `null`; `forcePasswordChange`: `boolean` {`|`} `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` {`|`} `null`; `isVerified`: `boolean` {`|`} `null`; `lastLoginAt`: `Date` {`|`} `null`; `loginCount`: `number` {`|`} `null`; `mfaEnabled`: `boolean` {`|`} `null`; `mfaSecret`: `string` {`|`} `null`; `passwordChangedAt`: `Date` {`|`} `null`; `passwordHash`: `string`; `phone`: `string` {`|`} `null`; `position`: `string` {`|`} `null`; `tenantId`: `string` {`|`} `null`; `updatedAt`: `Date` {`|`} `null`; `username`: `string`; {`}`}, [`DatabaseError`](lib.errors.md#databaseerror) {`|`} [`NotFoundError`](lib.errors.md#notfounderror){`>`}

An Effect resolving to the updated user
