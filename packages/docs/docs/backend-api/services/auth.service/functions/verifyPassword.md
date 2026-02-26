[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyPassword()

> **verifyPassword**(`password`, `hash`): `Promise`\<`boolean`\>

Defined in: [src/services/auth.service.ts:268](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L268)

Verify a password against a hash.

## Parameters

### password

`string`

The plain text password to verify

### hash

`string`

The stored password hash

## Returns

`Promise`\<`boolean`\>

A promise that resolves to true if the password matches, false otherwise
