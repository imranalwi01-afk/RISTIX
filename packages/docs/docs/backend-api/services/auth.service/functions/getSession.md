[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getSession()

> **getSession**(`accessTokenId`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [src/services/auth.service.ts:759](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L759)

Get session information from Redis by access token ID.

## Parameters

### accessTokenId

`string`

The unique ID of the access token

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with the session data object
