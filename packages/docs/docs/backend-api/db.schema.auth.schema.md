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

> `const` **authSchema**: `PgSchema`{`<`}`"auth"`{`>`}

Defined in: [src/db/schema/auth.schema.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L18)

Auth schema for authentication-related tables

***

### emailVerificationTokens

> `const` **emailVerificationTokens**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `createdAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `expiresAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `token`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"token"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `userId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `verifiedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"verified_at"`; `notNull`: `false`; `tableName`: `"email_verification_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"email_verification_tokens"`; `schema`: `"auth"`; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:105](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L105)

Email verification tokens table definition.
Stores tokens for verifying new user email addresses.

***

### emailVerificationTokensRelations

> `const` **emailVerificationTokensRelations**: `Relations`{`<`}`"email_verification_tokens"`, {`{`} `user`: `One`{`<`}`"users"`, `true`{`>`}; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:145](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L145)

***

### passwordResetTokens

> `const` **passwordResetTokens**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `createdAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `expiresAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `token`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"token"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `255`; {`}`}{`>`}; `usedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"used_at"`; `notNull`: `false`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `userId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"password_reset_tokens"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"password_reset_tokens"`; `schema`: `"auth"`; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L78)

Password reset tokens table definition.
Stores temporary tokens for identifying password reset requests.

***

### passwordResetTokensRelations

> `const` **passwordResetTokensRelations**: `Relations`{`<`}`"password_reset_tokens"`, {`{`} `user`: `One`{`<`}`"users"`, `true`{`>`}; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:138](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L138)

***

### sessions

> `const` **sessions**: `PgTableWithColumns`{`<`}{`{`} `columns`: {`{`} `accessTokenId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"access_token_id"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `createdAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"created_at"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `deviceName`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"device_name"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `deviceType`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"device_type"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `50`; {`}`}{`>`}; `expiresAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"expires_at"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `id`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `true`; `name`: `"id"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `ipAddress`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"ip_address"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `45`; {`}`}{`>`}; `isActive`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgBoolean"`; `data`: `boolean`; `dataType`: `"boolean"`; `driverParam`: `boolean`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"is_active"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `lastActivityAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `true`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"last_activity_at"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `refreshExpiresAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"refresh_expires_at"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `refreshTokenId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"refresh_token_id"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `revokedAt`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgTimestamp"`; `data`: `Date`; `dataType`: `"date"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"revoked_at"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `revokeReason`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgVarchar"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"revoke_reason"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} `length`: `100`; {`}`}{`>`}; `tenantId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"tenant_id"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `userAgent`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgText"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: \[`string`, `...string[]`\]; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_agent"`; `notNull`: `false`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; `userId`: `PgColumn`{`<`}{`{`} `baseColumn`: `never`; `columnType`: `"PgUUID"`; `data`: `string`; `dataType`: `"string"`; `driverParam`: `string`; `enumValues`: `undefined`; `generated`: `undefined`; `hasDefault`: `false`; `hasRuntimeDefault`: `false`; `identity`: `undefined`; `isAutoincrement`: `false`; `isPrimaryKey`: `false`; `name`: `"user_id"`; `notNull`: `true`; `tableName`: `"sessions"`; {`}`}, {`{`} {`}`}, {`{`} {`}`}{`>`}; {`}`}; `dialect`: `"pg"`; `name`: `"sessions"`; `schema`: `"auth"`; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L28)

Sessions table definition.
Stores active user sessions, including device info and expiration.

***

### sessionsRelations

> `const` **sessionsRelations**: `Relations`{`<`}`"sessions"`, {`{`} `tenant`: `One`{`<`}`"tenants"`, `false`{`>`}; `user`: `One`{`<`}`"users"`, `true`{`>`}; {`}`}{`>`}

Defined in: [src/db/schema/auth.schema.ts:127](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/db/schema/auth.schema.ts#L127)
