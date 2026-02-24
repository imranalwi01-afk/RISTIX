[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: logout()

> **logout**(`accessTokenId`, `reason?`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/auth.service.ts:616](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L616)

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
