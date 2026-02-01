[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logout()

> **logout**(`accessTokenId`, `reason?`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:485](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L485)

Logout a user by revoking their session.

## Parameters

### accessTokenId

`string`

The unique ID of the access token to revoke

### reason?

`string`

Optional reason for logging out

## Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds when the session is removed
