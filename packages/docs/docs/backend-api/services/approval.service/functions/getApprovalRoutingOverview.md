[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getApprovalRoutingOverview()

> **getApprovalRoutingOverview**(`input`): `Effect`\<[`ApprovalRoutingOverview`](../interfaces/ApprovalRoutingOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>

Defined in: [src/services/approval.service.ts:1415](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/approval.service.ts#L1415)

Get matrix/routing overview and potential approvers for each level.
Use this in UI so users know exactly who should review a request.

## Parameters

### input

#### bankingMode?

`string`

#### department?

`string`

#### entityType?

`string`

#### operation?

`"update"` \| `"delete"` \| `"create"`

#### tenantId

`string`

## Returns

`Effect`\<[`ApprovalRoutingOverview`](../interfaces/ApprovalRoutingOverview.md)[], [`DatabaseError`](../../../lib/errors/classes/DatabaseError.md)\>
