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

> `const` **approvalPolicySchema**: `PgSchema`&lt;`"approval"`&gt;

Defined in: [src/db/schema/rbac.schema.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L20)

***

### coreSchema

> `const` **coreSchema**: `PgSchema`&lt;`"core"`&gt;

Defined in: [src/db/schema/rbac.schema.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L19)

Core schema for RBAC tables

***

### permissionApprovalPolicies

> `const` **permissionApprovalPolicies**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `matrixId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"matrix_id"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `minHierarchyLevel`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` &#124; `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"min_hierarchy_level"`; `notNull`: `false`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `permissionId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"permission_id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `requiredApprovers`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` &#124; `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"required_approvers"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `requiresApproval`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"requires_approval"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `tenantId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"permission_approval_policies"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"permission_approval_policies"`; `schema`: `"approval"`; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:184](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L184)

Permission approval policies table definition.
Links permissions to approval requirements based on role hierarchy levels.

***

### permissionApprovalPoliciesRelations

> `const` **permissionApprovalPoliciesRelations**: `Relations`&lt;`"permission_approval_policies"`, &#123; `permission`: `One`&lt;`"permissions"`, `true`&gt;; `tenant`: `One`&lt;`"tenants"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:260](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L260)

***

### permissions

> `const` **permissions**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `action`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"action"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `category`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"category"`; `notNull`: `false`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `module`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"module"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `resource`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"resource"`; `notNull`: `true`; `tableName`: `"permissions"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"permissions"`; `schema`: `"core"`; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L127)

Permissions table definition.
Defines atomic actions and resources for granular access control.

***

### permissionsRelations

> `const` **permissionsRelations**: `Relations`&lt;`"permissions"`, &#123; `approvalPolicies`: `Many`&lt;`"permission_approval_policies"`&gt;; `rolePermissions`: `Many`&lt;`"role_permissions"`&gt;; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:245](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L245)

***

### rolePermissions

> `const` **rolePermissions**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `grantedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"granted_at"`; `notNull`: `true`; `tableName`: `"role_permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `grantedBy`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"granted_by"`; `notNull`: `false`; `tableName`: `"role_permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `permissionId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"permission_id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `roleId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_id"`; `notNull`: `true`; `tableName`: `"role_permissions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"role_permissions"`; `schema`: `"core"`; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:156](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L156)

Role permissions junction table definition.
Maps roles to permissions, defining what actions a role can perform.

***

### rolePermissionsRelations

> `const` **rolePermissionsRelations**: `Relations`&lt;`"role_permissions"`, &#123; `permission`: `One`&lt;`"permissions"`, `true`&gt;; `role`: `One`&lt;`"roles"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:250](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L250)

***

### roles

> `const` **roles**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `complianceLevel`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"compliance_level"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `createdBy`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_by"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `hierarchyLevel`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` &#124; `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"hierarchy_level"`; `notNull`: `true`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isSystemRole`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_system_role"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `roleCode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_code"`; `notNull`: `true`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `roleName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_name"`; `notNull`: `true`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `tenantId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `updatedBy`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_by"`; `notNull`: `false`; `tableName`: `"roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"roles"`; `schema`: `"core"`; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:30](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L30)

Roles table definition.
Defines available roles within the system, including system and custom roles.

***

### rolesRelations

> `const` **rolesRelations**: `Relations`&lt;`"roles"`, &#123; `rolePermissions`: `Many`&lt;`"role_permissions"`&gt;; `tenant`: `One`&lt;`"tenants"`, `false`&gt;; `userRoles`: `Many`&lt;`"user_roles"`&gt;; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:221](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L221)

***

### userRoles

> `const` **userRoles**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `assignedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"assigned_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `assignedBy`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"assigned_by"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `bankingTypeRestriction`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_type_restriction"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isTemporary`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_temporary"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `roleId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `temporaryReason`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"temporary_reason"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `tenantId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `userId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `validFrom`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"valid_from"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `validUntil`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"valid_until"`; `notNull`: `false`; `tableName`: `"user_roles"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"user_roles"`; `schema`: `"core"`; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L75)

User roles junction table definition.
Maps users to roles, supporting temporary and permanent assignments.

***

### userRolesRelations

> `const` **userRolesRelations**: `Relations`&lt;`"user_roles"`, &#123; `role`: `One`&lt;`"roles"`, `true`&gt;; `tenant`: `One`&lt;`"tenants"`, `true`&gt;; `user`: `One`&lt;`"users"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/rbac.schema.ts:230](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/rbac.schema.ts#L230)
