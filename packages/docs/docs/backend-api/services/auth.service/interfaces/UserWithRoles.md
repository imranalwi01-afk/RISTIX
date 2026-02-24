[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: UserWithRoles

Defined in: [src/services/auth.service.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L15)

Extended User type with roles and permissions injected at runtime.

## Extends

- [`User`](../../../db/schema/core/type-aliases/User.md)

## Properties

### backupCodes

> **backupCodes**: `string`[] \| `null`

#### Inherited from

`UserWithRoles`.[`backupCodes`](#backupcodes)

***

### bankId

> **bankId**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`bankId`](#bankid)

***

### createdAt

> **createdAt**: `Date` \| `null`

#### Inherited from

`User.createdAt`

***

### department

> **department**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`department`](#department)

***

### email

> **email**: `string`

#### Inherited from

`UserWithRoles`.[`email`](#email)

***

### emailVerifiedAt

> **emailVerifiedAt**: `Date` \| `null`

#### Inherited from

`UserWithRoles`.[`emailVerifiedAt`](#emailverifiedat)

***

### employeeId

> **employeeId**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`employeeId`](#employeeid)

***

### failedLoginAttempts

> **failedLoginAttempts**: `number` \| `null`

#### Inherited from

`UserWithRoles`.[`failedLoginAttempts`](#failedloginattempts)

***

### forcePasswordChange

> **forcePasswordChange**: `boolean` \| `null`

#### Inherited from

`UserWithRoles`.[`forcePasswordChange`](#forcepasswordchange)

***

### fullName

> **fullName**: `string`

#### Inherited from

`UserWithRoles`.[`fullName`](#fullname)

***

### id

> **id**: `string`

#### Inherited from

`User.id`

***

### isActive

> **isActive**: `boolean` \| `null`

#### Inherited from

`User.isActive`

***

### isVerified

> **isVerified**: `boolean` \| `null`

#### Inherited from

`UserWithRoles`.[`isVerified`](#isverified)

***

### lastLoginAt

> **lastLoginAt**: `Date` \| `null`

#### Inherited from

`UserWithRoles`.[`lastLoginAt`](#lastloginat)

***

### loginCount

> **loginCount**: `number` \| `null`

#### Inherited from

`UserWithRoles`.[`loginCount`](#logincount)

***

### mfaEnabled

> **mfaEnabled**: `boolean` \| `null`

#### Inherited from

`UserWithRoles`.[`mfaEnabled`](#mfaenabled)

***

### mfaSecret

> **mfaSecret**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`mfaSecret`](#mfasecret)

***

### passwordChangedAt

> **passwordChangedAt**: `Date` \| `null`

#### Inherited from

`UserWithRoles`.[`passwordChangedAt`](#passwordchangedat)

***

### passwordHash

> **passwordHash**: `string`

#### Inherited from

`UserWithRoles`.[`passwordHash`](#passwordhash)

***

### permissions

> **permissions**: `string`[]

Defined in: [src/services/auth.service.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L17)

***

### phone

> **phone**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`phone`](#phone)

***

### position

> **position**: `string` \| `null`

#### Inherited from

`UserWithRoles`.[`position`](#position)

***

### roles

> **roles**: `string`[]

Defined in: [src/services/auth.service.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L16)

***

### tenantId

> **tenantId**: `string` \| `null`

#### Inherited from

`User.tenantId`

***

### updatedAt

> **updatedAt**: `Date` \| `null`

#### Inherited from

`User.updatedAt`

***

### username

> **username**: `string`

#### Inherited from

`UserWithRoles`.[`username`](#username)
