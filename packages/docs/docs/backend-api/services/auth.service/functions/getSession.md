[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getSession()

> **getSession**(`accessTokenId`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [src/services/auth.service.ts:759](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L759)

Get session information from Redis by access token ID.

## Parameters

### accessTokenId

`string`

The unique ID of the access token

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with the session data object
