[**Backend API Reference v1.0.0**](../../../README.md)

***

# Interface: CreateNotificationInput

Defined in: src/repositories/notification.repository.ts:10

## Properties

### actionUrl?

> `optional` **actionUrl**: `string`

Defined in: src/repositories/notification.repository.ts:18

***

### approvalRequestId?

> `optional` **approvalRequestId**: `string`

Defined in: src/repositories/notification.repository.ts:12

***

### channel?

> `optional` **channel**: `"email"` \| `"in_app"` \| `"socket"` \| `"webhook"`

Defined in: src/repositories/notification.repository.ts:26

***

### deliveredAt?

> `optional` **deliveredAt**: `Date`

Defined in: src/repositories/notification.repository.ts:28

***

### deliveryStatus?

> `optional` **deliveryStatus**: `"pending"` \| `"sent"` \| `"failed"` \| `"read"`

Defined in: src/repositories/notification.repository.ts:27

***

### entityId?

> `optional` **entityId**: `string`

Defined in: src/repositories/notification.repository.ts:20

***

### entityType?

> `optional` **entityType**: `string`

Defined in: src/repositories/notification.repository.ts:19

***

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: src/repositories/notification.repository.ts:29

***

### message

> **message**: `string`

Defined in: src/repositories/notification.repository.ts:17

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: src/repositories/notification.repository.ts:23

***

### roleTargets?

> `optional` **roleTargets**: `string`[]

Defined in: src/repositories/notification.repository.ts:25

***

### severity

> **severity**: `"info"` \| `"error"` \| `"warning"` \| `"success"`

Defined in: src/repositories/notification.repository.ts:15

***

### source?

> `optional` **source**: `string`

Defined in: src/repositories/notification.repository.ts:21

***

### tenantId

> **tenantId**: `string`

Defined in: src/repositories/notification.repository.ts:11

***

### title

> **title**: `string`

Defined in: src/repositories/notification.repository.ts:16

***

### triggeredBy?

> `optional` **triggeredBy**: `string`

Defined in: src/repositories/notification.repository.ts:22

***

### type

> **type**: `string`

Defined in: src/repositories/notification.repository.ts:14

***

### userTargets?

> `optional` **userTargets**: `string`[]

Defined in: src/repositories/notification.repository.ts:24

***

### workflowId?

> `optional` **workflowId**: `string`

Defined in: src/repositories/notification.repository.ts:13
