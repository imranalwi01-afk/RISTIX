[**Frontend API Reference v1.0.0**](index.md)

***

# utils/auth-debug

## Interfaces

### AuthDebugInfo

Defined in: [utils/auth-debug.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L11)

#### Properties

##### backendUrl

> **backendUrl**: `string`

Defined in: [utils/auth-debug.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L28)

##### hasRefreshToken

> **hasRefreshToken**: `boolean`

Defined in: [utils/auth-debug.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L14)

##### hasToken

> **hasToken**: `boolean`

Defined in: [utils/auth-debug.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L12)

##### hasUserData

> **hasUserData**: `boolean`

Defined in: [utils/auth-debug.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L13)

##### lastActivity?

> `optional` **lastActivity**: `string`

Defined in: [utils/auth-debug.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L29)

##### refreshToken?

> `optional` **refreshToken**: `string`

Defined in: [utils/auth-debug.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L16)

##### token?

> `optional` **token**: `string`

Defined in: [utils/auth-debug.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L15)

##### tokenInfo?

> `optional` **tokenInfo**: `object`

Defined in: [utils/auth-debug.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L17)

###### isValidFormat

> **isValidFormat**: `boolean`

###### length

> **length**: `number`

###### preview

> **preview**: `string`

##### userInfo?

> `optional` **userInfo**: `object`

Defined in: [utils/auth-debug.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L22)

###### email

> **email**: `string`

###### role

> **role**: `string`

###### tenantId

> **tenantId**: `string`

###### userId

> **userId**: `string`

## Variables

### authDebugger

> `const` **authDebugger**: `object`

Defined in: [utils/auth-debug.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/frontend/src/utils/auth-debug.ts#L32)

#### Type Declaration

##### clearAuthData()

> **clearAuthData**(): `void`

###### Returns

`void`

##### fixAuthIssues()

> **fixAuthIssues**(): `Promise`&lt;&#123; `actions`: `string`[]; `fixed`: `boolean`; &#125;&gt;

###### Returns

`Promise`&lt;&#123; `actions`: `string`[]; `fixed`: `boolean`; &#125;&gt;

##### getAuthInfo()

> **getAuthInfo**(): [`AuthDebugInfo`](#authdebuginfo)

###### Returns

[`AuthDebugInfo`](#authdebuginfo)

##### healthCheck()

> **healthCheck**(): `Promise`&lt;&#123; `authInfo`: [`AuthDebugInfo`](#authdebuginfo); `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; &#125;&gt;

###### Returns

`Promise`&lt;&#123; `authInfo`: [`AuthDebugInfo`](#authdebuginfo); `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; &#125;&gt;

##### logAuthInfo()

> **logAuthInfo**(): `void`

###### Returns

`void`

##### testTokenValidity()

> **testTokenValidity**(): `Promise`&lt;&#123; `details?`: `any`; `error?`: `string`; `valid`: `boolean`; &#125;&gt;

###### Returns

`Promise`&lt;&#123; `details?`: `any`; `error?`: `string`; `valid`: `boolean`; &#125;&gt;

## References

### default

Renames and re-exports [authDebugger](#authdebugger)
