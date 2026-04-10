[**Backend API Reference v1.0.0**](index.md)

***

# db/schema/rbac.schema

## Type Aliases

### NewPermission

> **NewPermission** = *typeof* `permissions.$inferInsert`

Defined in: [src/db/schema/rbac.schema.ts:286](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L286)

***

### NewPermissionApprovalPolicy

> **NewPermissionApprovalPolicy** = *typeof* `permissionApprovalPolicies.$inferInsert`

Defined in: [src/db/schema/rbac.schema.ts:292](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L292)

***

### NewRole

> **NewRole** = *typeof* `roles.$inferInsert`

Defined in: [src/db/schema/rbac.schema.ts:280](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L280)

***

### NewRolePermission

> **NewRolePermission** = *typeof* `rolePermissions.$inferInsert`

Defined in: [src/db/schema/rbac.schema.ts:289](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L289)

***

### NewUserRole

> **NewUserRole** = *typeof* `userRoles.$inferInsert`

Defined in: [src/db/schema/rbac.schema.ts:283](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L283)

***

### Permission

> **Permission** = *typeof* `permissions.$inferSelect`

Defined in: [src/db/schema/rbac.schema.ts:285](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L285)

***

### PermissionApprovalPolicy

> **PermissionApprovalPolicy** = *typeof* `permissionApprovalPolicies.$inferSelect`

Defined in: [src/db/schema/rbac.schema.ts:291](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L291)

***

### Role

> **Role** = *typeof* `roles.$inferSelect`

Defined in: [src/db/schema/rbac.schema.ts:279](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L279)

***

### RolePermission

> **RolePermission** = *typeof* `rolePermissions.$inferSelect`

Defined in: [src/db/schema/rbac.schema.ts:288](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L288)

***

### UserRole

> **UserRole** = *typeof* `userRoles.$inferSelect`

Defined in: [src/db/schema/rbac.schema.ts:282](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L282)

## Variables

### approvalPolicySchema

> `const` **approvalPolicySchema**: `PgSchema`\<`"approval"`\>

Defined in: [src/db/schema/rbac.schema.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L20)

***

### coreSchema

> `const` **coreSchema**: `PgSchema`\<`"core"`\>

Defined in: [src/db/schema/rbac.schema.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L19)

Core schema for RBAC tables

***

### permissionApprovalPolicies

> `const` **permissionApprovalPolicies**: `PgTableWithColumns`\<\{ `columns`: \{ `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `matrixId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"matrix_id"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `minHierarchyLevel`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` \| `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"min_hierarchy_level"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `permissionId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"permission_id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `requiredApprovers`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` \| `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"required_approvers"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `requiresApproval`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"requires_approval"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `tenantId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"permission_approval_policies"`; `schema`: `"approval"`; \}\>

Defined in: [src/db/schema/rbac.schema.ts:184](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L184)

Permission approval policies table definition.
Links permissions to approval requirements based on role hierarchy levels.

***

### permissionApprovalPoliciesRelations

> `const` **permissionApprovalPoliciesRelations**: `Relations`\<`"permission_approval_policies"`, \{ `permission`: `One`\<`"permissions"`, `true`\>; `tenant`: `One`\<`"tenants"`, `true`\>; \}\>

Defined in: [src/db/schema/rbac.schema.ts:260](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L260)

***

### permissions

> `const` **permissions**: `PgTableWithColumns`\<\{ `columns`: \{ `action`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"action"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `50`; \}\>; `category`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"category"`; `notNull`: `false`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `100`; \}\>; `code`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `100`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"permissions"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ \}\>; `module`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"module"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `50`; \}\>; `name`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `255`; \}\>; `resource`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"resource"`; `notNull`: `true`; `tableName`: `"permissions"`; \}, \{ \}, \{ `length`: `100`; \}\>; \}; `dialect`: `"pg"`; `name`: `"permissions"`; `schema`: `"core"`; \}\>

Defined in: [src/db/schema/rbac.schema.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L127)

Permissions table definition.
Defines atomic actions and resources for granular access control.

***

### permissionsRelations

> `const` **permissionsRelations**: `Relations`\<`"permissions"`, \{ `approvalPolicies`: `Many`\<`"permission_approval_policies"`\>; `rolePermissions`: `Many`\<`"role_permissions"`\>; \}\>

Defined in: [src/db/schema/rbac.schema.ts:245](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L245)

***

### rolePermissions

> `const` **rolePermissions**: `PgTableWithColumns`\<\{ `columns`: \{ `grantedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"granted_at"`; `notNull`: `true`; `tableName`: `"role_permissions"`; \}, \{ \}, \{ \}\>; `grantedBy`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"granted_by"`; `notNull`: `false`; `tableName`: `"role_permissions"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; \}, \{ \}, \{ \}\>; `permissionId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"permission_id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; \}, \{ \}, \{ \}\>; `roleId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"role_permissions"`; `schema`: `"core"`; \}\>

Defined in: [src/db/schema/rbac.schema.ts:156](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L156)

Role permissions junction table definition.
Maps roles to permissions, defining what actions a role can perform.

***

### rolePermissionsRelations

> `const` **rolePermissionsRelations**: `Relations`\<`"role_permissions"`, \{ `permission`: `One`\<`"permissions"`, `true`\>; `role`: `One`\<`"roles"`, `true`\>; \}\>

Defined in: [src/db/schema/rbac.schema.ts:250](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L250)

***

### roles

> `const` **roles**: `PgTableWithColumns`\<\{ `columns`: \{ `complianceLevel`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"compliance_level"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ `length`: `50`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `createdBy`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_by"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `hierarchyLevel`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` \| `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"hierarchy_level"`; `notNull`: `true`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `isSystemRole`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_system_role"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `roleCode`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_code"`; `notNull`: `true`; `tableName`: `"roles"`; \}, \{ \}, \{ `length`: `50`; \}\>; `roleName`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_name"`; `notNull`: `true`; `tableName`: `"roles"`; \}, \{ \}, \{ `length`: `100`; \}\>; `tenantId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; `updatedBy`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_by"`; `notNull`: `false`; `tableName`: `"roles"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"roles"`; `schema`: `"core"`; \}\>

Defined in: [src/db/schema/rbac.schema.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L30)

Roles table definition.
Defines available roles within the system, including system and custom roles.

***

### rolesRelations

> `const` **rolesRelations**: `Relations`\<`"roles"`, \{ `rolePermissions`: `Many`\<`"role_permissions"`\>; `tenant`: `One`\<`"tenants"`, `false`\>; `userRoles`: `Many`\<`"user_roles"`\>; \}\>

Defined in: [src/db/schema/rbac.schema.ts:221](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L221)

***

### userRoles

> `const` **userRoles**: `PgTableWithColumns`\<\{ `columns`: \{ `assignedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"assigned_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `assignedBy`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"assigned_by"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `bankingTypeRestriction`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_type_restriction"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ `length`: `20`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `isTemporary`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_temporary"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `roleId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `temporaryReason`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"temporary_reason"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `tenantId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `userId`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `validFrom`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"valid_from"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; `validUntil`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"valid_until"`; `notNull`: `false`; `tableName`: `"user_roles"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"user_roles"`; `schema`: `"core"`; \}\>

Defined in: [src/db/schema/rbac.schema.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L75)

User roles junction table definition.
Maps users to roles, supporting temporary and permanent assignments.

***

### userRolesRelations

> `const` **userRolesRelations**: `Relations`\<`"user_roles"`, \{ `role`: `One`\<`"roles"`, `true`\>; `tenant`: `One`\<`"tenants"`, `true`\>; `user`: `One`\<`"users"`, `true`\>; \}\>

Defined in: [src/db/schema/rbac.schema.ts:230](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L230)
