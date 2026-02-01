[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyPassword()

> **verifyPassword**(`password`, `hash`): `Promise`\<`boolean`\>

Defined in: [packages/new-backend/src/services/auth.service.ts:221](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L221)

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
