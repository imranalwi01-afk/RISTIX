[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: UsersRepository

Defined in: [src/repositories/users.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L29)

Extension of IRepository that specifically handles tenant isolation.

## Implements

- [`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md)\<[`User`](../../../db/schema/core/type-aliases/User.md), [`NewUser`](../../../db/schema/core/type-aliases/NewUser.md)\>

## Constructors

### Constructor

> **new UsersRepository**(): `UsersRepository`

#### Returns

`UsersRepository`

## Methods

### create()

> **create**(`data`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/users.repository.ts:185](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L185)

Create a new user.

#### Parameters

##### data

The user data

###### backupCodes?

`string`[] \| `null`

###### bankId?

`string` \| `null`

###### createdAt?

`Date` \| `null`

###### department?

`string` \| `null`

###### email

`string`

###### emailVerifiedAt?

`Date` \| `null`

###### employeeId?

`string` \| `null`

###### failedLoginAttempts?

`number` \| `null`

###### forcePasswordChange?

`boolean` \| `null`

###### fullName

`string`

###### id?

`string`

###### isActive?

`boolean` \| `null`

###### isVerified?

`boolean` \| `null`

###### lastLoginAt?

`Date` \| `null`

###### loginCount?

`number` \| `null`

###### mfaEnabled?

`boolean` \| `null`

###### mfaSecret?

`string` \| `null`

###### passwordChangedAt?

`Date` \| `null`

###### passwordHash

`string`

###### phone?

`string` \| `null`

###### position?

`string` \| `null`

###### tenantId?

`string` \| `null`

###### updatedAt?

`Date` \| `null`

###### username

`string`

#### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the created user

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`create`](../../base.repository/interfaces/ITenantRepository.md#create)

***

### delete()

> **delete**(`id`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/users.repository.ts:233](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L233)

Soft delete a user.

#### Parameters

##### id

`string`

The user ID

#### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the updated (deleted) user

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`delete`](../../base.repository/interfaces/ITenantRepository.md#delete)

***

### findAll()

> **findAll**(`options?`): `Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/users.repository.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L73)

Find all users with pagination.

#### Parameters

##### options?

[`UsersQueryOptions`](../interfaces/UsersQueryOptions.md)

Query options including pagination and filters

#### Returns

`Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to paginated user results

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`findAll`](../../base.repository/interfaces/ITenantRepository.md#findall)

***

### findByEmail()

> **findByEmail**(`email`, `tenantId?`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/users.repository.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L54)

Find user by email.

#### Parameters

##### email

`string`

The email address

##### tenantId?

`string`

Optional tenant ID filter

#### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \} \| `undefined`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to the user or undefined

***

### findById()

> **findById**(`id`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/users.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L36)

Find user by ID.

#### Parameters

##### id

`string`

The user ID

#### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the user or NotFoundError

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`findById`](../../base.repository/interfaces/ITenantRepository.md#findbyid)

***

### findByTenant()

> **findByTenant**(`tenantId`, `options?`): `Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/users.repository.ts:128](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L128)

Find users by tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

##### options?

[`UsersQueryOptions`](../interfaces/UsersQueryOptions.md)

Query options including pagination and filters

#### Returns

`Effect`\<[`PaginatedResult`](../../base.repository/interfaces/PaginatedResult.md)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to paginated user results for the tenant

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`findByTenant`](../../base.repository/interfaces/ITenantRepository.md#findbytenant)

***

### getStats()

> **getStats**(`tenantId`): `Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/users.repository.ts:243](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L243)

Get user statistics for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID

#### Returns

`Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect resolving to user statistics (total, active, inactive, verified)

***

### update()

> **update**(`id`, `data`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/repositories/users.repository.ts:206](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/users.repository.ts#L206)

Update an existing user.

#### Parameters

##### id

`string`

The user ID

##### data

`Partial`\<[`NewUser`](../../../db/schema/core/type-aliases/NewUser.md)\>

The data to update

#### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the updated user or NotFoundError

#### Implementation of

[`ITenantRepository`](../../base.repository/interfaces/ITenantRepository.md).[`update`](../../base.repository/interfaces/ITenantRepository.md#update)
