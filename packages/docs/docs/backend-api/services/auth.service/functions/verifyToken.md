[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyToken()

> **verifyToken**(`token`, `expectedType?`): `Promise`\<[`JwtPayload`](../interfaces/JwtPayload.md)\>

Defined in: [src/services/auth.service.ts:201](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L201)

Verify and decode a JWT token.

## Parameters

### token

`string`

The JWT string to verify

### expectedType?

`"access"` | `"refresh"`

## Returns

`Promise`\<[`JwtPayload`](../interfaces/JwtPayload.md)\>

The decoded payload as a JwtPayload object

## Throws

If the token is invalid or expired
