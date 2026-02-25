[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: extractPendingData()

> **extractPendingData**\<`T`\>(`request`): `T` \| `null`

Defined in: [src/lib/approval-helpers.ts:119](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L119)

Extract original request data from approval request

## Type Parameters

### T

`T`

## Parameters

### request

#### approvalsReceived

`number`

#### approvalsRequired

`number`

#### completedAt

`Date` \| `null`

#### completedBy

`string` \| `null`

#### createdAt

`Date`

#### currentLevel

`number`

#### description

`string` \| `null`

#### entityId

`string` \| `null`

#### entityType

`string`

#### expiresAt

`Date` \| `null`

#### id

`string`

#### impactLevel

`string` \| `null`

#### matrixId

`string` \| `null`

#### requestData

`Record`\<`string`, `unknown`\> \| `null`

#### requestedBy

`string`

#### status

`string`

#### tenantId

`string`

#### title

`string`

## Returns

`T` \| `null`
