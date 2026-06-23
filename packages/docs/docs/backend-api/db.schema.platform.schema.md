[**Backend API Reference v1.0.0**](index.md)

***

# db/schema/platform.schema

## Type Aliases

### NewPlatformEmailTemplate

> **NewPlatformEmailTemplate** = *typeof* `platformEmailTemplates.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:88](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L88)

***

### NewPlatformSetting

> **NewPlatformSetting** = *typeof* `platformSettings.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:113](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L113)

***

### NewPlatformTenant

> **NewPlatformTenant** = *typeof* `platformTenants.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:60](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L60)

***

### NewPlatformUser

> **NewPlatformUser** = *typeof* `platformUsers.$inferInsert`

Defined in: [src/db/schema/platform.schema.ts:162](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L162)

***

### PlatformEmailTemplate

> **PlatformEmailTemplate** = *typeof* `platformEmailTemplates.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:87](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L87)

***

### PlatformSetting

> **PlatformSetting** = *typeof* `platformSettings.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:112](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L112)

***

### PlatformTenant

> **PlatformTenant** = *typeof* `platformTenants.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L59)

***

### PlatformUser

> **PlatformUser** = *typeof* `platformUsers.$inferSelect`

Defined in: [src/db/schema/platform.schema.ts:161](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L161)

## Variables

### platformEmailTemplates

> `const` **platformEmailTemplates**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `availableVariables`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"available_variables"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `bodyHtml`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"body_html"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `bodyText`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"body_text"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `subject`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"subject"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"email_templates"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"email_templates"`; `schema`: `"platform_admin"`; &#125;&gt;

Defined in: [src/db/schema/platform.schema.ts:70](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L70)

Platform Email Templates table definition.
Stores dynamic email templates (HTML and Text) for various system notifications.

***

### platformSchema

> `const` **platformSchema**: `PgSchema`&lt;`"platform_admin"`&gt;

Defined in: [src/db/schema/platform.schema.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L23)

Platform schema namespace
Maps to the 'platform_admin' schema in the database (not 'core').

***

### platformSettings

> `const` **platformSettings**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"settings"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"settings"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `key`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"key"`; `notNull`: `true`; `tableName`: `"settings"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"settings"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `value`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"value"`; `notNull`: `true`; `tableName`: `"settings"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"settings"`; `schema`: `"platform_admin"`; &#125;&gt;

Defined in: [src/db/schema/platform.schema.ts:98](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L98)

Platform Settings table definition.
Global Key-Value store for platform-wide configurations (e.g., branding, maintenance mode).

***

### platformTenants

> `const` **platformTenants**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `bankingMode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `settings`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `slug`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `type`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; &#125;&gt;

Defined in: [src/db/schema/platform.schema.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L33)

Platform Tenants table definition.
Maps tenant registry records in platform_admin.tenants.

***

### platformTenantsRelations

> `const` **platformTenantsRelations**: `Relations`&lt;`"tenants"`, &#123; &#125;&gt;

Defined in: [src/db/schema/platform.schema.ts:55](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L55)

***

### platformUsers

> `const` **platformUsers**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `email`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"email"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `employeeId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"employee_id"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `failedLoginAttempts`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgInteger"`; `data`: `number`; `dataType`: `"number"`; `driverParam`: `string` &#124; `number`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"failed_login_attempts"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `fullName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"full_name"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `200`; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `lastLoginAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"last_login_at"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `passwordHash`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"password_hash"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `role`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"role"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `tenantId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `tenantName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_name"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `username`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"username"`; `notNull`: `true`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `userRole`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_role"`; `notNull`: `false`; `tableName`: `"users"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"users"`; `schema`: `"platform_admin"`; &#125;&gt;

Defined in: [src/db/schema/platform.schema.ts:124](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/platform.schema.ts#L124)

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

### NewUserTableView

Re-exports [NewUserTableView](db.schema.core.md#newusertableview)

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

### UserTableView

Re-exports [UserTableView](db.schema.core.md#usertableview)

***

### userTableViews

Re-exports [userTableViews](db.schema.core.md#usertableviews)

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
