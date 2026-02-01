[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: hashPassword()

> **hashPassword**(`password`): `Promise`\<`string`\>

Defined in: [packages/new-backend/src/services/auth.service.ts:205](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L205)

Hash a password using Bun's built-in password hashing.

## Parameters

### password

`string`

The plain text password to hash

## Returns

`Promise`\<`string`\>

A promise that resolves to the hashed password string
