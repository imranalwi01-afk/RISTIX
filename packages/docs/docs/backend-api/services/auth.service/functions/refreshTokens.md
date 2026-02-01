[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: refreshTokens()

> **refreshTokens**(`refreshToken`): `Effect`\<[`TokenPair`](../interfaces/TokenPair.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:509](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L509)

Refresh tokens using a valid refresh token.

## Parameters

### refreshToken

`string`

The valid refresh token string

## Returns

`Effect`\<[`TokenPair`](../interfaces/TokenPair.md), [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with a new TokenPair
