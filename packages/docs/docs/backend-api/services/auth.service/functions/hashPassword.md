[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: hashPassword()

> **hashPassword**(`password`): `Promise`\<`string`\>

Defined in: [src/services/auth.service.ts:252](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L252)

Hash a password using Bun's built-in password hashing.

## Parameters

### password

`string`

The plain text password to hash

## Returns

`Promise`\<`string`\>

A promise that resolves to the hashed password string
