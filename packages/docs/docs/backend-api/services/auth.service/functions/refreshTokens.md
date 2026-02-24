[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: refreshTokens()

> **refreshTokens**(`refreshToken`): `Effect`\<[`TokenPair`](../interfaces/TokenPair.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [src/services/auth.service.ts:640](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L640)

Refresh tokens using a valid refresh token.

## Parameters

### refreshToken

`string`

The valid refresh token string

## Returns

`Effect`\<[`TokenPair`](../interfaces/TokenPair.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with a new TokenPair
