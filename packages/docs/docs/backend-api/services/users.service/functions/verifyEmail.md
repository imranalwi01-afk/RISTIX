[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyEmail()

> **verifyEmail**(`userId`, `tenantId?`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

Defined in: [src/services/users.service.ts:328](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/users.service.ts#L328)

Mark email as verified.

## Parameters

### userId

`string`

The user ID

### tenantId?

`string`

Optional tenant ID

## Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`NotFoundError`](../../../lib/errors/classes/NotFoundError.md)\>

An Effect resolving to the updated user
