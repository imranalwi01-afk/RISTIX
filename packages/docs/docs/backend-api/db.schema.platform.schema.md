[**Backend API Reference v1.0.0**](index.md)

***

# db/schema/platform.schema

## Type Aliases

### NewPlatformSetting

> **NewPlatformSetting** = *typeof* `platformSettings.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L85)

***

### NewPlatformTenant

> **NewPlatformTenant** = *typeof* `platformTenants.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L60)

***

### NewPlatformUser

> **NewPlatformUser** = *typeof* `platformUsers.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:134](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L134)

***

### PlatformSetting

> **PlatformSetting** = *typeof* `platformSettings.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:84](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L84)

***

### PlatformTenant

> **PlatformTenant** = *typeof* `platformTenants.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L59)

***

### PlatformUser

> **PlatformUser** = *typeof* `platformUsers.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:133](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L133)

## Variables

### platformSchema

> `const` **platformSchema**: `PgSchema`{`<`}`"platform_admin"`{`>`}

Defined in: [src/db/schema/platform.schema.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L23)

Platform schema namespace
Maps to the 'platform_admin' schema in the database (not 'core').

***

### platformSettings

> `const` **platformSettings**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `description`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"settings"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"settings"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `key`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"key"`; `notNull`: `true`; `tableName`: `"settings"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `updatedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"settings"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `value`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"value"`; `notNull`: `true`; `tableName`: `"settings"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"settings"`; `schema`: `"platform_admin"`; {`}`}{`>`}

Defined in: [src/db/schema/platform.schema.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L70)

Platform Settings table definition.
Global Key-Value store for platform-wide configurations (e.g., branding, maintenance mode).

***

### platformTenants

> `const` **platformTenants**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `bankingMode`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `20`; {`}`}{`>`}; `code`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `50`; {`}`}{`>`}; `createdAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `description`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `isActive`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `name`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `settings`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `slug`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `type`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `50`; {`}`}{`>`}; `updatedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; {`}`}{`>`}

Defined in: [src/db/schema/platform.schema.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L33)

Platform Tenants table definition.
Maps tenant registry records in platform_admin.tenants.

***

### platformTenantsRelations

> `const` **platformTenantsRelations**: `Relations`{`<`}`"tenants"`, {`{`} {`}`}{`>`}

Defined in: [src/db/schema/platform.schema.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L55)

***

### platformUsers

> `const` **platformUsers**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `createdAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `email`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"email"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `employeeId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"employee_id"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `50`; {`}`}{`>`}; `failedLoginAttempts`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` {`|`} `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"failed_login_attempts"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `fullName`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"full_name"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `200`; {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `isActive`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `lastLoginAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"last_login_at"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `passwordHash`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"password_hash"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `role`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `tenantId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `tenantName`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_name"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `updatedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `username`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"username"`; `notNull`: `true`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `userRole`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_role"`; `notNull`: `false`; `tableName`: `"users"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"users"`; `schema`: `"platform_admin"`; {`}`}{`>`}

Defined in: [src/db/schema/platform.schema.ts:96](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/platform.schema.ts#L96)

Platform Users table definition.
Stores platform administrators and system operators.
Distinct from tenant users; no tenant_id column required.

## References

### ApprovalAction

Re-exports [ApprovalAction](db.schema.approval.schema.md#approvalaction)

***

### approvalActions

Re-exports [approvalActions](db.schema.approval.schema.md#approvalactions)

***

### approvalActionsRelations

Re-exports [approvalActionsRelations](db.schema.approval.schema.md#approvalactionsrelations)

***

### ApprovalLevel

Re-exports [ApprovalLevel](db.schema.approval.schema.md#approvallevel)

***

### approvalLevels

Re-exports [approvalLevels](db.schema.approval.schema.md#approvallevels)

***

### approvalLevelsRelations

Re-exports [approvalLevelsRelations](db.schema.approval.schema.md#approvallevelsrelations)

***

### approvalMatrices

Re-exports [approvalMatrices](db.schema.approval.schema.md#approvalmatrices)

***

### approvalMatricesRelations

Re-exports [approvalMatricesRelations](db.schema.approval.schema.md#approvalmatricesrelations)

***

### ApprovalMatrix

Re-exports [ApprovalMatrix](db.schema.approval.schema.md#approvalmatrix)

***

### ApprovalRequest

Re-exports [ApprovalRequest](db.schema.approval.schema.md#approvalrequest)

***

### approvalRequests

Re-exports [approvalRequests](db.schema.approval.schema.md#approvalrequests)

***

### approvalRequestsRelations

Re-exports [approvalRequestsRelations](db.schema.approval.schema.md#approvalrequestsrelations)

***

### approvalSchema

Re-exports [approvalSchema](db.schema.approval.schema.md#approvalschema)

***

### AuditLog

Re-exports [AuditLog](db.schema.audit.schema.md#auditlog)

***

### auditLogs

Re-exports [auditLogs](db.schema.audit.schema.md#auditlogs)

***

### auditLogsRelations

Re-exports [auditLogsRelations](db.schema.audit.schema.md#auditlogsrelations)

***

### auditSchema

Re-exports [auditSchema](db.schema.audit.schema.md#auditschema)

***

### authSchema

Re-exports [authSchema](db.schema.auth.schema.md#authschema)

***

### CalculationAuditLog

Re-exports [CalculationAuditLog](db.schema.audit.schema.md#calculationauditlog)

***

### calculationAuditLogs

Re-exports [calculationAuditLogs](db.schema.audit.schema.md#calculationauditlogs)

***

### Consultant

Re-exports [Consultant](db.schema.consultants.schema.md#consultant)

***

### consultants

Re-exports [consultants](db.schema.consultants.schema.md#consultants)

***

### consultantSchema

Re-exports [consultantSchema](db.schema.consultants.schema.md#consultantschema)

***

### coreSchema

Re-exports [coreSchema](db.schema.core.md#coreschema)

***

### DataAccessLog

Re-exports [DataAccessLog](db.schema.audit.schema.md#dataaccesslog)

***

### dataAccessLogs

Re-exports [dataAccessLogs](db.schema.audit.schema.md#dataaccesslogs)

***

### EmailVerificationToken

Re-exports [EmailVerificationToken](db.schema.auth.schema.md#emailverificationtoken)

***

### emailVerificationTokens

Re-exports [emailVerificationTokens](db.schema.auth.schema.md#emailverificationtokens)

***

### emailVerificationTokensRelations

Re-exports [emailVerificationTokensRelations](db.schema.auth.schema.md#emailverificationtokensrelations)

***

### jobDefinitions

Re-exports [jobDefinitions](db.schema.jobs.schema.md#jobdefinitions)

***

### jobExecutions

Re-exports [jobExecutions](db.schema.jobs.schema.md#jobexecutions)

***

### NewApprovalAction

Re-exports [NewApprovalAction](db.schema.approval.schema.md#newapprovalaction)

***

### NewApprovalLevel

Re-exports [NewApprovalLevel](db.schema.approval.schema.md#newapprovallevel)

***

### NewApprovalMatrix

Re-exports [NewApprovalMatrix](db.schema.approval.schema.md#newapprovalmatrix)

***

### NewApprovalRequest

Re-exports [NewApprovalRequest](db.schema.approval.schema.md#newapprovalrequest)

***

### NewAuditLog

Re-exports [NewAuditLog](db.schema.audit.schema.md#newauditlog)

***

### NewCalculationAuditLog

Re-exports [NewCalculationAuditLog](db.schema.audit.schema.md#newcalculationauditlog)

***

### NewConsultant

Re-exports [NewConsultant](db.schema.consultants.schema.md#newconsultant)

***

### NewDataAccessLog

Re-exports [NewDataAccessLog](db.schema.audit.schema.md#newdataaccesslog)

***

### NewEmailVerificationToken

Re-exports [NewEmailVerificationToken](db.schema.auth.schema.md#newemailverificationtoken)

***

### NewNotification

Re-exports [NewNotification](db.schema.approval.schema.md#newnotification)

***

### NewNotificationDelivery

Re-exports [NewNotificationDelivery](db.schema.approval.schema.md#newnotificationdelivery)

***

### NewNotificationPreference

Re-exports [NewNotificationPreference](db.schema.approval.schema.md#newnotificationpreference)

***

### NewPasswordResetToken

Re-exports [NewPasswordResetToken](db.schema.auth.schema.md#newpasswordresettoken)

***

### NewPermission

Re-exports [NewPermission](db.schema.rbac.schema.md#newpermission)

***

### NewPermissionApprovalPolicy

Re-exports [NewPermissionApprovalPolicy](db.schema.rbac.schema.md#newpermissionapprovalpolicy)

***

### NewRole

Re-exports [NewRole](db.schema.rbac.schema.md#newrole)

***

### NewRolePermission

Re-exports [NewRolePermission](db.schema.rbac.schema.md#newrolepermission)

***

### NewSession

Re-exports [NewSession](db.schema.auth.schema.md#newsession)

***

### NewTenant

Re-exports [NewTenant](db.schema.core.md#newtenant)

***

### NewUser

Re-exports [NewUser](db.schema.core.md#newuser)

***

### NewUserActivityLog

Re-exports [NewUserActivityLog](db.schema.audit.schema.md#newuseractivitylog)

***

### NewUserRole

Re-exports [NewUserRole](db.schema.rbac.schema.md#newuserrole)

***

### NewWorkflow

Re-exports [NewWorkflow](db.schema.workflows.schema.md#newworkflow)

***

### NewWorkflowJob

Re-exports [NewWorkflowJob](db.schema.workflows.schema.md#newworkflowjob)

***

### NewWorkflowTransition

Re-exports [NewWorkflowTransition](db.schema.workflows.schema.md#newworkflowtransition)

***

### Notification

Re-exports [Notification](db.schema.approval.schema.md#notification)

***

### notificationDeliveries

Re-exports [notificationDeliveries](db.schema.approval.schema.md#notificationdeliveries)

***

### notificationDeliveriesRelations

Re-exports [notificationDeliveriesRelations](db.schema.approval.schema.md#notificationdeliveriesrelations)

***

### NotificationDelivery

Re-exports [NotificationDelivery](db.schema.approval.schema.md#notificationdelivery)

***

### NotificationPreference

Re-exports [NotificationPreference](db.schema.approval.schema.md#notificationpreference)

***

### notificationPreferences

Re-exports [notificationPreferences](db.schema.approval.schema.md#notificationpreferences)

***

### notificationPreferencesRelations

Re-exports [notificationPreferencesRelations](db.schema.approval.schema.md#notificationpreferencesrelations)

***

### notifications

Re-exports [notifications](db.schema.approval.schema.md#notifications)

***

### notificationsRelations

Re-exports [notificationsRelations](db.schema.approval.schema.md#notificationsrelations)

***

### PasswordResetToken

Re-exports [PasswordResetToken](db.schema.auth.schema.md#passwordresettoken)

***

### passwordResetTokens

Re-exports [passwordResetTokens](db.schema.auth.schema.md#passwordresettokens)

***

### passwordResetTokensRelations

Re-exports [passwordResetTokensRelations](db.schema.auth.schema.md#passwordresettokensrelations)

***

### Permission

Re-exports [Permission](db.schema.rbac.schema.md#permission)

***

### permissionApprovalPolicies

Re-exports [permissionApprovalPolicies](db.schema.rbac.schema.md#permissionapprovalpolicies)

***

### permissionApprovalPoliciesRelations

Re-exports [permissionApprovalPoliciesRelations](db.schema.rbac.schema.md#permissionapprovalpoliciesrelations)

***

### PermissionApprovalPolicy

Re-exports [PermissionApprovalPolicy](db.schema.rbac.schema.md#permissionapprovalpolicy)

***

### permissions

Re-exports [permissions](db.schema.rbac.schema.md#permissions)

***

### permissionsRelations

Re-exports [permissionsRelations](db.schema.rbac.schema.md#permissionsrelations)

***

### Role

Re-exports [Role](db.schema.rbac.schema.md#role)

***

### RolePermission

Re-exports [RolePermission](db.schema.rbac.schema.md#rolepermission)

***

### rolePermissions

Re-exports [rolePermissions](db.schema.rbac.schema.md#rolepermissions)

***

### rolePermissionsRelations

Re-exports [rolePermissionsRelations](db.schema.rbac.schema.md#rolepermissionsrelations)

***

### roles

Re-exports [roles](db.schema.rbac.schema.md#roles)

***

### rolesRelations

Re-exports [rolesRelations](db.schema.rbac.schema.md#rolesrelations)

***

### Session

Re-exports [Session](db.schema.auth.schema.md#session)

***

### sessions

Re-exports [sessions](db.schema.auth.schema.md#sessions)

***

### sessionsRelations

Re-exports [sessionsRelations](db.schema.auth.schema.md#sessionsrelations)

***

### Tenant

Re-exports [Tenant](db.schema.core.md#tenant)

***

### tenants

Re-exports [tenants](db.schema.core.md#tenants)

***

### tenantsRelations

Re-exports [tenantsRelations](db.schema.core.md#tenantsrelations)

***

### User

Re-exports [User](db.schema.core.md#user)

***

### UserActivityLog

Re-exports [UserActivityLog](db.schema.audit.schema.md#useractivitylog)

***

### userActivityLogs

Re-exports [userActivityLogs](db.schema.audit.schema.md#useractivitylogs)

***

### userActivityLogsRelations

Re-exports [userActivityLogsRelations](db.schema.audit.schema.md#useractivitylogsrelations)

***

### UserRole

Re-exports [UserRole](db.schema.rbac.schema.md#userrole)

***

### userRoles

Re-exports [userRoles](db.schema.rbac.schema.md#userroles)

***

### userRolesRelations

Re-exports [userRolesRelations](db.schema.rbac.schema.md#userrolesrelations)

***

### users

Re-exports [users](db.schema.core.md#users)

***

### Workflow

Re-exports [Workflow](db.schema.workflows.schema.md#workflow)

***

### WorkflowJob

Re-exports [WorkflowJob](db.schema.workflows.schema.md#workflowjob)

***

### workflowJobs

Re-exports [workflowJobs](db.schema.workflows.schema.md#workflowjobs)

***

### workflowJobsRelations

Re-exports [workflowJobsRelations](db.schema.workflows.schema.md#workflowjobsrelations)

***

### workflows

Re-exports [workflows](db.schema.workflows.schema.md#workflows)

***

### workflowSchema

Re-exports [workflowSchema](db.schema.workflows.schema.md#workflowschema)

***

### workflowsRelations

Re-exports [workflowsRelations](db.schema.workflows.schema.md#workflowsrelations)

***

### WorkflowTransition

Re-exports [WorkflowTransition](db.schema.workflows.schema.md#workflowtransition)

***

### workflowTransitions

Re-exports [workflowTransitions](db.schema.workflows.schema.md#workflowtransitions)

***

### workflowTransitionsRelations

Re-exports [workflowTransitionsRelations](db.schema.workflows.schema.md#workflowtransitionsrelations)
