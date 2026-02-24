[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: hashPassword()

> **hashPassword**(`password`): `Promise`\<`string`\>

Defined in: [src/services/auth.service.ts:252](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L252)

Hash a password using Bun's built-in password hashing.

## Parameters

### password

`string`

The plain text password to hash

## Returns

`Promise`\<`string`\>

A promise that resolves to the hashed password string
