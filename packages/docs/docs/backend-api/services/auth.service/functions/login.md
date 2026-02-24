[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: login()

> **login**(`input`, `metadata?`): `Effect`\<\{ `tokens`: [`TokenPair`](../interfaces/TokenPair.md); `user`: [`UserWithRoles`](../interfaces/UserWithRoles.md); \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [src/services/auth.service.ts:287](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L287)

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

`Effect`\<\{ `tokens`: [`TokenPair`](../interfaces/TokenPair.md); `user`: [`UserWithRoles`](../interfaces/UserWithRoles.md); \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with the user and token pair, or fails with a Database/Authentication error
