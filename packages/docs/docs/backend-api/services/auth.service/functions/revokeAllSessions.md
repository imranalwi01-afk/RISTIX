[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: revokeAllSessions()

> **revokeAllSessions**(`userId`, `reason?`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/services/auth.service.ts:598](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L598)

Revoke all active sessions for a specific user.

## Parameters

### userId

`string`

ID of the user whose sessions should be revoked

### reason?

`string`

Optional reason for revocation

## Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds when all sessions are deleted from Redis
