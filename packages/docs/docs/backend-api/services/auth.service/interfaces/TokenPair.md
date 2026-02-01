[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: TokenPair

Defined in: [packages/new-backend/src/services/auth.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L45)

Pair of JWT tokens issued upon successful authentication.

## Properties

### accessToken

> **accessToken**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L47)

Brief lived access token for authorization

***

### expiresIn

> **expiresIn**: `number`

Defined in: [packages/new-backend/src/services/auth.service.ts:51](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L51)

Expiry time for the access token in seconds

***

### refreshExpiresIn

> **refreshExpiresIn**: `number`

Defined in: [packages/new-backend/src/services/auth.service.ts:53](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L53)

Expiry time for the refresh token in seconds

***

### refreshToken

> **refreshToken**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L49)

Longer lived refresh token for obtaining new access tokens
