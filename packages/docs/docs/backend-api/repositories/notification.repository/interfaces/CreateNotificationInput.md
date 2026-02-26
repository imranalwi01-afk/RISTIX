[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: CreateNotificationInput

Defined in: [src/repositories/notification.repository.ts:10](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L10)

## Properties

### actionUrl?

> `optional` **actionUrl**: `string`

Defined in: [src/repositories/notification.repository.ts:18](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L18)

***

### approvalRequestId?

> `optional` **approvalRequestId**: `string`

Defined in: [src/repositories/notification.repository.ts:12](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L12)

***

### channel?

> `optional` **channel**: `"email"` \| `"in_app"` \| `"socket"` \| `"webhook"`

Defined in: [src/repositories/notification.repository.ts:26](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L26)

***

### deliveredAt?

> `optional` **deliveredAt**: `Date`

Defined in: [src/repositories/notification.repository.ts:28](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L28)

***

### deliveryStatus?

> `optional` **deliveryStatus**: `"pending"` \| `"sent"` \| `"read"` \| `"failed"`

Defined in: [src/repositories/notification.repository.ts:27](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L27)

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [src/repositories/notification.repository.ts:20](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L20)

***

### entityType?

> `optional` **entityType**: `string`

Defined in: [src/repositories/notification.repository.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L19)

***

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [src/repositories/notification.repository.ts:29](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L29)

***

### message

> **message**: `string`

Defined in: [src/repositories/notification.repository.ts:17](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L17)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [src/repositories/notification.repository.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L23)

***

### roleTargets?

> `optional` **roleTargets**: `string`[]

Defined in: [src/repositories/notification.repository.ts:25](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L25)

***

### severity

> **severity**: `"info"` \| `"error"` \| `"warning"` \| `"success"`

Defined in: [src/repositories/notification.repository.ts:15](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L15)

***

### source?

> `optional` **source**: `string`

Defined in: [src/repositories/notification.repository.ts:21](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L21)

***

### tenantId

> **tenantId**: `string`

Defined in: [src/repositories/notification.repository.ts:11](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L11)

***

### title

> **title**: `string`

Defined in: [src/repositories/notification.repository.ts:16](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L16)

***

### triggeredBy?

> `optional` **triggeredBy**: `string`

Defined in: [src/repositories/notification.repository.ts:22](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L22)

***

### type

> **type**: `string`

Defined in: [src/repositories/notification.repository.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L14)

***

### userTargets?

> `optional` **userTargets**: `string`[]

Defined in: [src/repositories/notification.repository.ts:24](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L24)

***

### workflowId?

> `optional` **workflowId**: `string`

Defined in: [src/repositories/notification.repository.ts:13](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/notification.repository.ts#L13)
