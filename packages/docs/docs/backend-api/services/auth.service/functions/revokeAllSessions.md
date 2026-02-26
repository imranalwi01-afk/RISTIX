[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: revokeAllSessions()

> **revokeAllSessions**(`userId`, `reason?`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/auth.service.ts:784](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L784)

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
