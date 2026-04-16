[**Frontend API Reference v1.0.0**](index.md)

***

# utils/auth-debug

## Interfaces

### AuthDebugInfo

Defined in: [utils/auth-debug.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L11)

#### Properties

##### backendUrl

> **backendUrl**: `string`

Defined in: [utils/auth-debug.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L28)

##### hasRefreshToken

> **hasRefreshToken**: `boolean`

Defined in: [utils/auth-debug.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L14)

##### hasToken

> **hasToken**: `boolean`

Defined in: [utils/auth-debug.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L12)

##### hasUserData

> **hasUserData**: `boolean`

Defined in: [utils/auth-debug.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L13)

##### lastActivity?

> `optional` **lastActivity**: `string`

Defined in: [utils/auth-debug.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L29)

##### refreshToken?

> `optional` **refreshToken**: `string`

Defined in: [utils/auth-debug.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L16)

##### token?

> `optional` **token**: `string`

Defined in: [utils/auth-debug.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L15)

##### tokenInfo?

> `optional` **tokenInfo**: `object`

Defined in: [utils/auth-debug.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L17)

###### isValidFormat

> **isValidFormat**: `boolean`

###### length

> **length**: `number`

###### preview

> **preview**: `string`

##### userInfo?

> `optional` **userInfo**: `object`

Defined in: [utils/auth-debug.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L22)

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

Defined in: [utils/auth-debug.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/frontend/src/utils/auth-debug.ts#L32)

#### Type Declaration

##### clearAuthData()

> **clearAuthData**(): `void`

###### Returns

`void`

##### fixAuthIssues()

> **fixAuthIssues**(): `Promise`\<\{ `actions`: `string`[]; `fixed`: `boolean`; \}\>

###### Returns

`Promise`\<\{ `actions`: `string`[]; `fixed`: `boolean`; \}\>

##### getAuthInfo()

> **getAuthInfo**(): [`AuthDebugInfo`](#authdebuginfo)

###### Returns

[`AuthDebugInfo`](#authdebuginfo)

##### healthCheck()

> **healthCheck**(): `Promise`\<\{ `authInfo`: [`AuthDebugInfo`](#authdebuginfo); `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; \}\>

###### Returns

`Promise`\<\{ `authInfo`: [`AuthDebugInfo`](#authdebuginfo); `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; \}\>

##### logAuthInfo()

> **logAuthInfo**(): `void`

###### Returns

`void`

##### testTokenValidity()

> **testTokenValidity**(): `Promise`\<\{ `details?`: `any`; `error?`: `string`; `valid`: `boolean`; \}\>

###### Returns

`Promise`\<\{ `details?`: `any`; `error?`: `string`; `valid`: `boolean`; \}\>

## References

### default

Renames and re-exports [authDebugger](#authdebugger)
