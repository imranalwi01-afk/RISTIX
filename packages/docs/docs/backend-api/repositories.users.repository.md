[**Backend API Reference v1.0.0**](index.md)

***

# repositories/users.repository

## Classes

### UsersRepository

Defined in: [src/repositories/users.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L29)

Extension of IRepository that specifically handles tenant isolation.

#### Implements

- [`ITenantRepository`](repositories.base.repository.md#itenantrepository)\<[`User`](db.schema.core.md#user), [`NewUser`](db.schema.core.md#newuser)\>

#### Constructors

##### Constructor

> **new UsersRepository**(): [`UsersRepository`](#usersrepository)

###### Returns

[`UsersRepository`](#usersrepository)

#### Methods

##### create()

> **create**(`data`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/repositories/users.repository.ts:185](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L185)

Create a new user.

###### Parameters

###### data

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

###### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to the created user

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`create`](repositories.base.repository.md#create-2)

##### delete()

> **delete**(`id`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

Defined in: [src/repositories/users.repository.ts:233](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L233)

Soft delete a user.

###### Parameters

###### id

`string`

The user ID

###### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

An Effect resolving to the updated (deleted) user

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`delete`](repositories.base.repository.md#delete-2)

##### findAll()

> **findAll**(`options?`): `Effect`\<[`PaginatedResult`](repositories.base.repository.md#paginatedresult)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/repositories/users.repository.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L73)

Find all users with pagination.

###### Parameters

###### options?

[`UsersQueryOptions`](#usersqueryoptions)

Query options including pagination and filters

###### Returns

`Effect`\<[`PaginatedResult`](repositories.base.repository.md#paginatedresult)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to paginated user results

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`findAll`](repositories.base.repository.md#findall-2)

##### findByEmail()

> **findByEmail**(`email`, `tenantId?`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \} \| `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/repositories/users.repository.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L54)

Find user by email.

###### Parameters

###### email

`string`

The email address

###### tenantId?

`string`

Optional tenant ID filter

###### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \} \| `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to the user or undefined

##### findById()

> **findById**(`id`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

Defined in: [src/repositories/users.repository.ts:36](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L36)

Find user by ID.

###### Parameters

###### id

`string`

The user ID

###### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

An Effect resolving to the user or NotFoundError

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`findById`](repositories.base.repository.md#findbyid-2)

##### findByTenant()

> **findByTenant**(`tenantId`, `options?`): `Effect`\<[`PaginatedResult`](repositories.base.repository.md#paginatedresult)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/repositories/users.repository.ts:128](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L128)

Find users by tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### options?

[`UsersQueryOptions`](#usersqueryoptions)

Query options including pagination and filters

###### Returns

`Effect`\<[`PaginatedResult`](repositories.base.repository.md#paginatedresult)\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}\>, [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to paginated user results for the tenant

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`findByTenant`](repositories.base.repository.md#findbytenant)

##### getStats()

> **getStats**(`tenantId`): `Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](lib.errors.md#databaseerror)\>

Defined in: [src/repositories/users.repository.ts:243](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L243)

Get user statistics for a tenant.

###### Parameters

###### tenantId

`string`

The tenant ID

###### Returns

`Effect`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; `verifiedEmail`: `number`; \}, [`DatabaseError`](lib.errors.md#databaseerror)\>

An Effect resolving to user statistics (total, active, inactive, verified)

##### update()

> **update**(`id`, `data`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

Defined in: [src/repositories/users.repository.ts:206](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L206)

Update an existing user.

###### Parameters

###### id

`string`

The user ID

###### data

`Partial`\<[`NewUser`](db.schema.core.md#newuser)\>

The data to update

###### Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](lib.errors.md#databaseerror) \| [`NotFoundError`](lib.errors.md#notfounderror)\>

An Effect resolving to the updated user or NotFoundError

###### Implementation of

[`ITenantRepository`](repositories.base.repository.md#itenantrepository).[`update`](repositories.base.repository.md#update-2)

## Interfaces

### UsersQueryOptions

Defined in: [src/repositories/users.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L24)

Common query options for repository methods.

#### Extends

- [`QueryOptions`](repositories.base.repository.md#queryoptions)

#### Properties

##### filters?

> `optional` **filters**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`filters`](repositories.base.repository.md#filters)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`includeInactive`](repositories.base.repository.md#includeinactive)

##### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/repositories/users.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L26)

##### pagination?

> `optional` **pagination**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`pagination`](repositories.base.repository.md#pagination)

##### search?

> `optional` **search**: `string`

Defined in: [src/repositories/users.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L25)

## Variables

### usersRepository

> `const` **usersRepository**: [`UsersRepository`](#usersrepository)

Defined in: [src/repositories/users.repository.ts:275](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/users.repository.ts#L275)
