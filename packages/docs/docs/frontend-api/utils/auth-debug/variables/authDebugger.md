[**Frontend API Reference v1.0.0**](../../../README.md)

***

# Variable: authDebugger

> `const` **authDebugger**: `object`

Defined in: [utils/auth-debug.ts:32](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/frontend/src/utils/auth-debug.ts#L32)

## Type Declaration

### clearAuthData()

> **clearAuthData**(): `void`

#### Returns

`void`

### fixAuthIssues()

> **fixAuthIssues**(): `Promise`\<\{ `actions`: `string`[]; `fixed`: `boolean`; \}\>

#### Returns

`Promise`\<\{ `actions`: `string`[]; `fixed`: `boolean`; \}\>

### getAuthInfo()

> **getAuthInfo**(): `AuthDebugInfo`

#### Returns

`AuthDebugInfo`

### healthCheck()

> **healthCheck**(): `Promise`\<\{ `authInfo`: `AuthDebugInfo`; `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; \}\>

#### Returns

`Promise`\<\{ `authInfo`: `AuthDebugInfo`; `healthy`: `boolean`; `issues`: `string`[]; `recommendations`: `string`[]; \}\>

### logAuthInfo()

> **logAuthInfo**(): `void`

#### Returns

`void`

### testTokenValidity()

> **testTokenValidity**(): `Promise`\<\{ `details?`: `any`; `error?`: `string`; `valid`: `boolean`; \}\>

#### Returns

`Promise`\<\{ `details?`: `any`; `error?`: `string`; `valid`: `boolean`; \}\>
