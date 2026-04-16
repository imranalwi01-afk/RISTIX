[**Frontend API Reference v1.0.0**](index.md)

***

# utils/auth-token

## Functions

### clearAuthTokens()

> **clearAuthTokens**(): `void`

Defined in: [utils/auth-token.ts:34](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-token.ts#L34)

Clear all authentication tokens from cookies and storage

#### Returns

`void`

***

### getAuthToken()

> **getAuthToken**(): `string` \| `null`

Defined in: [utils/auth-token.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-token.ts#L8)

Get authentication token from cookies or localStorage
Prioritizes cookies for better security and SSR/middleware consistency

#### Returns

`string` \| `null`

***

### syncTokenToCookie()

> **syncTokenToCookie**(`token`): `void`

Defined in: [utils/auth-token.ts:58](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-token.ts#L58)

Sync token to cookie (helper for non-AuthProvider contexts)

#### Parameters

##### token

`string` | `null`

#### Returns

`void`
