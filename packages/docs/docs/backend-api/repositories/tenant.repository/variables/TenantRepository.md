[**Backend API Reference v1.0.0**](../../../README.md)

***

# Variable: TenantRepository

> `const` **TenantRepository**: `object`

Defined in: [packages/new-backend/src/repositories/tenant.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/repositories/tenant.repository.ts#L20)

Repository object containing all tenant-related data operations.

## Type Declaration

### countByBankingType()

> **countByBankingType**: () => `Promise`\<`object`[]\>

Group and count tenants by their banking mode (type).

#### Returns

`Promise`\<`object`[]\>

A promise resolving to an array of counts grouped by banking mode

### create()

> **create**: (`data`) => `Promise`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>

Create a new tenant record.

#### Parameters

##### data

The tenant data to insert

###### bankingMode?

`string` \| `null`

###### code

`string`

###### createdAt?

`Date`

###### description?

`string` \| `null`

###### id?

`string`

###### isActive?

`boolean`

###### name

`string`

###### settings?

`unknown`

###### slug?

`string` \| `null`

###### type?

`string` \| `null`

###### updatedAt?

`Date`

#### Returns

`Promise`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>

The newly created Tenant record

### delete()

> **delete**: (`id`) => `Omit`\<`PgUpdateBase`\<`PgTableWithColumns`\<\{ `columns`: \{ `bankingMode`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `20`; \}\>; `code`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `name`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `255`; \}\>; `settings`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `slug`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `100`; \}\>; `type`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"core"`; \}\>, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`\<`"tenants"`, `"not-null"`\>, \[\], `false`, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>

Soft delete a tenant by setting isActive to false.

#### Parameters

##### id

`string`

The ID of the tenant to deactivate

#### Returns

`Omit`\<`PgUpdateBase`\<`PgTableWithColumns`\<\{ `columns`: \{ `bankingMode`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `20`; \}\>; `code`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `name`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `255`; \}\>; `settings`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `slug`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `100`; \}\>; `type`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"core"`; \}\>, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`\<`"tenants"`, `"not-null"`\>, \[\], `false`, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>

The updated Tenant record (implicitly via query update)

### enable()

> **enable**: (`id`) => `Omit`\<`PgUpdateBase`\<`PgTableWithColumns`\<\{ `columns`: \{ `bankingMode`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `20`; \}\>; `code`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `name`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `255`; \}\>; `settings`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `slug`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `100`; \}\>; `type`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"core"`; \}\>, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`\<`"tenants"`, `"not-null"`\>, \[\], `false`, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>

Reactivate a tenant by setting isActive to true.

#### Parameters

##### id

`string`

The ID of the tenant to activate

#### Returns

`Omit`\<`PgUpdateBase`\<`PgTableWithColumns`\<\{ `columns`: \{ `bankingMode`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"banking_mode"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `20`; \}\>; `code`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"code"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `createdAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `description`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"description"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `id`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `isActive`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `name`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"name"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `255`; \}\>; `settings`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgJsonb"`; `data`: `unknown`; `dataType`: `"json"`; `driverParam`: `unknown`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"settings"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; `slug`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"slug"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `100`; \}\>; `type`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"type"`; `notNull`: `false`; `tableName`: `"tenants"`; \}, \{ \}, \{ `length`: `50`; \}\>; `updatedAt`: `PgColumn`\<\{ `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"tenants"`; \}, \{ \}, \{ \}\>; \}; `dialect`: `"pg"`; `name`: `"tenants"`; `schema`: `"core"`; \}\>, `PostgresJsQueryResultHKT`, `undefined`, `undefined`, `Record`\<`"tenants"`, `"not-null"`\>, \[\], `false`, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>, `"where"` \| `"leftJoin"` \| `"rightJoin"` \| `"innerJoin"` \| `"fullJoin"`\>

The updated Tenant record (implicitly via query update)

### findAll()

> **findAll**: (`options?`) => `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Find all tenants matching criteria with search and sorting.

#### Parameters

##### options?

Query options including search, isActive, pagination, and sort

###### isActive?

`boolean`

###### limit?

`number`

###### offset?

`number`

###### order?

`"asc"` \| `"desc"`

###### search?

`string`

###### sort?

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

A paginated result of Tenant records

### findByCode()

> **findByCode**: (`code`) => `PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

Find a tenant by its unique business code.

#### Parameters

##### code

`string`

The short code identifier for the tenant

#### Returns

`PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

A promise that resolves to the Tenant record or undefined

### findById()

> **findById**: (`id`) => `Promise`\<`undefined`\> \| `PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

Find a tenant by its unique record ID.

#### Parameters

##### id

`string`

The tenant UUID or record ID

#### Returns

`Promise`\<`undefined`\> \| `PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

A promise that resolves to the Tenant record or undefined

### findBySlug()

> **findBySlug**: (`slug`) => `PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

Find a tenant by its URL-friendly slug.

#### Parameters

##### slug

`string`

The unique slug used for split authentication

#### Returns

`PgRelationalQuery`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \} \| `undefined`\>

A promise that resolves to the Tenant record or undefined

### getStats()

> **getStats**: () => `Promise`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; \}\>

Aggregate statistics for tenants (total, active, inactive).

#### Returns

`Promise`\<\{ `active`: `number`; `inactive`: `number`; `total`: `number`; \}\>

A promise resolving to an object with statistical counts

### update()

> **update**: (`id`, `data`) => `Promise`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>

Update an existing tenant record.

#### Parameters

##### id

`string`

The tenant ID to update

##### data

`Partial`\<[`NewTenant`](../../../db/schema/core/type-aliases/NewTenant.md)\>

Partial tenant data containing updates

#### Returns

`Promise`\<\{ `bankingMode`: `string` \| `null`; `code`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `isActive`: `boolean`; `name`: `string`; `settings`: `unknown`; `slug`: `string` \| `null`; `type`: `string` \| `null`; `updatedAt`: `Date`; \}\>

The updated Tenant record
