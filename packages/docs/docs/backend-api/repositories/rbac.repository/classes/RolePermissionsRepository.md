[**Backend API Reference v1.0.0**](../../../README.md)

***

# Class: RolePermissionsRepository

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:396](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L396)

Repository for managing permissions assigned to roles.

## Constructors

### Constructor

> **new RolePermissionsRepository**(): `RolePermissionsRepository`

#### Returns

`RolePermissionsRepository`

## Methods

### assign()

> **assign**(`db`, `roleId`, `permissionId`): `Effect`\<\{ `grantedAt`: `Date`; `grantedBy`: `string` \| `null`; `id`: `string`; `permissionId`: `string`; `roleId`: `string`; \}, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:405](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L405)

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

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:436](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L436)

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

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:414](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L414)

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

Defined in: [packages/new-backend/src/repositories/rbac.repository.ts:422](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/rbac.repository.ts#L422)

#### Parameters

##### db

[`DrizzleDB`](../type-aliases/DrizzleDB.md)

##### roleId

`string`

##### permissionIds

`string`[]

#### Returns

`Effect`\<`void`, [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
