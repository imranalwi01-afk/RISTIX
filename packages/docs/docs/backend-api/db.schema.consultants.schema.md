[**Backend API Reference v1.0.0**](index.md)

***

# db/schema/consultants.schema

## Type Aliases

### Consultant

> **Consultant** = *typeof* `consultants.$inferSelect`

Defined in: [src/db/schema/consultants.schema.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/consultants.schema.ts#L20)

***

### NewConsultant

> **NewConsultant** = *typeof* `consultants.$inferInsert`

Defined in: [src/db/schema/consultants.schema.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/consultants.schema.ts#L21)

## Variables

### consultants

> `const` **consultants**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `email`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"email"`; `notNull`: `true`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `endDate`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgDateString"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"end_date"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `firmName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"firm_name"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `fullName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"full_name"`; `notNull`: `true`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `notes`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"notes"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `specialization`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"specialization"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `startDate`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgDateString"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"start_date"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `status`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"status"`; `notNull`: `false`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `updatedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"updated_at"`; `notNull`: `true`; `tableName`: `"consultants"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"consultants"`; `schema`: `"consultant"`; &#125;&gt;

Defined in: [src/db/schema/consultants.schema.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/consultants.schema.ts#L5)

***

### consultantSchema

> `const` **consultantSchema**: `PgSchema`&lt;`"consultant"`&gt;

Defined in: [src/db/schema/consultants.schema.ts:3](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/db/schema/consultants.schema.ts#L3)
