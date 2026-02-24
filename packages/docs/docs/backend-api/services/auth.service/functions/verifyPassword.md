[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyPassword()

> **verifyPassword**(`password`, `hash`): `Promise`\<`boolean`\>

Defined in: [src/services/auth.service.ts:268](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L268)

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
