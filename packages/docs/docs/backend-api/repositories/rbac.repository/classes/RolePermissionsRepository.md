[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: RolePermissionsRepository

Defined in: [src/repositories/rbac.repository.ts:399](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L399)

Repository for managing permissions assigned to roles.

## Constructors

### Constructor

> **new RolePermissionsRepository**(): `RolePermissionsRepository`

#### Returns

`RolePermissionsRepository`

## Methods

### assign()

> **assign**(`db`, `roleId`, `permissionId`): `Effect`\<\{ `grantedAt`: `Date`; `grantedBy`: `string` \| `null`; `id`: `string`; `permissionId`: `string`; `roleId`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:408](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L408)

Assign a permission to a role.

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

Drizzle database instance

##### roleId

`string`

The role ID

##### permissionId

`string`

The permission ID

#### Returns

`Effect`\<\{ `grantedAt`: `Date`; `grantedBy`: `string` \| `null`; `id`: `string`; `permissionId`: `string`; `roleId`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

An Effect that succeeds with the created RolePermission record

***

### findByRole()

> **findByRole**(`db`, `roleId`): `Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:439](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L439)

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### roleId

`string`

#### Returns

`Effect`\<`object`[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### remove()

> **remove**(`db`, `roleId`, `permissionId`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:417](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L417)

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### roleId

`string`

##### permissionId

`string`

#### Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

***

### set()

> **set**(`db`, `roleId`, `permissionIds`): `Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/repositories/rbac.repository.ts:425](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/rbac.repository.ts#L425)

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### roleId

`string`

##### permissionIds

`string`[]

#### Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
