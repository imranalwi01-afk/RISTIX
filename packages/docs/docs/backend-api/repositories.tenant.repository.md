[**Backend API Reference v1.0.0**](index.md)

***

# repositories/tenant.repository

## Type Aliases

### TenantRepositoryType

> **TenantRepositoryType** = *typeof* [`TenantRepository`](#tenantrepository)

Defined in: [src/repositories/tenant.repository.ts:231](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/tenant.repository.ts#L231)

## Variables

### TenantRepository

> `const` **TenantRepository**: `object`

Defined in: [src/repositories/tenant.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/repositories/tenant.repository.ts#L24)

Repository object containing all tenant-related data operations.

#### Type Declaration

##### countByBankingType()

> **countByBankingType**: () => `Promise`&lt;`object`[]&gt;

Group and count tenants by their banking mode (type).

###### Returns

`Promise`&lt;`object`[]&gt;

A promise resolving to an array of counts grouped by banking mode

##### create()

> **create**: (`data`) => `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Create a new tenant record.

###### Parameters

###### data

The tenant data to insert

###### bankingMode?

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

###### name

`string`

###### settings?

`string` &#124; `null`

###### slug?

`string` &#124; `null`

###### type?

`string` &#124; `null`

###### updatedAt?

`Date`

###### Returns

`Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

The newly created Tenant record

##### delete()

> **delete**: (`id`) => `Omit`&lt;`PgUpdateBase`&lt;`PgTableWithColumns`&lt;&#123; `columns`: &#123; `bankingMode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `settings`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `slug`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `type`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; &#125;&gt;, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`&lt;`"tenants"`, `"not-null"`&gt;, \[\], `false`, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;

Soft delete a tenant by setting isActive to false.

###### Parameters

###### id

`string`

The ID of the tenant to deactivate

###### Returns

`Omit`&lt;`PgUpdateBase`&lt;`PgTableWithColumns`&lt;&#123; `columns`: &#123; `bankingMode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `settings`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `slug`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `type`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; &#125;&gt;, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`&lt;`"tenants"`, `"not-null"`&gt;, \[\], `false`, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;

The updated Tenant record (implicitly via query update)

##### enable()

> **enable**: (`id`) => `Omit`&lt;`PgUpdateBase`&lt;`PgTableWithColumns`&lt;&#123; `columns`: &#123; `bankingMode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `settings`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `slug`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `type`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; &#125;&gt;, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`&lt;`"tenants"`, `"not-null"`&gt;, \[\], `false`, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;

Reactivate a tenant by setting isActive to true.

###### Parameters

###### id

`string`

The ID of the tenant to activate

###### Returns

`Omit`&lt;`PgUpdateBase`&lt;`PgTableWithColumns`&lt;&#123; `columns`: &#123; `bankingMode`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `20`; &#125;&gt;; `code`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `description`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `name`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `settings`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `slug`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `type`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"platform_admin"`; &#125;&gt;, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`&lt;`"tenants"`, `"not-null"`&gt;, \[\], `false`, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;, `"where"` &#124; `"leftJoin"` &#124; `"rightJoin"` &#124; `"innerJoin"` &#124; `"fullJoin"`&gt;

The updated Tenant record (implicitly via query update)

##### findAll()

> **findAll**: (`options?`) => `Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

Find all tenants matching criteria with search and sorting.

###### Parameters

###### options?

Query options including search, isActive, pagination, and sort

###### isActive?

`boolean`

###### limit?

`number`

###### offset?

`number`

###### order?

`"asc"` &#124; `"desc"`

###### search?

`string`

###### sort?

`string`

###### Returns

`Promise`&lt;&#123; `data`: `object`[]; `total`: `number`; &#125;&gt;

A paginated result of Tenant records

##### findByCode()

> **findByCode**: (`code`) => `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Find a tenant by its unique business code.

###### Parameters

###### code

`string`

The short code identifier for the tenant

###### Returns

`Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

A promise that resolves to the Tenant record or undefined

##### findById()

> **findById**: (`id`) => `Promise`&lt;`undefined`&gt; &#124; `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Find a tenant by its unique record ID.

###### Parameters

###### id

`string`

The tenant UUID or record ID

###### Returns

`Promise`&lt;`undefined`&gt; &#124; `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

A promise that resolves to the Tenant record or undefined

##### findBySlug()

> **findBySlug**: (`slug`) => `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Find a tenant by its URL-friendly slug.

###### Parameters

###### slug

`string`

The unique slug used for split authentication

###### Returns

`Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

A promise that resolves to the Tenant record or undefined

##### getStats()

> **getStats**: () => `Promise`&lt;&#123; `active`: `number`; `inactive`: `number`; `total`: `number`; &#125;&gt;

Aggregate statistics for tenants (total, active, inactive).

###### Returns

`Promise`&lt;&#123; `active`: `number`; `inactive`: `number`; `total`: `number`; &#125;&gt;

A promise resolving to an object with statistical counts

##### update()

> **update**: (`id`, `data`) => `Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

Update an existing tenant record.

###### Parameters

###### id

`string`

The tenant ID to update

###### data

`Partial`&lt;[`NewPlatformTenant`](db.schema.platform.schema.md#newplatformtenant)&gt;

Partial tenant data containing updates

###### Returns

`Promise`&lt;&#123; `bankingMode`: `string` &#124; `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` &#124; `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `string` &#124; `null`; `slug`: `string` &#124; `null`; `type`: `string` &#124; `null`; `updatedAt`: `Date`; &#125;&gt;

The updated Tenant record
