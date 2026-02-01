[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: login()

> **login**(`input`, `metadata?`): `Effect`\<\{ `tokens`: [`TokenPair`](../interfaces/TokenPair.md); `user`: \{ `backupCodes`: `string`[] \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:240](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L240)

Login a user with email and password.

Supports Split Authentication:
- If `tenantId` is provided: Authenticates against the Tenant-specific Database.
- If `tenantId` is missing: Authenticates against the Platform/Core Database.

## Parameters

### input

[`LoginInput`](../interfaces/LoginInput.md)

The login credentials and optional tenant ID

### metadata?

Optional metadata like IP address and User Agent for logging

#### ip?

`string`

#### userAgent?

`string`

## Returns

`Effect`\<\{ `tokens`: [`TokenPair`](../interfaces/TokenPair.md); `user`: \{ `backupCodes`: `string`[] \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with the user and token pair, or fails with a Database/Authentication error
