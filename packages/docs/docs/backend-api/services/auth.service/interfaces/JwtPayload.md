[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: JwtPayload

Defined in: [src/services/auth.service.ts:67](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L67)

Structure of the JWT payload.

## Properties

### email

> **email**: `string`

Defined in: [src/services/auth.service.ts:71](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L71)

User's email address

***

### jti

> **jti**: `string`

Defined in: [src/services/auth.service.ts:75](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L75)

Unique Token ID (JWT ID)

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [src/services/auth.service.ts:83](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L83)

List of permission codes assigned to the user

***

### role?

> `optional` **role**: `string`

Defined in: [src/services/auth.service.ts:81](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L81)

Primary/First role code

***

### roles?

> `optional` **roles**: `string`[]

Defined in: [src/services/auth.service.ts:79](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L79)

List of role codes assigned to the user

***

### stakeholderType?

> `optional` **stakeholderType**: `string`

Defined in: [src/services/auth.service.ts:85](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L85)

Calculated stakeholder type (banking, platform, etc.)

***

### sub

> **sub**: `string`

Defined in: [src/services/auth.service.ts:69](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L69)

User ID (Subject)

***

### tenantId?

> `optional` **tenantId**: `string`

Defined in: [src/services/auth.service.ts:73](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L73)

Optional tenant ID associated with the user

***

### type

> **type**: `"access"` \| `"refresh"`

Defined in: [src/services/auth.service.ts:77](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/auth.service.ts#L77)

Token type: either 'access' or 'refresh'
