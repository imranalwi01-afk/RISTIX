[**Backend API Reference v1.0.0**](index.md)

***

# services/auth.service

## Interfaces

### JwtPayload

Defined in: [src/services/auth.service.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L68)

Structure of the JWT payload.

#### Properties

##### email

> **email**: `string`

Defined in: [src/services/auth.service.ts:72](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L72)

User's email address

##### jti

> **jti**: `string`

Defined in: [src/services/auth.service.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L76)

Unique Token ID (JWT ID)

##### permissions?

> `optional` **permissions**: `string`[]

Defined in: [src/services/auth.service.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L84)

List of permission codes assigned to the user

##### role?

> `optional` **role**: `string`

Defined in: [src/services/auth.service.ts:82](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L82)

Primary/First role code

##### roles?

> `optional` **roles**: `string`[]

Defined in: [src/services/auth.service.ts:80](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L80)

List of role codes assigned to the user

##### stakeholderType?

> `optional` **stakeholderType**: `string`

Defined in: [src/services/auth.service.ts:86](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L86)

Calculated stakeholder type (banking, platform, etc.)

##### sub

> **sub**: `string`

Defined in: [src/services/auth.service.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L70)

User ID (Subject)

##### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/auth.service.ts:74](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L74)

Optional tenant ID associated with the user

##### type

> **type**: `"access"` &#124; `"refresh"`

Defined in: [src/services/auth.service.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L78)

Token type: either 'access' or 'refresh'

***

### LoginInput

Defined in: [src/services/auth.service.ts:42](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L42)

Input for the login operation.

#### Properties

##### email

> **email**: `string`

Defined in: [src/services/auth.service.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L44)

User's email address

##### password

> **password**: `string`

Defined in: [src/services/auth.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L46)

User's plain text password

##### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/auth.service.ts:48](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L48)

Optional tenant ID or slug for split authentication

***

### TokenPair

Defined in: [src/services/auth.service.ts:54](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L54)

Pair of JWT tokens issued upon successful authentication.

#### Properties

##### accessToken

> **accessToken**: `string`

Defined in: [src/services/auth.service.ts:56](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L56)

Brief lived access token for authorization

##### expiresIn

> **expiresIn**: `number`

Defined in: [src/services/auth.service.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L60)

Expiry time for the access token in seconds

##### refreshExpiresIn

> **refreshExpiresIn**: `number`

Defined in: [src/services/auth.service.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L62)

Expiry time for the refresh token in seconds

##### refreshToken

> **refreshToken**: `string`

Defined in: [src/services/auth.service.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L58)

Longer lived refresh token for obtaining new access tokens

***

### UserWithRoles

Defined in: [src/services/auth.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L16)

Extended User type with roles and permissions injected at runtime.

#### Extends

- [`User`](db.schema.core.md#user)

#### Properties

##### backupCodes

> **backupCodes**: `string`[] &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`backupCodes`](#backupcodes)

##### bankId

> **bankId**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`bankId`](#bankid)

##### createdAt

> **createdAt**: `Date` &#124; `null`

###### Inherited from

`User.createdAt`

##### department

> **department**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`department`](#department)

##### email

> **email**: `string`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`email`](#email-2)

##### emailVerifiedAt

> **emailVerifiedAt**: `Date` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`emailVerifiedAt`](#emailverifiedat)

##### employeeId

> **employeeId**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`employeeId`](#employeeid)

##### failedLoginAttempts

> **failedLoginAttempts**: `number` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`failedLoginAttempts`](#failedloginattempts)

##### forcePasswordChange

> **forcePasswordChange**: `boolean` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`forcePasswordChange`](#forcepasswordchange)

##### fullName

> **fullName**: `string`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`fullName`](#fullname)

##### id

> **id**: `string`

###### Inherited from

`User.id`

##### isActive

> **isActive**: `boolean` &#124; `null`

###### Inherited from

`User.isActive`

##### isVerified

> **isVerified**: `boolean` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`isVerified`](#isverified)

##### lastLoginAt

> **lastLoginAt**: `Date` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`lastLoginAt`](#lastloginat)

##### loginCount

> **loginCount**: `number` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`loginCount`](#logincount)

##### mfaEnabled

> **mfaEnabled**: `boolean` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`mfaEnabled`](#mfaenabled)

##### mfaSecret

> **mfaSecret**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`mfaSecret`](#mfasecret)

##### passwordChangedAt

> **passwordChangedAt**: `Date` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`passwordChangedAt`](#passwordchangedat)

##### passwordHash

> **passwordHash**: `string`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`passwordHash`](#passwordhash)

##### permissions

> **permissions**: `string`[]

Defined in: [src/services/auth.service.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L18)

##### phone

> **phone**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`phone`](#phone)

##### position

> **position**: `string` &#124; `null`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`position`](#position)

##### roles

> **roles**: `string`[]

Defined in: [src/services/auth.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L17)

##### tenantId

> **tenantId**: `string` &#124; `null`

###### Inherited from

`User.tenantId`

##### updatedAt

> **updatedAt**: `Date` &#124; `null`

###### Inherited from

`User.updatedAt`

##### username

> **username**: `string`

###### Inherited from

[`UserWithRoles`](#userwithroles).[`username`](#username)

## Functions

### getSession()

> **getSession**(`accessTokenId`): `Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

Defined in: [src/services/auth.service.ts:775](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L775)

Get session information from Redis by access token ID.

#### Parameters

##### accessTokenId

`string`

The unique ID of the access token

#### Returns

`Effect`&lt;`any`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

An Effect that succeeds with the session data object

***

### hashPassword()

> **hashPassword**(`password`): `Promise`&lt;`string`&gt;

Defined in: [src/services/auth.service.ts:253](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L253)

Hash a password using Bun's built-in password hashing.

#### Parameters

##### password

`string`

The plain text password to hash

#### Returns

`Promise`&lt;`string`&gt;

A promise that resolves to the hashed password string

***

### login()

> **login**(`input`, `metadata?`): `Effect`&lt;&#123; `tokens`: [`TokenPair`](#tokenpair); `user`: [`UserWithRoles`](#userwithroles); &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

Defined in: [src/services/auth.service.ts:288](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L288)

Login a user with email and password.

Supports Split Authentication:
- If `tenantId` is provided: Authenticates against the Tenant-specific Database.
- If `tenantId` is missing: Authenticates against the Platform/Core Database.

#### Parameters

##### input

[`LoginInput`](#logininput)

The login credentials and optional tenant ID

##### metadata?

Optional metadata like IP address and User Agent for logging

###### ip?

`string`

###### userAgent?

`string`

#### Returns

`Effect`&lt;&#123; `tokens`: [`TokenPair`](#tokenpair); `user`: [`UserWithRoles`](#userwithroles); &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

An Effect that succeeds with the user and token pair, or fails with a Database/Authentication error

***

### logout()

> **logout**(`accessTokenId`, `reason?`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/auth.service.ts:632](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L632)

Logout a user by revoking their session.

#### Parameters

##### accessTokenId

`string`

The unique ID of the access token to revoke

##### reason?

`string`

Optional reason for logging out

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds when the session is removed

***

### refreshTokens()

> **refreshTokens**(`refreshToken`): `Effect`&lt;[`TokenPair`](#tokenpair), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

Defined in: [src/services/auth.service.ts:656](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L656)

Refresh tokens using a valid refresh token.

#### Parameters

##### refreshToken

`string`

The valid refresh token string

#### Returns

`Effect`&lt;[`TokenPair`](#tokenpair), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`AuthenticationError`](lib.errors.md#authenticationerror)&gt;

An Effect that succeeds with a new TokenPair

***

### revokeAllSessions()

> **revokeAllSessions**(`userId`, `reason?`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/auth.service.ts:800](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L800)

Revoke all active sessions for a specific user.

#### Parameters

##### userId

`string`

ID of the user whose sessions should be revoked

##### reason?

`string`

Optional reason for revocation

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds when all sessions are deleted from Redis

***

### verifyPassword()

> **verifyPassword**(`password`, `hash`): `Promise`&lt;`boolean`&gt;

Defined in: [src/services/auth.service.ts:269](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L269)

Verify a password against a hash.

#### Parameters

##### password

`string`

The plain text password to verify

##### hash

`string`

The stored password hash

#### Returns

`Promise`&lt;`boolean`&gt;

A promise that resolves to true if the password matches, false otherwise

***

### verifyToken()

> **verifyToken**(`token`, `expectedType?`): `Promise`&lt;[`JwtPayload`](#jwtpayload)&gt;

Defined in: [src/services/auth.service.ts:202](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/auth.service.ts#L202)

Verify and decode a JWT token.

#### Parameters

##### token

`string`

The JWT string to verify

##### expectedType?

`"access"` | `"refresh"`

#### Returns

`Promise`&lt;[`JwtPayload`](#jwtpayload)&gt;

The decoded payload as a JwtPayload object

#### Throws

If the token is invalid or expired
