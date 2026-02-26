[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: buildApprovalPermission()

> **buildApprovalPermission**(`entityType`, `operation`): `string`

Defined in: [src/lib/approval-helpers.ts:170](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/lib/approval-helpers.ts#L170)

Build approval permission code from entity and operation
Example: 'user' + 'create' => 'approval.user.create'

## Parameters

### entityType

`string`

### operation

`"update"` | `"delete"` | `"create"`

## Returns

`string`
