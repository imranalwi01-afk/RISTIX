[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: formatApprovalRequiredResponse()

> **formatApprovalRequiredResponse**(`request`): [`ApprovalResponse`](../interfaces/ApprovalResponse.md)

Defined in: [src/lib/approval-helpers.ts:78](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L78)

Format response when approval is required

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

[`ApprovalResponse`](../interfaces/ApprovalResponse.md)
