[**Backend API Reference v1.0.0**](index.md)

***

# lib/password-policy

## Interfaces

### PasswordPolicy

Defined in: [src/lib/password-policy.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L5)

#### Properties

##### minLength

> **minLength**: `number`

Defined in: [src/lib/password-policy.ts:6](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L6)

##### requireLowercase

> **requireLowercase**: `boolean`

Defined in: [src/lib/password-policy.ts:8](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L8)

##### requireNumbers

> **requireNumbers**: `boolean`

Defined in: [src/lib/password-policy.ts:9](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L9)

##### requireSpecialChars

> **requireSpecialChars**: `boolean`

Defined in: [src/lib/password-policy.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L10)

##### requireUppercase

> **requireUppercase**: `boolean`

Defined in: [src/lib/password-policy.ts:7](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L7)

## Functions

### validatePasswordPolicy()

> **validatePasswordPolicy**(`password`, `tenantId`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;

Defined in: [src/lib/password-policy.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/lib/password-policy.ts#L21)

#### Parameters

##### password

`string`

##### tenantId

`string`

#### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`ValidationError`](lib.errors.md#validationerror)&gt;
