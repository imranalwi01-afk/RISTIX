[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: createUser()

> **createUser**(`input`): `Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md)\>

Defined in: [src/services/users.service.ts:114](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/users.service.ts#L114)

Create a new user.
Hashes the password and creates the user record.

## Parameters

### input

[`CreateUserInput`](../interfaces/CreateUserInput.md)

The user creation data

## Returns

`Effect`\<\{ `backupCodes`: `string`[] \| `null`; `bankId`: `string` \| `null`; `createdAt`: `Date` \| `null`; `department`: `string` \| `null`; `email`: `string`; `emailVerifiedAt`: `Date` \| `null`; `employeeId`: `string` \| `null`; `failedLoginAttempts`: `number` \| `null`; `forcePasswordChange`: `boolean` \| `null`; `fullName`: `string`; `id`: `string`; `isActive`: `boolean` \| `null`; `isVerified`: `boolean` \| `null`; `lastLoginAt`: `Date` \| `null`; `loginCount`: `number` \| `null`; `mfaEnabled`: `boolean` \| `null`; `mfaSecret`: `string` \| `null`; `passwordChangedAt`: `Date` \| `null`; `passwordHash`: `string`; `phone`: `string` \| `null`; `position`: `string` \| `null`; `tenantId`: `string` \| `null`; `updatedAt`: `Date` \| `null`; `username`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`ValidationError`](../../../lib/errors/classes/ValidationError.md)\>

An Effect resolving to the created User or an error (DatabaseError/ValidationError)
