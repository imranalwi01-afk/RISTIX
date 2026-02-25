[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyToken()

> **verifyToken**(`token`, `expectedType?`): `Promise`\<[`JwtPayload`](../interfaces/JwtPayload.md)\>

Defined in: [src/services/auth.service.ts:201](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L201)

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
