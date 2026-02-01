[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getSession()

> **getSession**(`accessTokenId`): `Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:573](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L573)

Get session information from Redis by access token ID.

## Parameters

### accessTokenId

`string`

The unique ID of the access token

## Returns

`Effect`\<`any`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md) \| [`AuthenticationError`](../../../lib/errors/classes/AuthenticationError.md)\>

An Effect that succeeds with the session data object
