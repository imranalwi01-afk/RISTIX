[**Backend API Reference v1.0.0**](index.md)

***

# db/schema/auth.schema

## Type Aliases

### EmailVerificationToken

> **EmailVerificationToken** = *typeof* `emailVerificationTokens.$inferSelect`

Defined in: [src/db/schema/auth.schema.ts:162](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L162)

***

### NewEmailVerificationToken

> **NewEmailVerificationToken** = *typeof* `emailVerificationTokens.$inferInsert`

Defined in: [src/db/schema/auth.schema.ts:163](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L163)

***

### NewPasswordResetToken

> **NewPasswordResetToken** = *typeof* `passwordResetTokens.$inferInsert`

Defined in: [src/db/schema/auth.schema.ts:160](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L160)

***

### NewSession

> **NewSession** = *typeof* `sessions.$inferInsert`

Defined in: [src/db/schema/auth.schema.ts:157](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L157)

***

### PasswordResetToken

> **PasswordResetToken** = *typeof* `passwordResetTokens.$inferSelect`

Defined in: [src/db/schema/auth.schema.ts:159](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L159)

***

### Session

> **Session** = *typeof* `sessions.$inferSelect`

Defined in: [src/db/schema/auth.schema.ts:156](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L156)

## Variables

### authSchema

> `const` **authSchema**: `PgSchema`&lt;`"auth"`&gt;

Defined in: [src/db/schema/auth.schema.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L18)

Auth schema for authentication-related tables

***

### emailVerificationTokens

> `const` **emailVerificationTokens**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `expiresAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `token`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"token"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `userId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `verifiedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"verified_at"`; `notNull`: `false`; `tableName`: `"email_verification_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"email_verification_tokens"`; `schema`: `"auth"`; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L105)

Email verification tokens table definition.
Stores tokens for verifying new user email addresses.

***

### emailVerificationTokensRelations

> `const` **emailVerificationTokensRelations**: `Relations`&lt;`"email_verification_tokens"`, &#123; `user`: `One`&lt;`"users"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L145)

***

### passwordResetTokens

> `const` **passwordResetTokens**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `expiresAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `token`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"token"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; `length`: `255`; &#125;&gt;; `usedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"used_at"`; `notNull`: `false`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `userId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"password_reset_tokens"`; `schema`: `"auth"`; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L78)

Password reset tokens table definition.
Stores temporary tokens for identifying password reset requests.

***

### passwordResetTokensRelations

> `const` **passwordResetTokensRelations**: `Relations`&lt;`"password_reset_tokens"`, &#123; `user`: `One`&lt;`"users"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L138)

***

### sessions

> `const` **sessions**: `PgTableWithColumns`&lt;&#123; `columns`: &#123; `accessTokenId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"access_token_id"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `createdAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `deviceName`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"device_name"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `deviceType`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"device_type"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; `length`: `50`; &#125;&gt;; `expiresAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `id`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `ipAddress`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"ip_address"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; `length`: `45`; &#125;&gt;; `isActive`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `lastActivityAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"last_activity_at"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `refreshExpiresAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"refresh_expires_at"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `refreshTokenId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"refresh_token_id"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `revokedAt`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"revoked_at"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `revokeReason`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"revoke_reason"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; `length`: `100`; &#125;&gt;; `tenantId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `userAgent`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_agent"`; `notNull`: `false`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; `userId`: `PgColumn`&lt;&#123; `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"sessions"`; &#125;, &#123; &#125;, &#123; &#125;&gt;; &#125;; `dialect`: `"pg"`; `name`: `"sessions"`; `schema`: `"auth"`; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L28)

Sessions table definition.
Stores active user sessions, including device info and expiration.

***

### sessionsRelations

> `const` **sessionsRelations**: `Relations`&lt;`"sessions"`, &#123; `tenant`: `One`&lt;`"tenants"`, `false`&gt;; `user`: `One`&lt;`"users"`, `true`&gt;; &#125;&gt;

Defined in: [src/db/schema/auth.schema.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L127)
