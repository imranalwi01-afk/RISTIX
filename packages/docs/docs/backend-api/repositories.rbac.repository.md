[**Backend API Reference v1.0.0**](index.md)

***

# repositories/rbac.repository

## Classes

### PermissionsRepository

Defined in: [src/repositories/rbac.repository.ts:300](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L300)

Repository for managing granular permissions.

#### Constructors

##### Constructor

> **new PermissionsRepository**(): [`PermissionsRepository`](#permissionsrepository)

###### Returns

[`PermissionsRepository`](#permissionsrepository)

#### Methods

##### create()

> **create**(`db`, `data`): `Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:354](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L354)

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### data

###### action

`string`

###### category?

`string` &#124; `null`

###### code

`string`

###### createdAt?

`Date`

###### description?

`string` &#124; `null`

###### id?

`string`

###### isActive?

`boolean`

###### module?

`string`

###### name

`string`

###### resource

`string`

###### Returns

`Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### findAll()

> **findAll**(`db`, `options?`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:337](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L337)

Find all permissions matching criteria.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### options?

[`PermissionsQueryOptions`](#permissionsqueryoptions)

Query options for filtering permissions

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with an array of Permissions

##### findByCode()

> **findByCode**(`db`, `code`): `Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:324](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L324)

Find a permission by its unique code.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### code

`string`

The permission code (e.g., 'user:read')

###### Returns

`Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the Permission if found

##### findById()

> **findById**(`db`, `id`): `Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/rbac.repository.ts:308](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L308)

Find a permission by its unique ID.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### id

`string`

The permission ID

###### Returns

`Effect`&lt;&#123; `action`: `string`; `category`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `module`: `string`; `name`: `string`; `resource`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect that succeeds with the Permission record

***

### RolePermissionsRepository

Defined in: [src/repositories/rbac.repository.ts:371](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L371)

Repository for managing permissions assigned to roles.

#### Constructors

##### Constructor

> **new RolePermissionsRepository**(): [`RolePermissionsRepository`](#rolepermissionsrepository)

###### Returns

[`RolePermissionsRepository`](#rolepermissionsrepository)

#### Methods

##### assign()

> **assign**(`db`, `roleId`, `permissionId`): `Effect`&lt;&#123; `grantedAt`: `Date`; `grantedBy`: `string` &#124; `null`; `id`: `string`; `permissionId`: `string`; `roleId`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:380](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L380)

Assign a permission to a role.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### roleId

`string`

The role ID

###### permissionId

`string`

The permission ID

###### Returns

`Effect`&lt;&#123; `grantedAt`: `Date`; `grantedBy`: `string` &#124; `null`; `id`: `string`; `permissionId`: `string`; `roleId`: `string`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the created RolePermission record

##### findByRole()

> **findByRole**(`db`, `roleId`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:411](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L411)

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### roleId

`string`

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### remove()

> **remove**(`db`, `roleId`, `permissionId`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:389](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L389)

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### roleId

`string`

###### permissionId

`string`

###### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### set()

> **set**(`db`, `roleId`, `permissionIds`): `Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:397](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L397)

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### roleId

`string`

###### permissionIds

`string`[]

###### Returns

`Effect`&lt;`void`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### RolesRepository

Defined in: [src/repositories/rbac.repository.ts:68](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L68)

Repository for managing roles in the database.

#### Constructors

##### Constructor

> **new RolesRepository**(): [`RolesRepository`](#rolesrepository)

###### Returns

[`RolesRepository`](#rolesrepository)

#### Methods

##### create()

> **create**(`db`, `data`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:217](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L217)

Create a new role record.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### data

The role data to insert

###### complianceLevel?

`string` &#124; `null`

###### createdAt?

`Date` &#124; `null`

###### createdBy?

`string` &#124; `null`

###### description?

`string` &#124; `null`

###### hierarchyLevel?

`number`

###### id?

`string`

###### isActive?

`boolean` &#124; `null`

###### isSystemRole?

`boolean` &#124; `null`

###### roleCode

`string`

###### roleName

`string`

###### tenantId?

`string` &#124; `null`

###### updatedAt?

`Date` &#124; `null`

###### updatedBy?

`string` &#124; `null`

###### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the created Role

##### delete()

> **delete**(`db`, `id`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/rbac.repository.ts:267](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L267)

Deactivates a role record (Soft delete).

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### id

`string`

The ID of the role to deactivate

###### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect that succeeds with the updated Role

##### existsByName()

> **existsByName**(`db`, `roleName`): `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:278](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L278)

Check if a role name already exists in the system.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### roleName

`string`

The role name to check

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with true if the name is taken

##### findAll()

> **findAll**(`db`, `options?`): `Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L113)

Find all roles matching criteria with pagination.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### options?

[`RolesQueryOptions`](#rolesqueryoptions)

Query options including pagination, filters, and includeInactive

###### Returns

`Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with a paginated result of Roles

##### findById()

> **findById**(`db`, `id`): `Effect`&lt;[`RoleWithPermissions`](#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/rbac.repository.ts:76](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L76)

Find a role by its unique ID.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### id

`string`

The role ID to search for

###### Returns

`Effect`&lt;[`RoleWithPermissions`](#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect that succeeds with the Role and its permissions

##### findByName()

> **findByName**(`db`, `roleName`, `tenantId?`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L96)

Find a role by its name within a tenant.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### roleName

`string`

The name of the role

###### tenantId?

`string`

Optional tenant ID for scoping

###### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125; &#124; `undefined`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the Role if found, or undefined

##### findByTenant()

> **findByTenant**(`db`, `tenantId`, `options?`): `Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;[`RoleWithPermissions`](#rolewithpermissions)&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:162](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L162)

Find all roles belonging to a specific tenant with pagination.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### tenantId

`string`

The unique identifier of the tenant

###### options?

[`RolesQueryOptions`](#rolesqueryoptions) & `object`

Query options including pagination and filters

###### Returns

`Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;[`RoleWithPermissions`](#rolewithpermissions)&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with a paginated result of Roles

##### update()

> **update**(`db`, `id`, `data`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/rbac.repository.ts:238](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L238)

Update an existing role record.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### id

`string`

The role ID to update

###### data

`Partial`&lt;[`NewRole`](db.schema.rbac.schema.md#newrole)&gt;

Partial role data containing updates

###### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

An Effect that succeeds with the updated Role

***

### UserRolesRepository

Defined in: [src/repositories/rbac.repository.ts:434](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L434)

Repository for managing user-role associations.

#### Constructors

##### Constructor

> **new UserRolesRepository**(): [`UserRolesRepository`](#userrolesrepository)

###### Returns

[`UserRolesRepository`](#userrolesrepository)

#### Methods

##### assign()

> **assign**(`db`, `data`): `Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:521](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L521)

Assign a role to a user.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### data

The assignment data

###### assignedAt?

`Date` &#124; `null`

###### assignedBy?

`string` &#124; `null`

###### bankingTypeRestriction?

`string` &#124; `null`

###### createdAt?

`Date` &#124; `null`

###### id?

`string`

###### isActive?

`boolean` &#124; `null`

###### isTemporary?

`boolean` &#124; `null`

###### roleId

`string`

###### temporaryReason?

`string` &#124; `null`

###### tenantId

`string`

###### updatedAt?

`Date` &#124; `null`

###### userId

`string`

###### validFrom?

`Date` &#124; `null`

###### validUntil?

`Date` &#124; `null`

###### Returns

`Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with the created assignment

##### exists()

> **exists**(`db`, `userId`, `roleId`): `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:561](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L561)

Check if user has role

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### userId

`string`

###### roleId

`string`

###### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

##### findByRole()

> **findByRole**(`db`, `roleId`, `options?`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:494](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L494)

Find all user assignments for a specific role.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### roleId

`string`

The role ID

###### options?

[`UserRolesQueryOptions`](#userrolesqueryoptions)

Filter options

###### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with an array of UserRole assignments

##### findByUser()

> **findByUser**(`db`, `userId`, `tenantId?`, `options?`): `Effect`&lt;`object` & `object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/repositories/rbac.repository.ts:444](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L444)

Find all roles assigned to a specific user.

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

Drizzle database instance

###### userId

`string`

The user ID

###### tenantId?

`string`

Optional tenant ID to scope the search

###### options?

[`UserRolesQueryOptions`](#userrolesqueryoptions)

Optional query params (activeOnly)

###### Returns

`Effect`&lt;`object` & `object`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with a rich array of UserRoles with associated role and permission data

##### remove()

> **remove**(`db`, `userId`, `roleId`): `Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

Defined in: [src/repositories/rbac.repository.ts:538](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L538)

Remove role assignment

###### Parameters

###### db

[`DrizzleDB`](#drizzledb)

###### userId

`string`

###### roleId

`string`

###### Returns

`Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror)&gt;

## Interfaces

### PermissionsQueryOptions

Defined in: [src/repositories/rbac.repository.ts:292](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L292)

Common query options for repository methods.

#### Extends

- [`QueryOptions`](repositories.base.repository.md#queryoptions)

#### Properties

##### filters?

> `optional` **filters**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`filters`](repositories.base.repository.md#filters)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`includeInactive`](repositories.base.repository.md#includeinactive)

##### isActive?

> `optional` **isActive**: `boolean`

Defined in: [src/repositories/rbac.repository.ts:294](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L294)

##### module?

> `optional` **module**: `string`

Defined in: [src/repositories/rbac.repository.ts:293](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L293)

##### pagination?

> `optional` **pagination**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`pagination`](repositories.base.repository.md#pagination)

***

### RolesQueryOptions

Defined in: [src/repositories/rbac.repository.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L60)

Options for querying roles.

#### Extends

- [`QueryOptions`](repositories.base.repository.md#queryoptions)

#### Properties

##### filters?

> `optional` **filters**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`filters`](repositories.base.repository.md#filters)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`includeInactive`](repositories.base.repository.md#includeinactive)

##### pagination?

> `optional` **pagination**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`pagination`](repositories.base.repository.md#pagination)

##### systemRolesOnly?

> `optional` **systemRolesOnly**: `boolean`

Defined in: [src/repositories/rbac.repository.ts:62](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L62)

Whether to only include system-defined roles

***

### UserRolesQueryOptions

Defined in: [src/repositories/rbac.repository.ts:427](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L427)

Common query options for repository methods.

#### Extends

- [`QueryOptions`](repositories.base.repository.md#queryoptions)

#### Properties

##### activeOnly?

> `optional` **activeOnly**: `boolean`

Defined in: [src/repositories/rbac.repository.ts:428](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L428)

##### filters?

> `optional` **filters**: [`FilterParams`](lib.react-admin.md#filterparams)

Defined in: [src/repositories/base.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L26)

Filter parameters for searching and narrowing results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`filters`](repositories.base.repository.md#filters)

##### includeInactive?

> `optional` **includeInactive**: `boolean`

Defined in: [src/repositories/base.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L28)

Whether to include inactive/deleted records in the results

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`includeInactive`](repositories.base.repository.md#includeinactive)

##### pagination?

> `optional` **pagination**: [`PaginationParams`](lib.react-admin.md#paginationparams)

Defined in: [src/repositories/base.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/base.repository.ts#L24)

Pagination parameters (page and limit)

###### Inherited from

[`QueryOptions`](repositories.base.repository.md#queryoptions).[`pagination`](repositories.base.repository.md#pagination)

## Type Aliases

### DrizzleDB

> **DrizzleDB** = `PostgresJsDatabase`&lt;*typeof* [`db/schema`](db.schema.md)&gt;

Defined in: [src/repositories/rbac.repository.ts:44](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L44)

***

### RoleWithPermissions

> **RoleWithPermissions** = [`Role`](db.schema.rbac.schema.md#role) & `object`

Defined in: [src/repositories/rbac.repository.ts:49](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L49)

Role with permissions relation included

#### Type Declaration

##### rolePermissions

> **rolePermissions**: [`RolePermission`](db.schema.rbac.schema.md#rolepermission) & `object`[]

## Variables

### permissionsRepository

> `const` **permissionsRepository**: [`PermissionsRepository`](#permissionsrepository)

Defined in: [src/repositories/rbac.repository.ts:580](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L580)

***

### rolePermissionsRepository

> `const` **rolePermissionsRepository**: [`RolePermissionsRepository`](#rolepermissionsrepository)

Defined in: [src/repositories/rbac.repository.ts:581](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L581)

***

### rolesRepository

> `const` **rolesRepository**: [`RolesRepository`](#rolesrepository)

Defined in: [src/repositories/rbac.repository.ts:579](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L579)

***

### userRolesRepository

> `const` **userRolesRepository**: [`UserRolesRepository`](#userrolesrepository)

Defined in: [src/repositories/rbac.repository.ts:582](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/rbac.repository.ts#L582)
