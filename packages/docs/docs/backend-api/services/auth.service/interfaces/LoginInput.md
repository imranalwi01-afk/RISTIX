[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: LoginInput

Defined in: [src/services/auth.service.ts:41](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L41)

Input for the login operation.

## Properties

### email

> **email**: `string`

Defined in: [src/services/auth.service.ts:43](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L43)

User's email address

***

### password

> **password**: `string`

Defined in: [src/services/auth.service.ts:45](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L45)

User's plain text password

***

### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/auth.service.ts:47](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L47)

Optional tenant ID or slug for split authentication
