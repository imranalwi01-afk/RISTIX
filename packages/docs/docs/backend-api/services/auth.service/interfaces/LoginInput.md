[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: LoginInput

Defined in: [src/services/auth.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L41)

Input for the login operation.

## Properties

### email

> **email**: `string`

Defined in: [src/services/auth.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L43)

User's email address

***

### password

> **password**: `string`

Defined in: [src/services/auth.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L45)

User's plain text password

***

### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/auth.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/auth.service.ts#L47)

Optional tenant ID or slug for split authentication
