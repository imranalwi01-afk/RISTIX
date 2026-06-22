[**Frontend API Reference v1.0.0**](index.md)

***

# utils/auth-token

## Functions

### clearAuthTokens()

> **clearAuthTokens**(): `void`

Defined in: [utils/auth-token.ts:118](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-token.ts#L118)

Clear all authentication tokens from cookies and storage

#### Returns

`void`

***

### getAuthToken()

> **getAuthToken**(): `string` &#124; `null`

Defined in: [utils/auth-token.ts:92](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-token.ts#L92)

Get authentication token from cookies or localStorage
Prioritizes cookies for better security and SSR/middleware consistency

#### Returns

`string` &#124; `null`

***

### syncTokenToCookie()

> **syncTokenToCookie**(`token`): `void`

Defined in: [utils/auth-token.ts:148](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-token.ts#L148)

Sync token to cookie (helper for non-AuthProvider contexts)

#### Parameters

##### token

`string` | `null`

#### Returns

`void`
