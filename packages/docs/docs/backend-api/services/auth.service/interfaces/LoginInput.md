[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: LoginInput

Defined in: [packages/new-backend/src/services/auth.service.ts:33](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L33)

Input for the login operation.

## Properties

### email

> **email**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:35](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L35)

User's email address

***

### password

> **password**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:37](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L37)

User's plain text password

***

### tenantId?

> `optional` **tenantId**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:39](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L39)

Optional tenant ID or slug for split authentication
