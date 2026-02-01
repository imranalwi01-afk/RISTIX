[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: verifyToken()

> **verifyToken**(`token`): `Promise`\<[`JwtPayload`](../interfaces/JwtPayload.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:190](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L190)

Verify and decode a JWT token.

## Parameters

### token

`string`

The JWT string to verify

## Returns

`Promise`\<[`JwtPayload`](../interfaces/JwtPayload.md)\>

The decoded payload as a JwtPayload object

## Throws

If the token is invalid or expired
