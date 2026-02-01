[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: JwtPayload

Defined in: [packages/new-backend/src/services/auth.service.ts:59](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L59)

Structure of the JWT payload.

## Properties

### email

> **email**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:63](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L63)

User's email address

***

### jti

> **jti**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L67)

Unique Token ID (JWT ID)

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [packages/new-backend/src/services/auth.service.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L75)

List of permission codes assigned to the user

***

### role?

> `optional` **role**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L73)

Primary/First role code

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [packages/new-backend/src/services/auth.service.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L71)

List of role codes assigned to the user

***

### stakeholderType?

> `optional` **stakeholderType**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L77)

Calculated stakeholder type (banking, platform, etc.)

***

### sub

> **sub**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:61](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L61)

User ID (Subject)

***

### tenantId?

> `optional` **tenantId**: `string`

Defined in: [packages/new-backend/src/services/auth.service.ts:65](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L65)

Optional tenant ID associated with the user

***

### type

> **type**: `"access"` \| `"refresh"`

Defined in: [packages/new-backend/src/services/auth.service.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/auth.service.ts#L69)

Token type: either 'access' or 'refresh'
