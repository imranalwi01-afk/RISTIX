[**Backend API Reference v1.0.0**](index.md)

***

# services/rbac.service

## Functions

### assignRole()

> **assignRole**(`input`): `Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:356](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L356)

Assign a role to a user with optional temporal constraints.

#### Parameters

##### input

Assignment details including userId, roleId, and tenure info

###### assignedBy?

`string`

###### isTemporary?

`boolean`

###### roleId

`string`

###### temporaryReason?

`string`

###### tenantId

`string`

###### userId

`string`

###### validFrom?

`Date`

###### validUntil?

`Date`

#### Returns

`Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror), `never`&gt;

An Effect that succeeds with the newly created assignment

#### Throws

If the role is already assigned to the user

***

### createRole()

> **createRole**(`input`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L98)

Create a new role for a tenant.

#### Parameters

##### input

`object` & `object`

The role definition as NewRole object

#### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`ValidationError`](lib.errors.md#validationerror), `never`&gt;

An Effect that succeeds with the created Role

#### Throws

If a role with the same name already exists

***

### deleteRole()

> **deleteRole**(`roleId`, `tenantId?`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror), `never`&gt;

Defined in: [src/services/rbac.service.ts:185](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L185)

Deactivates a role (Soft delete).

#### Parameters

##### roleId

`string`

The unique identifier of the role to delete

##### tenantId?

`string`

Optional tenant ID to resolve the database

#### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror), `never`&gt;

An Effect that succeeds with the deleted/deactivated Role

#### Throws

If attempting to delete a protected system role

***

### getAvailablePermissions()

> **getAvailablePermissions**(`tenantId`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:588](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L588)

Get all available permissions with approval metadata

#### Parameters

##### tenantId

`string`

The unique identifier of the tenant

#### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect that succeeds with an array of Permissions with approval info

***

### getRoleById()

> **getRoleById**(`roleId`, `tenantId?`): `Effect`&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/rbac.service.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L69)

Retrieve a single role by its unique ID.

#### Parameters

##### roleId

`string`

The unique identifier of the role

##### tenantId?

`string`

Optional tenant ID to resolve the database

#### Returns

`Effect`&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect that succeeds with the Role if found

***

### getRoles()

> **getRoles**(`tenantId`, `options?`): `Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions)&gt;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:40](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L40)

Retrieve all roles for a given tenant.

#### Parameters

##### tenantId

`string`

The unique identifier of the tenant

##### options?

Optional filters (includeInactive, search, type, level)

###### includeInactive?

`boolean`

###### level?

`string`

###### search?

`string`

###### type?

`string`

#### Returns

`Effect`&lt;[`PaginatedResult`](repositories.base.repository.md#paginatedresult)&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions)&gt;, [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect that succeeds with an array of Roles

***

### getRoleUsers()

> **getRoleUsers**(`roleId`, `tenantId`): `Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:341](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L341)

Retrieve active user assignments for a role.

#### Parameters

##### roleId

`string`

The unique identifier of the role

##### tenantId

`string`

The unique identifier of the tenant

#### Returns

`Effect`&lt;`object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect that succeeds with an array of active user-role assignments

***

### getUserPermissionCodes()

> **getUserPermissionCodes**(`userId`, `tenantId`): `Effect`&lt;`string`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/rbac.service.ts:528](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L528)

Returns canonical permission codes (e.g. banking.setup.business.view) for the user.
This is used by frontend auth snapshot refresh to avoid lossy resource/action mapping.

#### Parameters

##### userId

`string`

##### tenantId

`string`

#### Returns

`Effect`&lt;`string`[], [`DatabaseError`](lib.errors.md#databaseerror)&gt;

***

### getUserPermissions()

> **getUserPermissions**(`userId`, `tenantId`): `Effect`&lt;`Record`&lt;`string`, `string`[]&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/rbac.service.ts:488](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L488)

Aggregates and groups all permissions granted to a user across all their roles.

#### Parameters

##### userId

`string`

The unique identifier of the user

##### tenantId

`string`

The unique identifier of the tenant

#### Returns

`Effect`&lt;`Record`&lt;`string`, `string`[]&gt;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with a Record of resource-to-actions mappings

***

### getUserRoles()

> **getUserRoles**(`userId`, `tenantId`): `Effect`&lt;`object` & `object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

Defined in: [src/services/rbac.service.ts:316](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L316)

Retrieve all active roles currently assigned to a user.

#### Parameters

##### userId

`string`

The unique identifier of the user

##### tenantId

`string`

The unique identifier of the tenant

#### Returns

`Effect`&lt;`object` & `object`[], [`DatabaseError`](lib.errors.md#databaseerror), `never`&gt;

An Effect that succeeds with an array of active UserRole assignments

***

### hasPermission()

> **hasPermission**(`userId`, `tenantId`, `resource`, `action`): `Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/rbac.service.ts:466](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L466)

Check if a user possesses a specific permission for a resource and action.

#### Parameters

##### userId

`string`

The unique identifier of the user

##### tenantId

`string`

The unique identifier of the tenant

##### resource

`string`

The resource identifier (e.g., 'users', 'roles')

##### action

`string`

The action identifier (e.g., 'read', 'write', '*')

#### Returns

`Effect`&lt;`boolean`, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with a boolean flag

***

### importRoleMatrix()

> **importRoleMatrix**(`tenantId`, `matrixData`): `Effect`&lt;&#123; `mappingsUpdated`: `number`; `permissionsAdded`: `number`; `rolesAdded`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

Defined in: [src/services/rbac.service.ts:628](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L628)

Import Role Matrix from JSON Data

#### Parameters

##### tenantId

`string`

The unique identifier of the tenant

##### matrixData

`any`[]

Array of objects containing matrix configuration

#### Returns

`Effect`&lt;&#123; `mappingsUpdated`: `number`; `permissionsAdded`: `number`; `rolesAdded`: `number`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror)&gt;

An Effect that succeeds with import statistics

***

### removeRole()

> **removeRole**(`userId`, `roleId`, `tenantId`): `Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/rbac.service.ts:433](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L433)

Remove a role assignment from a user.

#### Parameters

##### userId

`string`

The unique identifier of the user

##### roleId

`string`

The unique identifier of the role to remove

##### tenantId

`string`

The unique identifier of the tenant

#### Returns

`Effect`&lt;&#123; `assignedAt`: `Date` &#124; `null`; `assignedBy`: `string` &#124; `null`; `bankingTypeRestriction`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isTemporary`: `boolean` &#124; `null`; `roleId`: `string`; `temporaryReason`: `string` &#124; `null`; `tenantId`: `string`; `updatedAt`: `Date` &#124; `null`; `userId`: `string`; `validFrom`: `Date` &#124; `null`; `validUntil`: `Date` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect that succeeds when the assignment is removed

***

### updateRole()

> **updateRole**(`roleId`, `input`): `Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror), `never`&gt;

Defined in: [src/services/rbac.service.ts:142](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L142)

Update an existing role's properties.

#### Parameters

##### roleId

`string`

The unique identifier of the role to update

##### input

`Partial`&lt;&#123; `complianceLevel?`: `string` &#124; `null`; `createdAt?`: `Date` &#124; `null`; `createdBy?`: `string` &#124; `null`; `description?`: `string` &#124; `null`; `hierarchyLevel?`: `number`; `id?`: `string`; `isActive?`: `boolean` &#124; `null`; `isSystemRole?`: `boolean` &#124; `null`; `maxImpactLevel?`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId?`: `string` &#124; `null`; `updatedAt?`: `Date` &#124; `null`; `updatedBy?`: `string` &#124; `null`; &#125;&gt; & `object`

Partial role object containing updates and optional tenantId

#### Returns

`Effect`&lt;&#123; `complianceLevel`: `string` &#124; `null`; `createdAt`: `Date` &#124; `null`; `createdBy`: `string` &#124; `null`; `description`: `string` &#124; `null`; `hierarchyLevel`: `number`; `id`: `string`; `isActive`: `boolean` &#124; `null`; `isSystemRole`: `boolean` &#124; `null`; `maxImpactLevel`: `string` &#124; `null`; `roleCode`: `string`; `roleName`: `string`; `tenantId`: `string` &#124; `null`; `updatedAt`: `Date` &#124; `null`; `updatedBy`: `string` &#124; `null`; &#125;, [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror) &#124; [`BusinessError`](lib.errors.md#businesserror), `never`&gt;

An Effect that succeeds with the updated Role

#### Throws

If attempting to rename a protected system role

***

### updateRolePermissions()

> **updateRolePermissions**(`roleId`, `permissionIds`, `tenantId?`): `Effect`&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

Defined in: [src/services/rbac.service.ts:568](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/rbac.service.ts#L568)

Update permissions for a specific role by replacing all existing role-permission associations.

#### Parameters

##### roleId

`string`

The unique identifier of the role

##### permissionIds

`string`[]

Array of permission IDs to assign to the role

##### tenantId?

`string`

Optional tenant ID for database resolution

#### Returns

`Effect`&lt;[`RoleWithPermissions`](repositories.rbac.repository.md#rolewithpermissions), [`DatabaseError`](lib.errors.md#databaseerror) &#124; [`NotFoundError`](lib.errors.md#notfounderror), `never`&gt;

An Effect that succeeds with the updated Role
