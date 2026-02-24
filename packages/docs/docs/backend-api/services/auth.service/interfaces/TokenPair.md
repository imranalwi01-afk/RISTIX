[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: TokenPair

Defined in: [src/services/auth.service.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L53)

Pair of JWT tokens issued upon successful authentication.

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [src/services/auth.service.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L55)

Brief lived access token for authorization

***

### expiresIn

> **expiresIn**: `number`

Defined in: [src/services/auth.service.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L59)

Expiry time for the access token in seconds

***

### refreshExpiresIn

> **refreshExpiresIn**: `number`

Defined in: [src/services/auth.service.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L61)

Expiry time for the refresh token in seconds

***

### refreshToken

> **refreshToken**: `string`

Defined in: [src/services/auth.service.ts:57](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L57)

Longer lived refresh token for obtaining new access tokens
