[**Backend API Reference v1.0.0**](index.md)

***

# services/impersonate.service

## Functions

### impersonateUser()

> **impersonateUser**(`targetUserId`, `tenantId`): `Promise`&lt;&#123; `tokens`: &#123; `accessToken`: `string`; `expiresIn`: `number`; `refreshExpiresIn`: `number`; `refreshToken`: `string`; &#125;; `user`: `any`; &#125;&gt;

Defined in: [src/services/impersonate.service.ts:46](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/impersonate.service.ts#L46)

#### Parameters

##### targetUserId

`string`

##### tenantId

`string`

#### Returns

`Promise`&lt;&#123; `tokens`: &#123; `accessToken`: `string`; `expiresIn`: `number`; `refreshExpiresIn`: `number`; `refreshToken`: `string`; &#125;; `user`: `any`; &#125;&gt;
